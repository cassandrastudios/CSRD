'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Layout } from './layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { CheckCircle, XCircle, AlertTriangle, FileText } from 'lucide-react'
import toast from 'react-hot-toast'

interface ComplianceItem {
  id: string
  title: string
  description: string
  category: 'materiality' | 'data' | 'report' | 'assurance'
  status: 'completed' | 'in_progress' | 'not_started'
  required: boolean
}

const complianceItems: ComplianceItem[] = [
  {
    id: 'materiality-assessment',
    title: 'Materiality Assessment',
    description: 'Complete materiality assessment for all ESRS topics',
    category: 'materiality',
    status: 'not_started',
    required: true
  },
  {
    id: 'esg-data-collection',
    title: 'ESG Data Collection',
    description: 'Collect and verify all required ESG metrics',
    category: 'data',
    status: 'not_started',
    required: true
  },
  {
    id: 'report-sections',
    title: 'Report Sections',
    description: 'Draft all required CSRD report sections',
    category: 'report',
    status: 'not_started',
    required: true
  },
  {
    id: 'stakeholder-engagement',
    title: 'Stakeholder Engagement',
    description: 'Document stakeholder engagement process',
    category: 'report',
    status: 'not_started',
    required: true
  },
  {
    id: 'governance-structure',
    title: 'Governance Structure',
    description: 'Establish ESG governance and oversight',
    category: 'assurance',
    status: 'not_started',
    required: true
  },
  {
    id: 'internal-controls',
    title: 'Internal Controls',
    description: 'Implement data quality controls',
    category: 'assurance',
    status: 'not_started',
    required: true
  },
  {
    id: 'external-assurance',
    title: 'External Assurance',
    description: 'Prepare for external assurance process',
    category: 'assurance',
    status: 'not_started',
    required: false
  }
]

export function ComplianceCheck() {
  const [items, setItems] = useState<ComplianceItem[]>(complianceItems)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    checkComplianceStatus()
  }, [])

  const checkComplianceStatus = async () => {
    try {
      // Check materiality assessment completion
      const { data: materialityData } = await supabase
        .from('materiality_assessments')
        .select('id')

      // Check data collection progress
      const { data: metricsData } = await supabase
        .from('esg_metrics')
        .select('status')

      // Check report sections
      const { data: reportData } = await supabase
        .from('report_sections')
        .select('id')

      // Update compliance status based on actual data
      setItems(prev => prev.map(item => {
        let status: ComplianceItem['status'] = 'not_started'

        switch (item.id) {
          case 'materiality-assessment':
            status = materialityData && materialityData.length > 0 ? 'completed' : 'not_started'
            break
          case 'esg-data-collection':
            const completedMetrics = metricsData?.filter(m => m.status === 'completed').length || 0
            const totalMetrics = metricsData?.length || 0
            if (totalMetrics === 0) status = 'not_started'
            else if (completedMetrics === totalMetrics) status = 'completed'
            else status = 'in_progress'
            break
          case 'report-sections':
            status = reportData && reportData.length > 0 ? 'completed' : 'not_started'
            break
          default:
            status = 'not_started'
        }

        return { ...item, status }
      }))
    } catch (error: any) {
      toast.error('Failed to check compliance status: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: ComplianceItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'in_progress':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      default:
        return <XCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: ComplianceItem['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: ComplianceItem['category']) => {
    return <FileText className="h-4 w-4" />
  }

  const completedCount = items.filter(item => item.status === 'completed').length
  const requiredCompleted = items.filter(item => item.required && item.status === 'completed').length
  const requiredTotal = items.filter(item => item.required).length
  const overallProgress = requiredTotal > 0 ? (requiredCompleted / requiredTotal) * 100 : 0

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
          <h1 className="text-3xl font-bold text-gray-900">Compliance Check</h1>
          <p className="text-gray-600 mt-2">
            Track your CSRD compliance progress and requirements
          </p>
        </div>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Overview</CardTitle>
            <CardDescription>
              Your overall CSRD compliance progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{Math.round(overallProgress)}%</div>
                  <div className="text-sm text-gray-500">Overall Progress</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">{completedCount}</div>
                  <div className="text-sm text-gray-500">Items Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{items.length - completedCount}</div>
                  <div className="text-sm text-gray-500">Items Remaining</div>
                </div>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Compliance Items by Category */}
        {['materiality', 'data', 'report', 'assurance'].map(category => {
          const categoryItems = items.filter(item => item.category === category)
          const categoryCompleted = categoryItems.filter(item => item.status === 'completed').length
          const categoryProgress = categoryItems.length > 0 ? (categoryCompleted / categoryItems.length) * 100 : 0

          return (
            <Card key={category}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="capitalize">{category} Requirements</CardTitle>
                    <CardDescription>
                      {categoryCompleted} of {categoryItems.length} items completed
                    </CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{Math.round(categoryProgress)}%</div>
                    <Progress value={categoryProgress} className="h-2 w-24" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <h4 className="font-medium">{item.title}</h4>
                          <p className="text-sm text-gray-500">{item.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                        {item.required && (
                          <span className="text-xs text-red-500 font-medium">Required</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Next Steps</h3>
                <p className="text-sm text-gray-500">
                  Focus on completing required items to meet CSRD compliance
                </p>
              </div>
              <Button onClick={checkComplianceStatus}>
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
