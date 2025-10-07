'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Layout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Organization } from '@/types'
import { Save, Users, Building, Key } from 'lucide-react'
import toast from 'react-hot-toast'

export function Settings() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    employee_count: '',
    first_reporting_year: new Date().getFullYear() + 1
  })
  const supabase = createClient()

  useEffect(() => {
    fetchOrganization()
  }, [])

  const fetchOrganization = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') throw error

      if (data) {
        setOrganization(data)
        setFormData({
          name: data.name,
          sector: data.sector,
          employee_count: data.employee_count.toString(),
          first_reporting_year: data.first_reporting_year
        })
      }
    } catch (error: any) {
      toast.error('Failed to load organization: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const saveOrganization = async () => {
    if (!formData.name.trim() || !formData.sector.trim() || !formData.employee_count.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase
        .from('organizations')
        .upsert({
          id: organization?.id,
          name: formData.name,
          sector: formData.sector,
          employee_count: parseInt(formData.employee_count),
          first_reporting_year: formData.first_reporting_year
        })

      if (error) throw error

      toast.success('Organization updated successfully')
      fetchOrganization()
    } catch (error: any) {
      toast.error('Failed to save organization: ' + error.message)
    } finally {
      setSaving(false)
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">
            Manage your organization settings and preferences
          </p>
        </div>

        {/* Organization Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Organization Information
            </CardTitle>
            <CardDescription>
              Update your organization details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter organization name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry Sector
                </label>
                <Input
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  placeholder="Enter industry sector"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Employees
                </label>
                <Input
                  type="number"
                  value={formData.employee_count}
                  onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
                  placeholder="Enter number of employees"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Reporting Year
                </label>
                <Input
                  type="number"
                  value={formData.first_reporting_year}
                  onChange={(e) => setFormData({ ...formData, first_reporting_year: parseInt(e.target.value) })}
                  min={2024}
                  max={2030}
                />
              </div>
            </div>
            <Button onClick={saveOrganization} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>

        {/* Team Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Team Management
            </CardTitle>
            <CardDescription>
              Manage team members and their roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Invite Team Members</h4>
                  <p className="text-sm text-gray-500">
                    Add team members with different access levels
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Invite Member
                </Button>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Current Team</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        A
                      </div>
                      <div>
                        <p className="font-medium">Admin User</p>
                        <p className="text-sm text-gray-500">admin@company.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        Admin
                      </span>
                      <Button variant="ghost" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Role Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-blue-600">Admin</h5>
                    <ul className="mt-2 space-y-1 text-gray-600">
                      <li>• Full access to all features</li>
                      <li>• Manage team members</li>
                      <li>• Configure settings</li>
                      <li>• Export data</li>
                    </ul>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-green-600">Contributor</h5>
                    <ul className="mt-2 space-y-1 text-gray-600">
                      <li>• Edit reports and data</li>
                      <li>• Upload evidence</li>
                      <li>• View compliance status</li>
                      <li>• Cannot manage team</li>
                    </ul>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-orange-600">Auditor</h5>
                    <ul className="mt-2 space-y-1 text-gray-600">
                      <li>• Read-only access</li>
                      <li>• View all reports</li>
                      <li>• Download evidence</li>
                      <li>• Cannot make changes</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Key className="h-5 w-5 mr-2" />
              API Keys
            </CardTitle>
            <CardDescription>
              Manage your API keys for integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">OpenAI API Key</h4>
                <p className="text-sm text-gray-500 mb-3">
                  Used for AI-powered content generation
                </p>
                <Input
                  type="password"
                  placeholder="Enter your OpenAI API key"
                  className="mb-2"
                />
                <Button size="sm" variant="outline">
                  Save Key
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">Other Integrations</h4>
                <p className="text-sm text-gray-500 mb-3">
                  Additional integration keys will be available soon
                </p>
                <Button size="sm" variant="outline" disabled>
                  Coming Soon
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Email Notifications</h4>
                  <p className="text-sm text-gray-500">
                    Receive updates about your CSRD progress
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Data Export</h4>
                  <p className="text-sm text-gray-500">
                    Export your organization data
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Export Data
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
