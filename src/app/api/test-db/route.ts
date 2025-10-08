import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Test database connection
    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .limit(1)
    
    if (error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      data: data,
      count: data?.length || 0
    })
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      type: 'catch_error'
    }, { status: 500 })
  }
}
