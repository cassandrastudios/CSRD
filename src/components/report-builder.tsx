'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Layout } from './layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ReportSection } from '@/types'
import { Save, Download, Wand2 } from 'lucide-react'
import { TipTapEditor } from './tiptap-editor'
import toast from 'react-hot-toast'

export function ReportBuilder() {
  const [sections, setSections] = useState<ReportSection[]>([])
  const [currentSection, setCurrentSection] = useState<ReportSection | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('report_sections')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setSections(data || [])
    } catch (error: any) {
      toast.error('Failed to load sections: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const createNewSection = () => {
    const newSection: ReportSection = {
      id: '',
      organization_id: '',
      section_title: '',
      content: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    setCurrentSection(newSection)
  }

  const saveSection = async () => {
    if (!currentSection || !currentSection.section_title.trim()) {
      toast.error('Please enter a section title')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('report_sections')
        .upsert({
          id: currentSection.id || undefined,
          section_title: currentSection.section_title,
          content: currentSection.content
        })

      if (error) throw error

      toast.success('Section saved successfully')
      fetchSections()
      setCurrentSection(null)
    } catch (error: any) {
      toast.error('Failed to save section: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const generateAIContent = async () => {
    if (!currentSection) return

    toast.loading('Generating AI content...', { id: 'ai-generate' })
    
    try {
      // This would integrate with OpenAI API
      // For now, we'll simulate AI generation
      const aiContent = `This is AI-generated content for the section "${currentSection.section_title}". 

Based on your organization's data and CSRD requirements, this section should include:

1. Key performance indicators and metrics
2. Materiality assessment results
3. Stakeholder engagement findings
4. Risk and opportunity analysis
5. Future outlook and targets

[This is a placeholder for actual AI-generated content based on your collected data]`

      setCurrentSection({
        ...currentSection,
        content: aiContent
      })

      toast.success('AI content generated!', { id: 'ai-generate' })
    } catch (error: any) {
      toast.error('Failed to generate AI content: ' + error.message, { id: 'ai-generate' })
    }
  }

  const exportReport = () => {
    const reportData = {
      sections: sections,
      generated_at: new Date().toISOString(),
      version: '1.0'
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'csrd-report-draft.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('Report exported successfully')
  }

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
          <h1 className="text-3xl font-bold text-gray-900">Report Builder</h1>
          <p className="text-gray-600 mt-2">
            Create and manage your CSRD report sections
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sections List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Report Sections</CardTitle>
                <CardDescription>
                  Manage your report sections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button onClick={createNewSection} className="w-full">
                    + New Section
                  </Button>
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        currentSection?.id === section.id ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => setCurrentSection(section)}
                    >
                      <h4 className="font-medium">{section.section_title}</h4>
                      <p className="text-sm text-gray-500 truncate">
                        {section.content.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Editor */}
          <div className="lg:col-span-2">
            {currentSection ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Edit Section</CardTitle>
                      <CardDescription>
                        Write and edit your report section
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        onClick={generateAIContent}
                        disabled={saving}
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        AI Generate
                      </Button>
                      <Button
                        onClick={saveSection}
                        disabled={saving}
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {saving ? 'Saving...' : 'Save'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    placeholder="Section title"
                    value={currentSection.section_title}
                    onChange={(e) => setCurrentSection({
                      ...currentSection,
                      section_title: e.target.value
                    })}
                  />
                  <TipTapEditor
                    content={currentSection.content}
                    onChange={(content) => setCurrentSection({
                      ...currentSection,
                      content
                    })}
                    placeholder="Write your report section content here..."
                  />
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a section to edit
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Choose an existing section or create a new one
                    </p>
                    <Button onClick={createNewSection}>
                      Create New Section
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Actions */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-medium">Export Report</h3>
                <p className="text-sm text-gray-500">
                  Download your report as JSON for further processing
                </p>
              </div>
              <Button onClick={exportReport} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
