'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Layout } from './layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  BarChart,
  Bar
} from 'recharts'
import { 
  Search, 
  Upload, 
  Users, 
  FileText, 
  CheckCircle, 
  Clock,
  Plus,
  Download,
  Share2,
  Target,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  MapPin,
  UserCheck,
  BarChart3,
  FileDown,
  History
} from 'lucide-react'
import toast from 'react-hot-toast'

// Simple types for existing schema
interface SimpleTopic {
  id: number
  code: string
  name: string
  description: string
  category: string
  created_at: string
}

interface SimpleScore {
  id: string
  organization_id: string
  esrs_topic_id: number
  impact_materiality: number
  financial_materiality: number
  created_at: string
  updated_at: string
}

export function DoubleMaterialityAssessmentSimple() {
  // State management
  const [topics, setTopics] = useState<SimpleTopic[]>([])
  const [selectedTopics, setSelectedTopics] = useState<number[]>([])
  const [scores, setScores] = useState<SimpleScore[]>([])
  
  // UI state
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [selectedTopic, setSelectedTopic] = useState<SimpleTopic | null>(null)
  const [activeTab, setActiveTab] = useState('topics')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showOnlySelected, setShowOnlySelected] = useState(false)
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'category'>('name')
  
  const supabase = createClient()
  const debouncedUpdate = useRef<NodeJS.Timeout>()

  // Fetch all data
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
      console.log('Fetching ESRS topics and materiality assessments...')
      
      const [topicsResult, scoresResult] = await Promise.all([
        supabase.from('esrs_topics').select('*').order('code'),
        supabase.from('materiality_assessments').select('*')
      ])

      console.log('Topics result:', topicsResult)
      console.log('Scores result:', scoresResult)

      if (topicsResult.error) {
        console.error('Topics error:', topicsResult.error)
        throw topicsResult.error
      }
      if (scoresResult.error) {
        console.error('Scores error:', scoresResult.error)
        throw scoresResult.error
      }

      const topicsData = topicsResult.data || []
      const scoresData = scoresResult.data || []

      console.log('Topics data:', topicsData)
      console.log('Scores data:', scoresData)

      // If no topics exist, populate them
      if (topicsData.length === 0) {
        console.log('No ESRS topics found, populating sample data...')
        try {
          const response = await fetch('/api/populate-esrs-topics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          
          if (response.ok) {
            const result = await response.json()
            console.log('Successfully populated ESRS topics:', result.message)
            
            // Fetch topics again after populating
            const { data: newTopicsData, error: newTopicsError } = await supabase
              .from('esrs_topics')
              .select('*')
              .order('code')
            
            if (newTopicsError) throw newTopicsError
            console.log('New topics data after population:', newTopicsData)
            setTopics(newTopicsData || [])
          } else {
            console.error('Failed to populate ESRS topics')
            // Fallback: create sample topics locally
            const fallbackTopics = [
              { id: 1, code: 'E1', name: 'Climate Change', description: 'Climate change mitigation and adaptation measures', category: 'Environmental' },
              { id: 2, code: 'E2', name: 'Pollution', description: 'Pollution prevention and control', category: 'Environmental' },
              { id: 3, code: 'S1', name: 'Own Workforce', description: 'Rights and working conditions of workforce', category: 'Social' },
              { id: 4, code: 'G1', name: 'Business Conduct', description: 'Business ethics and conduct', category: 'Governance' }
            ]
            console.log('Using fallback topics:', fallbackTopics)
            setTopics(fallbackTopics)
          }
        } catch (populateError) {
          console.error('Error populating ESRS topics:', populateError)
          // Fallback: create sample topics locally
          const fallbackTopics = [
            { id: 1, code: 'E1', name: 'Climate Change', description: 'Climate change mitigation and adaptation measures', category: 'Environmental' },
            { id: 2, code: 'E2', name: 'Pollution', description: 'Pollution prevention and control', category: 'Environmental' },
            { id: 3, code: 'S1', name: 'Own Workforce', description: 'Rights and working conditions of workforce', category: 'Social' },
            { id: 4, code: 'G1', name: 'Business Conduct', description: 'Business ethics and conduct', category: 'Governance' }
          ]
          console.log('Using fallback topics after error:', fallbackTopics)
          setTopics(fallbackTopics)
        }
      } else {
        console.log('Using existing topics data')
        setTopics(topicsData)
      }

      setScores(scoresData)

      // Auto-select topics that have scores
      const scoredTopicIds = scoresData.map(s => s.esrs_topic_id)
      setSelectedTopics(scoredTopicIds)

    } catch (error: any) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Debounced update function
  const updateScore = useCallback((topicId: number, impactScore: number, financialScore: number) => {
    if (debouncedUpdate.current) {
      clearTimeout(debouncedUpdate.current)
    }

    // Update local state immediately
    setScores(prev => {
      const existing = prev.find(s => s.esrs_topic_id === topicId)
      if (existing) {
        return prev.map(s => 
          s.esrs_topic_id === topicId 
            ? { ...s, impact_materiality: impactScore, financial_materiality: financialScore }
            : s
        )
      } else {
        return [...prev, {
          id: '',
          organization_id: '',
          esrs_topic_id: topicId,
          impact_materiality: impactScore,
          financial_materiality: financialScore,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]
      }
    })

    // Debounce database update
    debouncedUpdate.current = setTimeout(async () => {
      setSaving(true)
      try {
        const { error } = await supabase
          .from('materiality_assessments')
          .upsert({
            esrs_topic_id: topicId,
            impact_materiality: impactScore,
            financial_materiality: financialScore
          })

        if (error) throw error
        toast.success('Score saved')
      } catch (error: any) {
        toast.error('Failed to save score: ' + error.message)
      } finally {
        setSaving(false)
      }
    }, 1000)
  }, [supabase])

  const getScore = (topicId: number) => {
    return scores.find(s => s.esrs_topic_id === topicId)
  }

  // Filter and sort topics
  const filteredTopics = topics.filter(topic => {
    if (!topic || !topic.name || !topic.description) return false
    const matchesSearch = topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || topic.category === selectedCategory
    const matchesSelected = !showOnlySelected || selectedTopics.includes(topic.id)
    return matchesSearch && matchesCategory && matchesSelected
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'category':
        return a.category.localeCompare(b.category)
      case 'score':
        const scoreA = getScore(a.id)?.total || 0
        const scoreB = getScore(b.id)?.total || 0
        return scoreB - scoreA
      default:
        return 0
    }
  })

  // Calculate progress
  const progress = selectedTopics.length > 0 ? (scores.length / selectedTopics.length) * 100 : 0

  // Prepare data for visualizations
  const matrixData = scores.map(score => {
    const topic = topics.find(t => t.id === score.esrs_topic_id)
    return {
      name: topic?.name || 'Unknown',
      code: topic?.code || '',
      impact: score.impact_materiality,
      financial: score.financial_materiality,
      category: topic?.category || 'Unknown',
      materiality: (score.impact_materiality + score.financial_materiality) / 2 >= 3 ? 'Material' : 'Non-Material'
    }
  })

  const categoryData = topics.reduce((acc, topic) => {
    const category = topic.category
    if (!acc[category]) {
      acc[category] = { total: 0, selected: 0, scored: 0 }
    }
    acc[category].total++
    if (selectedTopics.includes(topic.id)) {
      acc[category].selected++
    }
    if (scores.find(s => s.esrs_topic_id === topic.id)) {
      acc[category].scored++
    }
    return acc
  }, {} as Record<string, { total: number; selected: number; scored: number }>)

  const categoryChartData = Object.entries(categoryData).map(([category, data]) => ({
    category,
    selected: data.selected,
    scored: data.scored,
    remaining: data.total - data.selected
  }))

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">Double Materiality Assessment</h1>
            <p className="text-gray-600 mt-2">
              ESRS-compliant materiality assessment with stakeholder engagement
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}>
              <FileDown className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button>
              <Share2 className="w-4 h-4 mr-2" />
              Share Assessment
            </Button>
          </div>
        </div>

        {/* Progress Overview */}
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
              Track your progress through the materiality assessment process. Each ESRS topic requires individual assessment for both Impact and Financial materiality as required by CSRD.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{selectedTopics.length}</div>
                <div className="text-sm text-gray-500">Topics Selected</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{scores.length}</div>
                <div className="text-sm text-gray-500">Topics Scored</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {scores.filter(s => (s.impact_materiality + s.financial_materiality) / 2 >= 3).length}
                </div>
                <div className="text-sm text-gray-500">Material Topics</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">{topics.length}</div>
                <div className="text-sm text-gray-500">Total Topics</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
            <TabsTrigger value="scoring">Scoring</TabsTrigger>
            <TabsTrigger value="matrix">Matrix</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Topics Tab */}
          <TabsContent value="topics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Topic Selection */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>ESRS Topic Library</CardTitle>
                    <div className="space-y-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="Search topics..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['All', 'Environmental', 'Social', 'Governance'].map(category => (
                          <Button
                            key={category}
                            variant={selectedCategory === category ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setSelectedCategory(category)}
                          >
                            {category}
                          </Button>
                        ))}
                      </div>
                      
                      {/* Additional Controls */}
                      <div className="flex flex-wrap gap-2 items-center">
                        <Button
                          variant={showOnlySelected ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setShowOnlySelected(!showOnlySelected)}
                        >
                          {showOnlySelected ? 'Show All' : 'Show Selected Only'}
                        </Button>
                        
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white"
                        >
                          <option value="name">Sort by Name</option>
                          <option value="category">Sort by Category</option>
                          <option value="score">Sort by Score</option>
                        </select>
                        
                        <div className="flex border border-gray-300 rounded-md">
                          <Button
                            variant={viewMode === 'grid' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('grid')}
                            className="rounded-r-none"
                          >
                            Grid
                          </Button>
                          <Button
                            variant={viewMode === 'list' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            className="rounded-l-none"
                          >
                            List
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-96 overflow-y-auto">
                      {filteredTopics.map(topic => (
                        <div
                          key={topic.id}
                          className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                            selectedTopics.includes(topic.id) ? 'bg-blue-50 border-blue-200' : ''
                          }`}
                          onClick={() => {
                            if (selectedTopics.includes(topic.id)) {
                              setSelectedTopics(prev => prev.filter(id => id !== topic.id))
                            } else {
                              setSelectedTopics(prev => [...prev, topic.id])
                            }
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={selectedTopics.includes(topic.id)}
                                  onChange={() => {}}
                                  className="rounded"
                                />
                                <div>
                                  <div className="font-medium">{topic.name}</div>
                                  <div className="text-sm text-gray-500">{topic.code}</div>
                                </div>
                              </div>
                              <div className="text-sm text-gray-600 mt-1">{topic.description}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{topic.category}</Badge>
                              {getScore(topic.id) && (
                                <Badge variant={
                                  (getScore(topic.id)!.impact_materiality + getScore(topic.id)!.financial_materiality) / 2 >= 3 
                                    ? 'default' : 'secondary'
                                }>
                                  {(getScore(topic.id)!.impact_materiality + getScore(topic.id)!.financial_materiality) / 2 >= 3 
                                    ? 'Material' : 'Non-Material'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Topic Details */}
              <div className="lg:col-span-1">
                {selectedTopic ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedTopic.name}</CardTitle>
                      <CardDescription>{selectedTopic.code}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Description</h3>
                        <p className="text-sm text-gray-600">{selectedTopic.description}</p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">Category</h3>
                        <Badge variant="outline">{selectedTopic.category}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Topic</h3>
                        <p className="text-gray-500">Choose a topic to view details and begin assessment</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Stakeholders Tab */}
          <TabsContent value="stakeholders" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Stakeholder Engagement</CardTitle>
                  <Button onClick={() => toast.info('Stakeholder management coming soon!')}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Stakeholder
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Stakeholder Management</h3>
                  <p className="text-gray-500 mb-4">Advanced stakeholder engagement features coming soon</p>
                  <Button variant="outline">Learn More</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scoring Tab */}
          <TabsContent value="scoring" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {selectedTopics.map(topicId => {
                const topic = topics.find(t => t.id === topicId)
                const score = getScore(topicId)
                if (!topic) return null

                return (
                  <Card key={topicId}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        {topic.name}
                        <Badge variant="outline">{topic.code}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-medium mb-4">Impact Materiality</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Inside-out: How your organization affects people and environment
                          </p>
                          <div className="space-y-2">
                            <label className="text-sm">Impact Level: {score?.impact_materiality || 1}</label>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={score?.impact_materiality || 1}
                              onChange={(e) => updateScore(topicId, parseInt(e.target.value), score?.financial_materiality || 1)}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Low (1)</span>
                              <span>High (5)</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-medium mb-4">Financial Materiality</h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Outside-in: How sustainability issues affect your organization
                          </p>
                          <div className="space-y-2">
                            <label className="text-sm">Financial Level: {score?.financial_materiality || 1}</label>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={score?.financial_materiality || 1}
                              onChange={(e) => updateScore(topicId, score?.impact_materiality || 1, parseInt(e.target.value))}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500">
                              <span>Low (1)</span>
                              <span>High (5)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-gray-600">Total Materiality Score</div>
                            <div className="text-2xl font-bold">
                              {score ? ((score.impact_materiality + score.financial_materiality) / 2).toFixed(1) : '1.0'}
                            </div>
                          </div>
                          <Badge variant={score && (score.impact_materiality + score.financial_materiality) / 2 >= 3 ? 'default' : 'secondary'}>
                            {score && (score.impact_materiality + score.financial_materiality) / 2 >= 3 ? 'Material' : 'Non-Material'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Matrix Tab */}
          <TabsContent value="matrix" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Materiality Matrix</CardTitle>
                <CardDescription>
                  Visualize materiality scores with stakeholder influence
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart data={matrixData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        type="number" 
                        dataKey="financial" 
                        name="Financial Materiality"
                        domain={[0, 5]}
                        tickCount={6}
                      />
                      <YAxis 
                        type="number" 
                        dataKey="impact" 
                        name="Impact Materiality"
                        domain={[0, 5]}
                        tickCount={6}
                      />
                      <Tooltip 
                        formatter={(value, name, props) => [
                          value, 
                          name === 'impact' ? 'Impact Materiality' : 'Financial Materiality'
                        ]}
                        labelFormatter={(label, props) => 
                          `${(props as any).payload?.name} (${(props as any).payload?.code})`
                        }
                      />
                      <Scatter dataKey="impact" fill="#8884d8">
                        {matrixData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={
                              entry.materiality === 'Material' ? '#ef4444' : '#10b981'
                            } 
                          />
                        ))}
                      </Scatter>
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Progress by Category</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryChartData}>
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="selected" fill="#3b82f6" />
                        <Bar dataKey="scored" fill="#10b981" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Materiality Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Material Topics</span>
                      <span className="font-medium">
                        {scores.filter(s => (s.impact_materiality + s.financial_materiality) / 2 >= 3).length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Non-Material Topics</span>
                      <span className="font-medium">
                        {scores.filter(s => (s.impact_materiality + s.financial_materiality) / 2 < 3).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment Reports</CardTitle>
                <CardDescription>
                  Generate and export materiality assessment reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-24 flex-col">
                    <FileText className="w-8 h-8 mb-2" />
                    <span>Materiality Report</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <BarChart3 className="w-8 h-8 mb-2" />
                    <span>Matrix Visualization</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Users className="w-8 h-8 mb-2" />
                    <span>Stakeholder Summary</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Target className="w-8 h-8 mb-2" />
                    <span>IRO Analysis</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <History className="w-8 h-8 mb-2" />
                    <span>Audit Trail</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Download className="w-8 h-8 mb-2" />
                    <span>Export Data</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}
