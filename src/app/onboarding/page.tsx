'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CheckCircle, Loader2, User, Building, Upload, FileText, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Organization {
  id: string
  name: string
  sector?: string
  employee_count?: string
  website?: string
  first_reporting_year?: number
  created_at: string
  updated_at: string
}

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [onboarding, setOnboarding] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    // Personal Information
    displayName: '',
    email: '',
    // Organization Information
    orgName: '',
    orgId: '',
    sector: '',
    employeeCount: '',
    website: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    firstReportingYear: new Date().getFullYear() + 1,
  })
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string
    name: string
    size: number
    type: string
    url?: string
  }>>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        router.push('/auth')
        return
      }

      setUser(user)
      setFormData(prev => ({
        ...prev,
        displayName: user.user_metadata?.display_name || user.user_metadata?.full_name || '',
        email: user.email || '',
        orgId: generateOrgId(),
      }))
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch user:', error)
      router.push('/auth')
    }
  }

  const generateOrgId = () => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `org-${timestamp}-${random}`
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    setUploading(true)
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
          toast.error(`File ${file.name} is too large. Maximum size is 10MB.`)
          continue
        }

        const fileId = `file-${Date.now()}-${Math.random().toString(36).substring(2)}`
        const newFile = {
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
        }

        setUploadedFiles(prev => [...prev, newFile])
      }
    } catch (error) {
      console.error('Error uploading files:', error)
      toast.error('Failed to upload files')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.displayName.trim()) {
      toast.error('Please enter your display name')
      return
    }

    if (!formData.orgName.trim()) {
      toast.error('Please enter your organization name')
      return
    }

    if (!formData.orgId.trim()) {
      toast.error('Please enter an organization ID')
      return
    }

    setOnboarding(true)
    try {
      // Update user profile
      const { error: userError } = await supabase.auth.updateUser({
        data: {
          display_name: formData.displayName,
        },
      })

      if (userError) throw userError

      // Create organization
      let organization: Organization = {
        id: formData.orgId,
        name: formData.orgName,
        sector: formData.sector || undefined,
        employee_count: formData.employeeCount || undefined,
        website: formData.website || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        phone: formData.phone || undefined,
        first_reporting_year: formData.firstReportingYear,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      console.log('Creating organization:', organization)

      try {
        const { data: insertedOrg, error: orgError } = await supabase
          .from('organizations')
          .insert(organization)
          .select()
          .single()

        if (orgError) {
          console.log('Database error during organization creation:', orgError)
          console.log('Continuing with local storage fallback')
        } else {
          console.log('Organization created successfully in database:', insertedOrg)
          // Update the organization with the actual inserted data
          organization = insertedOrg
        }

        // Add user as admin of the organization
        try {
          await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              organization_id: formData.orgId,
              role: 'admin',
            })
        } catch (roleError) {
          console.log('Database table not available, continuing without database storage')
        }
      } catch (dbError) {
        console.log('Database not available, continuing with local storage')
      }

      toast.success('Welcome to CSRD Co-Pilot! Your organization has been set up.')
      
      // Store the organization in localStorage for immediate access
      localStorage.setItem('currentOrganizationId', organization.id)
      
      // Refresh the page to ensure organization context is updated
      setTimeout(() => {
        window.location.href = '/dashboard'
      }, 1000)
    } catch (error: any) {
      console.error('Error during onboarding:', error)
      toast.error(error.message || 'Failed to complete onboarding. Please try again.')
    } finally {
      setOnboarding(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-lg text-gray-700">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome to CSRD Co-Pilot</h1>
          <p className="text-gray-600 mt-2">Let's set up your account and organization</p>
        </div>

        <div className="space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Tell us about yourself
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    placeholder="Enter your display name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={formData.email}
                    disabled
                    className="mt-1 bg-gray-50"
                    placeholder="Email address"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email cannot be changed here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Organization Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building className="h-5 w-5 mr-2" />
                Organization Information
              </CardTitle>
              <CardDescription>
                Set up your organization details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="orgName">Organization Name *</Label>
                    <Input
                      id="orgName"
                      value={formData.orgName}
                      onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                      placeholder="Enter organization name"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="orgId">Organization ID</Label>
                    <Input
                      id="orgId"
                      value={formData.orgId}
                      disabled
                      className="mt-1 bg-gray-50"
                      placeholder="Auto-generated"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Unique identifier for your organization (auto-generated)
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="sector">Industry Sector</Label>
                    <Input
                      id="sector"
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      placeholder="e.g., Technology, Manufacturing"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employeeCount">Number of Employees</Label>
                    <Input
                      id="employeeCount"
                      type="number"
                      value={formData.employeeCount}
                      onChange={(e) => setFormData({ ...formData, employeeCount: e.target.value })}
                      placeholder="Enter number of employees"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://yourcompany.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="firstReportingYear">First Reporting Year</Label>
                    <Input
                      id="firstReportingYear"
                      type="number"
                      value={formData.firstReportingYear}
                      onChange={(e) => setFormData({ ...formData, firstReportingYear: parseInt(e.target.value) })}
                      min={2024}
                      max={2030}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street address"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="City"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={formData.country}
                      onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                      placeholder="Country"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* File Upload Section */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Add files for context about your company
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">
                      Upload annual reports, sustainability reports, or other company documents to help our AI provide more personalized recommendations.
                    </p>
                    
                    {/* File Upload Area */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
                        onChange={handleFileUpload}
                        disabled={uploading}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer flex flex-col items-center space-y-2"
                      >
                        <Upload className="h-8 w-8 text-gray-400" />
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-blue-600 hover:text-blue-500">
                            Click to upload
                          </span>
                          {' '}or drag and drop
                        </div>
                        <div className="text-xs text-gray-500">
                          PDF, DOC, DOCX, TXT, XLS, XLSX (max 10MB each)
                        </div>
                      </label>
                    </div>
                    
                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                      <div className="space-y-2">
                        <h5 className="text-sm font-medium text-gray-700">Uploaded Files:</h5>
                        {uploadedFiles.map((file) => (
                          <div
                            key={file.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              <FileText className="h-5 w-5 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => removeFile(file.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

        <div className="flex justify-end mt-8">
          <Button
            onClick={handleSubmit}
            disabled={onboarding}
            size="lg"
          >
            {onboarding ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Setting up your account...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete Setup
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}