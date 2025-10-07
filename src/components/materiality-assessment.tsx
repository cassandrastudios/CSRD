'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Layout } from './layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ESRS_Topic, MaterialityAssessment as MaterialityAssessmentType } from '@/types'
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import toast from 'react-hot-toast'

export function MaterialityAssessment() {
  const [topics, setTopics] = useState<ESRS_Topic[]>([])
  const [assessments, setAssessments] = useState<MaterialityAssessmentType[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debouncedUpdate.current) {
        clearTimeout(debouncedUpdate.current)
      }
    }
  }, [])

  const fetchData = async () => {
    try {
      const [topicsResult, assessmentsResult] = await Promise.all([
        supabase.from('esrs_topics').select('*').order('code'),
        supabase.from('materiality_assessments').select('*')
      ])

      if (topicsResult.error) throw topicsResult.error
      if (assessmentsResult.error) throw assessmentsResult.error

      setTopics(topicsResult.data)
      setAssessments(assessmentsResult.data)
    } catch (error: any) {
      toast.error('Failed to load data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Debounced update function
  const debouncedUpdate = useRef<NodeJS.Timeout>()
  
  const updateAssessment = useCallback((topicId: string, impact: number, financial: number) => {
    // Clear existing timeout
    if (debouncedUpdate.current) {
      clearTimeout(debouncedUpdate.current)
    }

    // Update local state immediately for responsive UI
    setAssessments(prev => {
      const existing = prev.find(a => a.esrs_topic_id === topicId)
      if (existing) {
        return prev.map(a => 
          a.esrs_topic_id === topicId 
            ? { ...a, impact_materiality: impact, financial_materiality: financial }
            : a
        )
      } else {
        return [...prev, {
          id: '',
          organization_id: '',
          esrs_topic_id: topicId,
          impact_materiality: impact,
          financial_materiality: financial,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]
      }
    })

    // Debounce the database update
    debouncedUpdate.current = setTimeout(async () => {
      setSaving(true)
      try {
        const { error } = await supabase
          .from('materiality_assessments')
          .upsert({
            esrs_topic_id: topicId,
            impact_materiality: impact,
            financial_materiality: financial
          })

        if (error) throw error
        // Only show success toast once per batch of updates
        toast.success('Assessment saved')
      } catch (error: any) {
        toast.error('Failed to save assessment: ' + error.message)
      } finally {
        setSaving(false)
      }
    }, 1000) // Wait 1 second after last change
  }, [supabase])

  const getAssessment = (topicId: string) => {
    return assessments.find(a => a.esrs_topic_id === topicId)
  }

  const chartData = topics.map(topic => {
    const assessment = getAssessment(topic.id)
    return {
      name: topic.code,
      title: topic.title,
      impact: assessment?.impact_materiality || 0,
      financial: assessment?.financial_materiality || 0,
      category: topic.category
    }
  })

  const progress = (assessments.length / topics.length) * 100

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Materiality Assessment</h1>
          <p className="text-gray-600 mt-2">
            Assess the materiality of each ESRS topic for your organization
          </p>
        </div>

        {/* Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Assessment Progress
              {saving && (
                <div className="flex items-center text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Saving...
                </div>
              )}
            </CardTitle>
            <CardDescription>
              Complete the materiality assessment for all ESRS topics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{Math.round(progress)}%</span>
                <span className="text-sm text-gray-500">
                  {assessments.length} of {topics.length} topics assessed
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Materiality Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Materiality Matrix</CardTitle>
            <CardDescription>
              Visual representation of your materiality assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    type="number" 
                    dataKey="financial" 
                    name="Financial Materiality"
                    domain={[0, 100]}
                    label={{ value: 'Financial Materiality', position: 'insideBottom', offset: -5 }}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="impact" 
                    name="Impact Materiality"
                    domain={[0, 100]}
                    label={{ value: 'Impact Materiality', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    formatter={(value, name, props) => [
                      value, 
                      name === 'impact' ? 'Impact Materiality' : 'Financial Materiality'
                    ]}
                    labelFormatter={(label, props) => 
                      `${(props as any).payload?.title} (${(props as any).payload?.name})`
                    }
                  />
                  <Scatter dataKey="impact" fill="#3b82f6">
                    {chartData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.category === 'Environmental' ? '#10b981' :
                          entry.category === 'Social' ? '#f59e0b' :
                          '#8b5cf6'
                        } 
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Assessment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => {
            const assessment = getAssessment(topic.id)
            return (
              <Card key={topic.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{topic.code}</CardTitle>
                  <CardDescription>{topic.title}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Impact Materiality: {assessment?.impact_materiality || 0}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={assessment?.impact_materiality || 0}
                      onChange={(e) => updateAssessment(
                        topic.id, 
                        parseInt(e.target.value), 
                        assessment?.financial_materiality || 0
                      )}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Financial Materiality: {assessment?.financial_materiality || 0}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={assessment?.financial_materiality || 0}
                      onChange={(e) => updateAssessment(
                        topic.id, 
                        assessment?.impact_materiality || 0,
                        parseInt(e.target.value)
                      )}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <Button variant="outline">
            Save Draft
          </Button>
          <Button>
            Continue to Data Hub
          </Button>
        </div>
      </div>
    </Layout>
  )
}
