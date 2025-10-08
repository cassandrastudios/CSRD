import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ 
        success: false, 
        error: 'User not authenticated' 
      }, { status: 401 })
    }
    
    // Fetch organizations
    const { data: orgs, error } = await supabase
      .from('organizations')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code 
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      data: orgs || [],
      count: orgs?.length || 0
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 })
  }
}
