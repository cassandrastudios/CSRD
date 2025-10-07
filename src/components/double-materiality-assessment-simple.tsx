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
  History,
  Workflow
} from 'lucide-react'
import toast from 'react-hot-toast'
import { ValueChainCreator } from './value-chain/ValueChainCreator'
import { StakeholderManagement } from './stakeholder-management'

// Simple types for existing schema
interface SimpleTopic {
  id: number
  code: string
  name: string
  description: string
  category: string
  parent_id: number | null
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
      console.log('Setting up ESRS topics...')
      
      // Always use sample topics with subtopics - no database dependency
      const sampleTopics = [
        // Environmental Topics with Subtopics
        { id: 1, code: 'E1', name: 'Climate Change', description: 'Climate change mitigation and adaptation measures', category: 'Environmental', parent_id: null, created_at: new Date().toISOString() },
        { id: 101, code: 'E1-1', name: 'Climate Change Mitigation', description: 'Greenhouse gas emissions reduction and energy transition', category: 'Environmental', parent_id: 1, created_at: new Date().toISOString() },
        { id: 102, code: 'E1-2', name: 'Climate Change Adaptation', description: 'Adaptation measures and climate risk management', category: 'Environmental', parent_id: 1, created_at: new Date().toISOString() },
        { id: 103, code: 'E1-3', name: 'Energy Consumption and Mix', description: 'Energy consumption patterns and renewable energy transition', category: 'Environmental', parent_id: 1, created_at: new Date().toISOString() },
        
        { id: 2, code: 'E2', name: 'Pollution', description: 'Pollution prevention and control measures', category: 'Environmental', parent_id: null, created_at: new Date().toISOString() },
        { id: 201, code: 'E2-1', name: 'Air Pollution', description: 'Air emissions and air quality management', category: 'Environmental', parent_id: 2, created_at: new Date().toISOString() },
        { id: 202, code: 'E2-2', name: 'Water Pollution', description: 'Water discharge and water quality management', category: 'Environmental', parent_id: 2, created_at: new Date().toISOString() },
        { id: 203, code: 'E2-3', name: 'Soil Pollution', description: 'Soil contamination and remediation', category: 'Environmental', parent_id: 2, created_at: new Date().toISOString() },
        
        { id: 3, code: 'E3', name: 'Water and Marine Resources', description: 'Water and marine resource management', category: 'Environmental', parent_id: null, created_at: new Date().toISOString() },
        { id: 301, code: 'E3-1', name: 'Water Consumption', description: 'Water use efficiency and water stress management', category: 'Environmental', parent_id: 3, created_at: new Date().toISOString() },
        { id: 302, code: 'E3-2', name: 'Marine Biodiversity', description: 'Marine ecosystem protection and sustainable fishing', category: 'Environmental', parent_id: 3, created_at: new Date().toISOString() },
        
        { id: 4, code: 'E4', name: 'Biodiversity and Ecosystems', description: 'Biodiversity and ecosystem protection', category: 'Environmental', parent_id: null, created_at: new Date().toISOString() },
        { id: 401, code: 'E4-1', name: 'Terrestrial Biodiversity', description: 'Land-based ecosystem protection and habitat conservation', category: 'Environmental', parent_id: 4, created_at: new Date().toISOString() },
        { id: 402, code: 'E4-2', name: 'Species Protection', description: 'Endangered species protection and wildlife management', category: 'Environmental', parent_id: 4, created_at: new Date().toISOString() },
        
        { id: 5, code: 'E5', name: 'Resource Use and Circular Economy', description: 'Resource efficiency and circular economy practices', category: 'Environmental', parent_id: null, created_at: new Date().toISOString() },
        { id: 501, code: 'E5-1', name: 'Resource Efficiency', description: 'Material efficiency and resource optimization', category: 'Environmental', parent_id: 5, created_at: new Date().toISOString() },
        { id: 502, code: 'E5-2', name: 'Waste Management', description: 'Waste reduction, recycling, and circular economy', category: 'Environmental', parent_id: 5, created_at: new Date().toISOString() },
        
        // Social Topics with Subtopics
        { id: 6, code: 'S1', name: 'Own Workforce', description: 'Rights and working conditions of workforce', category: 'Social', parent_id: null, created_at: new Date().toISOString() },
        { id: 601, code: 'S1-1', name: 'Working Conditions', description: 'Health and safety, working hours, and workplace conditions', category: 'Social', parent_id: 6, created_at: new Date().toISOString() },
        { id: 602, code: 'S1-2', name: 'Equal Treatment and Opportunities', description: 'Diversity, inclusion, and equal opportunities', category: 'Social', parent_id: 6, created_at: new Date().toISOString() },
        { id: 603, code: 'S1-3', name: 'Social Dialogue', description: 'Employee representation and collective bargaining', category: 'Social', parent_id: 6, created_at: new Date().toISOString() },
        
        { id: 7, code: 'S2', name: 'Workers in Value Chain', description: 'Rights of workers in the value chain', category: 'Social', parent_id: null, created_at: new Date().toISOString() },
        { id: 701, code: 'S2-1', name: 'Supply Chain Labor Standards', description: 'Labor rights and working conditions in supply chains', category: 'Social', parent_id: 7, created_at: new Date().toISOString() },
        { id: 702, code: 'S2-2', name: 'Child Labor and Forced Labor', description: 'Prevention of child labor and forced labor', category: 'Social', parent_id: 7, created_at: new Date().toISOString() },
        
        { id: 8, code: 'S3', name: 'Affected Communities', description: 'Rights of affected communities', category: 'Social', parent_id: null, created_at: new Date().toISOString() },
        { id: 801, code: 'S3-1', name: 'Community Impact', description: 'Local community development and impact management', category: 'Social', parent_id: 8, created_at: new Date().toISOString() },
        { id: 802, code: 'S3-2', name: 'Indigenous Rights', description: 'Indigenous peoples rights and cultural heritage', category: 'Social', parent_id: 8, created_at: new Date().toISOString() },
        
        { id: 9, code: 'S4', name: 'Consumers and End-Users', description: 'Consumer and end-user rights', category: 'Social', parent_id: null, created_at: new Date().toISOString() },
        { id: 901, code: 'S4-1', name: 'Product Safety', description: 'Product safety and quality standards', category: 'Social', parent_id: 9, created_at: new Date().toISOString() },
        { id: 902, code: 'S4-2', name: 'Data Privacy', description: 'Consumer data protection and privacy rights', category: 'Social', parent_id: 9, created_at: new Date().toISOString() },
        
        // Governance Topics with Subtopics
        { id: 10, code: 'G1', name: 'Business Conduct', description: 'Business ethics and conduct', category: 'Governance', parent_id: null, created_at: new Date().toISOString() },
        { id: 1001, code: 'G1-1', name: 'Anti-Corruption', description: 'Anti-corruption and anti-bribery measures', category: 'Governance', parent_id: 10, created_at: new Date().toISOString() },
        { id: 1002, code: 'G1-2', name: 'Tax Strategy', description: 'Tax transparency and responsible tax practices', category: 'Governance', parent_id: 10, created_at: new Date().toISOString() },
        
        { id: 11, code: 'G2', name: 'Corporate Culture', description: 'Corporate culture and values', category: 'Governance', parent_id: null, created_at: new Date().toISOString() },
        { id: 1101, code: 'G2-1', name: 'Leadership and Governance', description: 'Board composition and leadership effectiveness', category: 'Governance', parent_id: 11, created_at: new Date().toISOString() },
        { id: 1102, code: 'G2-2', name: 'Organizational Culture', description: 'Values, ethics, and organizational behavior', category: 'Governance', parent_id: 11, created_at: new Date().toISOString() },
        
        { id: 12, code: 'G3', name: 'Management of Material Sustainability Risks', description: 'Risk management and oversight', category: 'Governance', parent_id: null, created_at: new Date().toISOString() },
        { id: 1201, code: 'G3-1', name: 'Risk Management', description: 'Sustainability risk identification and management', category: 'Governance', parent_id: 12, created_at: new Date().toISOString() },
        { id: 1202, code: 'G3-2', name: 'Due Diligence', description: 'Due diligence processes and procedures', category: 'Governance', parent_id: 12, created_at: new Date().toISOString() }
      ]
      
      setTopics(sampleTopics)
      setScores([]) // Start with no scores
      setSelectedTopics([]) // Start with no selected topics
      
      console.log('Topics set:', sampleTopics.length)
      console.log('Scores cleared')
      console.log('Selected topics cleared')

    } catch (error: any) {
      console.error('Error setting up data:', error)
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
    if (!topic || !topic.name || !topic.description) {
      console.log('Filtering out invalid topic:', topic)
      return false
    }
    const matchesSearch = topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         topic.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || topic.category === selectedCategory
    const matchesSelected = !showOnlySelected || selectedTopics.includes(topic.id)
    return matchesSearch && matchesCategory && matchesSelected
  }).sort((a, b) => {
    // First sort by parent_id (main topics first), then by the selected sort criteria
    if (a.parent_id === null && b.parent_id !== null) return -1
    if (a.parent_id !== null && b.parent_id === null) return 1
    if (a.parent_id !== null && b.parent_id !== null && a.parent_id !== b.parent_id) {
      return a.parent_id - b.parent_id
    }
    
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name)
      case 'category':
        return a.category.localeCompare(b.category)
      case 'score':
        const scoreA = getScore(a.id) ? (getScore(a.id)!.impact_materiality + getScore(a.id)!.financial_materiality) / 2 : 0
        const scoreB = getScore(b.id) ? (getScore(b.id)!.impact_materiality + getScore(b.id)!.financial_materiality) / 2 : 0
        return scoreB - scoreA
      default:
        return 0
    }
  })

  console.log('Topics state:', topics.length)
  console.log('Filtered topics:', filteredTopics.length)
  console.log('Search term:', searchTerm)
  console.log('Selected category:', selectedCategory)
  console.log('Show only selected:', showOnlySelected)

  // Calculate progress - only count scores for selected topics
  const actualScores = scores.filter(score => selectedTopics.includes(score.esrs_topic_id))
  const progress = selectedTopics.length > 0 ? (actualScores.length / selectedTopics.length) * 100 : 0

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
              <div className="flex items-center gap-2">
                {saving && (
                  <div className="flex items-center text-sm text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Saving...
                  </div>
                )}
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={async () => {
                    if (confirm('This will clear all your assessment data. Are you sure?')) {
                      try {
                        const response = await fetch('/api/reset-data', { method: 'POST' })
                        const result = await response.json()
                        if (result.success) {
                          toast.success('Data reset successfully!')
                          // Refresh the page to reload data
                          window.location.reload()
                        } else {
                          toast.error('Failed to reset data')
                        }
                      } catch (error) {
                        toast.error('Failed to reset data')
                      }
                    }
                  }}
                >
                  Reset Data
                </Button>
              </div>
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
                <div className="text-3xl font-bold text-green-600">{actualScores.length}</div>
                <div className="text-sm text-gray-500">Topics Scored</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">
                  {actualScores.filter(s => (s.impact_materiality + s.financial_materiality) / 2 >= 3).length}
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
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="value-chain">Value Chain</TabsTrigger>
            <TabsTrigger value="topics">Topics</TabsTrigger>
            <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
            <TabsTrigger value="scoring">Scoring</TabsTrigger>
            <TabsTrigger value="matrix">Matrix</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          {/* Value Chain Tab */}
          <TabsContent value="value-chain" className="space-y-6">
            <div className="h-[600px]">
              <ValueChainCreator />
            </div>
          </TabsContent>

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
                      {loading ? (
                        <div className="p-8 text-center">
                          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading Topics...</h3>
                          <p className="text-gray-500">Setting up ESRS topics...</p>
                        </div>
                      ) : filteredTopics.length === 0 ? (
                        <div className="p-8 text-center">
                          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No Topics Found</h3>
                          <p className="text-gray-500 mb-4">
                            {searchTerm || selectedCategory !== 'All' 
                              ? 'Try adjusting your search or filter criteria'
                              : 'No topics available'
                            }
                          </p>
                          {searchTerm && (
                            <Button 
                              variant="outline" 
                              onClick={() => setSearchTerm('')}
                            >
                              Clear Search
                            </Button>
                          )}
                          <div className="mt-4 text-xs text-gray-400">
                            Debug: Topics: {topics.length}, Filtered: {filteredTopics.length}
                          </div>
                        </div>
                      ) : (
                        filteredTopics.map(topic => {
                          const isMainTopic = topic.parent_id === null
                          const isSubTopic = topic.parent_id !== null
                          
                          return (
                            <div
                              key={topic.id}
                              className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                                selectedTopics.includes(topic.id) ? 'bg-blue-50 border-blue-200' : ''
                              } ${isSubTopic ? 'bg-gray-50/50' : ''}`}
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
                                      onChange={(e) => {
                                        e.stopPropagation()
                                        if (e.target.checked) {
                                          setSelectedTopics(prev => [...prev, topic.id])
                                        } else {
                                          setSelectedTopics(prev => prev.filter(id => id !== topic.id))
                                        }
                                      }}
                                      className="rounded"
                                    />
                                    <div className={`${isSubTopic ? 'ml-6' : ''}`}>
                                      <div className={`font-medium ${isSubTopic ? 'text-sm' : ''}`}>
                                        {topic.name}
                                      </div>
                                      <div className="text-sm text-gray-500">{topic.code}</div>
                                    </div>
                                  </div>
                                  <div className={`text-sm text-gray-600 mt-1 ${isSubTopic ? 'ml-6' : ''}`}>
                                    {topic.description}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  {isMainTopic && (
                                    <Badge variant="outline">{topic.category}</Badge>
                                  )}
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
                          )
                        })
                      )}
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
            <StakeholderManagement organizationId="default-org" />
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
