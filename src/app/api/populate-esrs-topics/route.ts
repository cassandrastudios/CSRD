import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const supabase = createClient()
    
    // Sample ESRS topics data
    const topics = [
      // Environmental Topics
      { code: 'E1', name: 'Climate Change', description: 'Climate change mitigation and adaptation measures, including greenhouse gas emissions reduction and climate risk management', category: 'Environmental' },
      { code: 'E2', name: 'Pollution', description: 'Pollution prevention and control, including air, water, and soil pollution management', category: 'Environmental' },
      { code: 'E3', name: 'Water and Marine Resources', description: 'Water and marine resource management, including water consumption and marine biodiversity protection', category: 'Environmental' },
      { code: 'E4', name: 'Biodiversity and Ecosystems', description: 'Biodiversity and ecosystem protection, including habitat conservation and species protection', category: 'Environmental' },
      { code: 'E5', name: 'Resource Use and Circular Economy', description: 'Resource efficiency and circular economy practices, including waste reduction and material circularity', category: 'Environmental' },
      
      // Social Topics
      { code: 'S1', name: 'Own Workforce', description: 'Rights and working conditions of the company\'s own workforce, including health and safety, diversity and inclusion', category: 'Social' },
      { code: 'S2', name: 'Workers in Value Chain', description: 'Rights of workers in the value chain, including supply chain labor standards and human rights', category: 'Social' },
      { code: 'S3', name: 'Affected Communities', description: 'Rights of affected communities, including community impact and indigenous rights', category: 'Social' },
      { code: 'S4', name: 'Consumers and End-Users', description: 'Consumer and end-user rights, including product safety and data privacy', category: 'Social' },
      
      // Governance Topics
      { code: 'G1', name: 'Business Conduct', description: 'Business ethics and conduct, including anti-corruption and anti-bribery measures', category: 'Governance' },
      { code: 'G2', name: 'Corporate Culture', description: 'Corporate culture and values, including leadership and organizational behavior', category: 'Governance' },
      { code: 'G3', name: 'Management of Material Sustainability Risks', description: 'Risk management and oversight of sustainability-related risks', category: 'Governance' },
      { code: 'G4', name: 'Incentive Schemes', description: 'Executive compensation and incentive schemes, including sustainability-linked pay', category: 'Governance' }
    ]

    // Insert topics
    const { data, error } = await supabase
      .from('esrs_topics')
      .upsert(topics, { onConflict: 'code' })

    if (error) {
      console.error('Error inserting topics:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully populated ${topics.length} ESRS topics`,
      data 
    })

  } catch (error: any) {
    console.error('Error populating ESRS topics:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
