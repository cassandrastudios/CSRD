'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ESGMetric } from '@/types'
import { Upload, CheckCircle, Clock, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const sampleMetrics = [
  'Greenhouse Gas Emissions (Scope 1)',
  'Greenhouse Gas Emissions (Scope 2)',
  'Greenhouse Gas Emissions (Scope 3)',
  'Energy Consumption',
  'Water Usage',
  'Waste Generated',
  'Employee Diversity Metrics',
  'Health & Safety Incidents',
  'Training Hours per Employee',
  'Supplier Code of Conduct Compliance',
  'Community Investment',
  'Customer Satisfaction Score',
  'Board Diversity',
  'Executive Compensation Ratio',
  'Anti-Corruption Training Completion'
]

export function DataHub() {
  const [metrics, setMetrics] = useState<ESGMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [newMetric, setNewMetric] = useState('')
  const [newOwner, setNewOwner] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchMetrics()
  }, [])

  const fetchMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('esg_metrics')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMetrics(data || [])
    } catch (error: any) {
      toast.error('Failed to load metrics: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const addMetric = async () => {
    if (!newMetric.trim() || !newOwner.trim()) {
      toast.error('Please fill in all fields')
      return
    }

    try {
      const { error } = await supabase
        .from('esg_metrics')
        .insert({
          metric_name: newMetric,
          owner: newOwner,
          status: 'not_started'
        })

      if (error) throw error

      setNewMetric('')
      setNewOwner('')
      fetchMetrics()
      toast.success('Metric added successfully')
    } catch (error: any) {
      toast.error('Failed to add metric: ' + error.message)
    }
  }

  const updateMetricStatus = async (id: string, status: ESGMetric['status']) => {
    try {
      const { error } = await supabase
        .from('esg_metrics')
        .update({ status })
        .eq('id', id)

      if (error) throw error

      setMetrics(prev => prev.map(m => 
        m.id === id ? { ...m, status } : m
      ))
      toast.success('Status updated')
    } catch (error: any) {
      toast.error('Failed to update status: ' + error.message)
    }
  }

  const addSampleMetrics = async () => {
    try {
      const sampleData = sampleMetrics.map(metric => ({
        metric_name: metric,
        owner: 'TBD',
        status: 'not_started' as const
      }))

      const { error } = await supabase
        .from('esg_metrics')
        .insert(sampleData)

      if (error) throw error

      fetchMetrics()
      toast.success('Sample metrics added')
    } catch (error: any) {
      toast.error('Failed to add sample metrics: ' + error.message)
    }
  }

  const getStatusIcon = (status: ESGMetric['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in_progress':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: ESGMetric['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const completedCount = metrics.filter(m => m.status === 'completed').length
  const progress = metrics.length > 0 ? (completedCount / metrics.length) * 100 : 0

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
          <h1 className="text-3xl font-bold text-gray-900">Data Collection Hub</h1>
          <p className="text-gray-600 mt-2">
            Manage your ESG metrics and data collection progress
          </p>
        </div>

        {/* Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Collection Progress</CardTitle>
            <CardDescription>
              Track your ESG data collection progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{Math.round(progress)}%</span>
                <span className="text-sm text-gray-500">
                  {completedCount} of {metrics.length} metrics completed
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Add New Metric */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Metric</CardTitle>
            <CardDescription>
              Add a new ESG metric to track
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                placeholder="Metric name"
                value={newMetric}
                onChange={(e) => setNewMetric(e.target.value)}
              />
              <Input
                placeholder="Owner"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
              />
              <Button onClick={addMetric}>
                Add Metric
              </Button>
            </div>
            <div className="mt-4">
              <Button variant="outline" onClick={addSampleMetrics}>
                Add Sample Metrics
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Table */}
        <Card>
          <CardHeader>
            <CardTitle>ESG Metrics</CardTitle>
            <CardDescription>
              Manage your ESG metrics and their collection status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Metric</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Owner</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Evidence</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((metric) => (
                    <tr key={metric.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{metric.metric_name}</td>
                      <td className="py-3 px-4">{metric.owner}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(metric.status)}`}>
                          {getStatusIcon(metric.status)}
                          <span className="ml-1 capitalize">{metric.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {metric.evidence_url ? (
                          <a 
                            href={metric.evidence_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Evidence
                          </a>
                        ) : (
                          <Button size="sm" variant="outline">
                            <Upload className="h-4 w-4 mr-1" />
                            Upload
                          </Button>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          {metric.status !== 'completed' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateMetricStatus(metric.id, 'in_progress')}
                            >
                              Start
                            </Button>
                          )}
                          {metric.status === 'in_progress' && (
                            <Button
                              size="sm"
                              onClick={() => updateMetricStatus(metric.id, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
