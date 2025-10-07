'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Layout } from '@/components/layout'
import toast from 'react-hot-toast'

const sectors = [
  'Technology',
  'Manufacturing',
  'Financial Services',
  'Healthcare',
  'Energy',
  'Retail',
  'Transportation',
  'Construction',
  'Agriculture',
  'Other'
]

export function OnboardingForm() {
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    employee_count: '',
    first_reporting_year: new Date().getFullYear() + 1
  })
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('organizations')
        .insert({
          name: formData.name,
          sector: formData.sector,
          employee_count: parseInt(formData.employee_count),
          first_reporting_year: formData.first_reporting_year
        })

      if (error) throw error

      toast.success('Organization setup complete!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to CSRD Co-Pilot</CardTitle>
            <CardDescription>
              Let's set up your organization to get started with CSRD compliance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your organization name"
                  required
                />
              </div>

              <div>
                <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-2">
                  Industry Sector
                </label>
                <select
                  id="sector"
                  value={formData.sector}
                  onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select your sector</option>
                  {sectors.map((sector) => (
                    <option key={sector} value={sector}>
                      {sector}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="employee_count" className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Employees
                </label>
                <Input
                  id="employee_count"
                  type="number"
                  value={formData.employee_count}
                  onChange={(e) => setFormData({ ...formData, employee_count: e.target.value })}
                  placeholder="Enter number of employees"
                  required
                />
              </div>

              <div>
                <label htmlFor="first_reporting_year" className="block text-sm font-medium text-gray-700 mb-2">
                  First Reporting Year
                </label>
                <Input
                  id="first_reporting_year"
                  type="number"
                  value={formData.first_reporting_year}
                  onChange={(e) => setFormData({ ...formData, first_reporting_year: parseInt(e.target.value) })}
                  min={2024}
                  max={2030}
                />
                <p className="text-sm text-gray-500 mt-1">
                  CSRD reporting starts in 2024 for large companies
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
