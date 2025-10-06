import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { topicTitle, impactScore, financialScore, stakeholderFeedback, iros } = await request.json()

    // Mock AI response for score explanation
    // In production, this would call OpenAI API
    const explanations = {
      impact: `The impact score of ${impactScore} reflects ${impactScore >= 4 ? 'significant' : impactScore >= 3 ? 'moderate' : 'limited'} effects on people and the environment. ${stakeholderFeedback?.length > 0 ? 'Stakeholder feedback indicates ' + stakeholderFeedback[0].note : 'Based on available data'}, this topic demonstrates ${impactScore >= 4 ? 'substantial' : 'some'} potential for positive or negative environmental/social outcomes.`,
      
      financial: `The financial materiality score of ${financialScore} indicates ${financialScore >= 4 ? 'high' : financialScore >= 3 ? 'moderate' : 'low'} potential impact on enterprise value. This assessment considers ${financialScore >= 4 ? 'significant' : 'some'} financial risks and opportunities, including regulatory compliance costs, market access, and operational efficiency gains.`,
      
      overall: `Combined, these scores suggest that ${topicTitle} is ${(impactScore + financialScore) / 2 >= 3 ? 'material' : 'not material'} to the organization. The ${(impactScore + financialScore) / 2 >= 3 ? 'material' : 'non-material'} status is supported by ${iros?.length > 0 ? 'identified IROs and ' : ''}stakeholder input, indicating ${(impactScore + financialScore) / 2 >= 3 ? 'the need for comprehensive disclosure and management' : 'limited disclosure requirements'}.`
    }

    return NextResponse.json({ 
      success: true, 
      explanations 
    })

  } catch (error: any) {
    console.error('Error generating score explanation:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
