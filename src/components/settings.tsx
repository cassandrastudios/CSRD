'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Layout } from './layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Organization } from '@/types'
import { Save, Users, Building, Key, User, Mail, Calendar, Upload, FileText, X, Send, Plus, Clock, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export function Settings() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savingUser, setSavingUser] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    employee_count: '',
    first_reporting_year: new Date().getFullYear() + 1
  })
  const [userFormData, setUserFormData] = useState({
    display_name: '',
    email: ''
  })
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: string
    name: string
    size: number
    type: string
    url?: string
  }>>([])
  const [uploading, setUploading] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteData, setInviteData] = useState({
    email: '',
    role: 'contributor' as 'admin' | 'manager' | 'contributor' | 'viewer'
  })
  const [sendingInvite, setSendingInvite] = useState(false)
  const [pendingInvites, setPendingInvites] = useState<Array<{
    id: string
    email: string
    role: string
    sentAt: Date
    expiresAt: Date
  }>>([])
  const supabase = createClient()

  useEffect(() => {
    fetchUser()
    fetchOrganization()
  }, [])

  const fetchUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Error fetching user:', error)
        return
      }

      if (user) {
        setUser(user)
        setUserFormData({
          display_name: user.user_metadata?.display_name || user.user_metadata?.full_name || '',
          email: user.email || ''
        })
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    }
  }

  const fetchOrganization = async () => {
    try {
      // First, try to get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.log('No authenticated user, creating default organization')
        await createDefaultOrganization()
        return
      }

      // Try to fetch organizations with error handling
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Organization fetch error:', error)
        // For any error, create a default organization
        await createDefaultOrganization()
        return
      }

      if (data && data.length > 0) {
        const org = data[0]
        setOrganization(org)
        setFormData({
          name: org.name,
          sector: org.sector,
          employee_count: org.employee_count.toString(),
          first_reporting_year: org.first_reporting_year
        })
      } else {
        // No organization found, create a default one
        await createDefaultOrganization()
      }
    } catch (error: any) {
      console.error('Failed to load organization:', error)
      toast.error('Failed to load organization. Creating a new one...')
      await createDefaultOrganization()
    } finally {
      setLoading(false)
    }
  }

  const createDefaultOrganization = async () => {
    try {
      // Create a default organization with a unique name to avoid conflicts
      const orgName = `My Organization ${Date.now()}`
      
      const { data, error } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          sector: 'Other',
          employee_count: 1,
          first_reporting_year: new Date().getFullYear() + 1
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create organization:', error)
        // If we can't create in database, use local state
        const localOrg = {
          id: 'local-' + Date.now(),
          name: orgName,
          sector: 'Other',
          employee_count: 1,
          first_reporting_year: new Date().getFullYear() + 1,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        setOrganization(localOrg)
        setFormData({
          name: localOrg.name,
          sector: localOrg.sector,
          employee_count: localOrg.employee_count.toString(),
          first_reporting_year: localOrg.first_reporting_year
        })
        toast.success('Created local organization (database unavailable)')
        return
      }

      setOrganization(data)
      setFormData({
        name: data.name,
        sector: data.sector,
        employee_count: data.employee_count.toString(),
        first_reporting_year: data.first_reporting_year
      })
      
      toast.success('Created default organization')
    } catch (error: any) {
      console.error('Failed to create default organization:', error)
      // Fallback to local state
      const localOrg = {
        id: 'local-' + Date.now(),
        name: 'My Organization',
        sector: 'Other',
        employee_count: 1,
        first_reporting_year: new Date().getFullYear() + 1
      }
      setOrganization(localOrg)
      setFormData({
        name: localOrg.name,
        sector: localOrg.sector,
        employee_count: localOrg.employee_count.toString(),
        first_reporting_year: localOrg.first_reporting_year
      })
      toast.success('Created local organization (database unavailable)')
    }
  }

  const saveOrganization = async () => {
    if (!formData.name.trim() || !formData.sector.trim() || !formData.employee_count.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    setSaving(true)
    try {
      // If it's a local organization, just update local state
      if (organization?.id?.startsWith('local-')) {
        const updatedOrg = {
          ...organization,
          name: formData.name,
          sector: formData.sector,
          employee_count: parseInt(formData.employee_count),
          first_reporting_year: formData.first_reporting_year
        }
        setOrganization(updatedOrg)
        toast.success('Organization updated locally')
        setSaving(false)
        return
      }

      // Try to save to database
      const { data, error } = await supabase
        .from('organizations')
        .upsert({
          id: organization?.id,
          name: formData.name,
          sector: formData.sector,
          employee_count: parseInt(formData.employee_count),
          first_reporting_year: formData.first_reporting_year
        })
        .select()
        .single()

      if (error) {
        console.error('Save organization error:', error)
        // If there's any error, fall back to local state
        const updatedOrg = {
          ...organization,
          name: formData.name,
          sector: formData.sector,
          employee_count: parseInt(formData.employee_count),
          first_reporting_year: formData.first_reporting_year
        }
        setOrganization(updatedOrg)
        toast.success('Organization updated locally (database unavailable)')
        return
      }

      if (data) {
        setOrganization(data)
        toast.success('Organization updated successfully')
      }
    } catch (error: any) {
      console.error('Failed to save organization:', error)
      // Fallback to local state
      const updatedOrg = {
        ...organization,
        name: formData.name,
        sector: formData.sector,
        employee_count: parseInt(formData.employee_count),
        first_reporting_year: formData.first_reporting_year
      }
      setOrganization(updatedOrg)
      toast.success('Organization updated locally (database unavailable)')
    } finally {
      setSaving(false)
    }
  }

  const saveUser = async () => {
    if (!userFormData.display_name.trim()) {
      toast.error('Please enter a display name')
      return
    }

    setSavingUser(true)
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: userFormData.display_name
        }
      })

      if (error) throw error

      toast.success('Profile updated successfully')
      fetchUser() // Refresh user data
    } catch (error: any) {
      console.error('Failed to save user:', error)
      toast.error('Failed to save profile: ' + error.message)
    } finally {
      setSavingUser(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    
    try {
      for (const file of Array.from(files)) {
        // Validate file type
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ]
        
        if (!allowedTypes.includes(file.type)) {
          toast.error(`File type not supported: ${file.name}`)
          continue
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`File too large: ${file.name} (max 10MB)`)
          continue
        }

        // Upload to Supabase Storage
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const filePath = `organization-documents/${organization?.id || 'temp'}/${fileName}`

        const { data, error } = await supabase.storage
          .from('organization-documents')
          .upload(filePath, file)

        if (error) {
          console.error('Upload error:', error)
          toast.error(`Failed to upload ${file.name}`)
          continue
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('organization-documents')
          .getPublicUrl(filePath)

        // Add to uploaded files list
        const newFile = {
          id: data.path,
          name: file.name,
          size: file.size,
          type: file.type,
          url: urlData.publicUrl
        }

        setUploadedFiles(prev => [...prev, newFile])
        toast.success(`Uploaded ${file.name}`)
      }
    } catch (error) {
      console.error('File upload error:', error)
      toast.error('Failed to upload files')
    } finally {
      setUploading(false)
      // Reset file input
      event.target.value = ''
    }
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
    toast.success('File removed')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const sendInvite = async () => {
    if (!inviteData.email.trim()) {
      toast.error('Please enter an email address')
      return
    }

    if (!inviteData.email.includes('@')) {
      toast.error('Please enter a valid email address')
      return
    }

    setSendingInvite(true)
    try {
      // Call the API endpoint to send the invite
      const response = await fetch('/api/invite-member', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: inviteData.email,
          role: inviteData.role
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send invite')
      }
      
      // Add to pending invites (expires in 7 days)
      const now = new Date()
      const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
      
      const newInvite = {
        id: `invite-${Date.now()}-${Math.random().toString(36).substring(2)}`,
        email: inviteData.email,
        role: inviteData.role,
        sentAt: now,
        expiresAt: expiresAt
      }
      
      setPendingInvites(prev => [...prev, newInvite])
      toast.success(`Invite sent to ${inviteData.email} as ${inviteData.role}`)
      
      // Reset form
      setInviteData({
        email: '',
        role: 'contributor'
      })
      setShowInviteForm(false)
    } catch (error) {
      console.error('Failed to send invite:', error)
      toast.error('Failed to send invite. Please try again.')
    } finally {
      setSendingInvite(false)
    }
  }

  const cancelInvite = () => {
    setInviteData({
      email: '',
      role: 'contributor'
    })
    setShowInviteForm(false)
  }

  const removePendingInvite = (inviteId: string) => {
    setPendingInvites(prev => prev.filter(invite => invite.id !== inviteId))
    toast.success('Invite removed')
  }

  const getTimeRemaining = (expiresAt: Date) => {
    const now = new Date()
    const diff = expiresAt.getTime() - now.getTime()
    
    if (diff <= 0) {
      return { expired: true, text: 'Expired' }
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) {
      return { expired: false, text: `${days}d ${hours}h remaining` }
    } else if (hours > 0) {
      return { expired: false, text: `${hours}h ${minutes}m remaining` }
    } else {
      return { expired: false, text: `${minutes}m remaining` }
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'text-blue-600 bg-blue-100'
      case 'manager': return 'text-purple-600 bg-purple-100'
      case 'contributor': return 'text-green-600 bg-green-100'
      case 'viewer': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Clean up expired invites
  useEffect(() => {
    const interval = setInterval(() => {
      setPendingInvites(prev => prev.filter(invite => {
        const timeRemaining = getTimeRemaining(invite.expiresAt)
        return !timeRemaining.expired
      }))
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

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

        {/* User Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="h-5 w-5 mr-2" />
              User Information
            </CardTitle>
            <CardDescription>
              Update your personal profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Name
                </label>
                <Input
                  value={userFormData.display_name}
                  onChange={(e) => setUserFormData({ ...userFormData, display_name: e.target.value })}
                  placeholder="Enter your display name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  value={userFormData.email}
                  disabled
                  className="bg-gray-50"
                  placeholder="Email address"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Email cannot be changed here. Contact support if needed.
                </p>
              </div>
            </div>
            
            {user && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Member since: {new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>Last sign in: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : 'Unknown'}</span>
                </div>
              </div>
            )}
            
            <Button onClick={saveUser} disabled={savingUser}>
              <Save className="h-4 w-4 mr-2" />
              {savingUser ? 'Saving...' : 'Save Profile'}
            </Button>
          </CardContent>
        </Card>

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
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowInviteForm(!showInviteForm)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {showInviteForm ? 'Cancel' : 'Invite Member'}
                </Button>
              </div>
              
              {/* Invite Form */}
              {showInviteForm && (
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h5 className="font-medium mb-3">Send Invitation</h5>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        value={inviteData.email}
                        onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                        placeholder="colleague@company.com"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Role
                      </label>
                      <select
                        value={inviteData.role}
                        onChange={(e) => setInviteData({ ...inviteData, role: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="viewer">Viewer - Read-only access</option>
                        <option value="contributor">Contributor - Edit reports and data</option>
                        <option value="manager">Manager - Manage team and settings</option>
                        <option value="admin">Admin - Full access</option>
                      </select>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        onClick={sendInvite} 
                        disabled={sendingInvite}
                        size="sm"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {sendingInvite ? 'Sending...' : 'Send Invite'}
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={cancelInvite}
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-2">
                <h4 className="font-medium">Current Team</h4>
                <div className="space-y-2">
                  {user ? (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {(user.user_metadata?.display_name || user.user_metadata?.full_name || user.email || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">
                            {user.user_metadata?.display_name || user.user_metadata?.full_name || 'User'}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
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
                  ) : (
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white text-sm font-medium">
                          ?
                        </div>
                        <div>
                          <p className="font-medium text-gray-500">Loading user...</p>
                          <p className="text-sm text-gray-400">Please wait</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pending Invites */}
              {pendingInvites.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-medium">Pending Invites</h4>
                  <div className="space-y-2">
                    {pendingInvites.map((invite) => {
                      const timeRemaining = getTimeRemaining(invite.expiresAt)
                      return (
                        <div
                          key={invite.id}
                          className={`flex items-center justify-between p-3 border rounded-lg ${
                            timeRemaining.expired ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                              timeRemaining.expired ? 'bg-red-500' : 'bg-yellow-500'
                            }`}>
                              <Clock className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">{invite.email}</p>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(invite.role)}`}>
                                  {invite.role.charAt(0).toUpperCase() + invite.role.slice(1)}
                                </span>
                                <span className={`text-xs ${
                                  timeRemaining.expired ? 'text-red-600' : 'text-yellow-600'
                                }`}>
                                  {timeRemaining.text}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">
                              Sent {invite.sentAt.toLocaleDateString()}
                            </span>
                            <button
                              onClick={() => removePendingInvite(invite.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                              title="Remove invite"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium">Role Permissions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-blue-600">Admin</h5>
                    <ul className="mt-2 space-y-1 text-gray-600">
                      <li>• Full access to all features</li>
                      <li>• Manage team members</li>
                      <li>• Configure organization settings</li>
                      <li>• Export and import data</li>
                      <li>• Delete organization</li>
                    </ul>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-purple-600">Manager</h5>
                    <ul className="mt-2 space-y-1 text-gray-600">
                      <li>• Invite and manage team members</li>
                      <li>• Edit all reports and data</li>
                      <li>• Configure project settings</li>
                      <li>• View compliance status</li>
                      <li>• Cannot delete organization</li>
                    </ul>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-green-600">Contributor</h5>
                    <ul className="mt-2 space-y-1 text-gray-600">
                      <li>• Edit assigned reports and data</li>
                      <li>• Upload evidence and documents</li>
                      <li>• View compliance status</li>
                      <li>• Comment on assessments</li>
                      <li>• Cannot manage team</li>
                    </ul>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <h5 className="font-medium text-orange-600">Viewer</h5>
                    <ul className="mt-2 space-y-1 text-gray-600">
                      <li>• Read-only access to reports</li>
                      <li>• View compliance status</li>
                      <li>• Download evidence and exports</li>
                      <li>• View team activity</li>
                      <li>• Cannot make any changes</li>
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
