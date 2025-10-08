import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createClient();

    // Test basic connection
    const { data, error } = await supabase
      .from('esrs_topics')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        details: 'Database connection failed',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      data: data,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: 'Server error',
    });
  }
}
