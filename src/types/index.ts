export interface Organization {
  id: string
  name: string
  sector: string
  employee_count: number
  first_reporting_year: number
  created_at: string
  updated_at: string
}

export interface ESRS_Topic {
  id: string
  code: string
  title: string
  description: string
  category: string
  created_at: string
}

export interface MaterialityAssessment {
  id: string
  organization_id: string
  esrs_topic_id: string
  impact_materiality: number
  financial_materiality: number
  created_at: string
  updated_at: string
}

export interface ESGMetric {
  id: string
  organization_id: string
  metric_name: string
  owner: string
  status: 'not_started' | 'in_progress' | 'completed'
  evidence_url?: string
  created_at: string
  updated_at: string
}

export interface ReportSection {
  id: string
  organization_id: string
  section_title: string
  content: string
  esrs_topic_id?: string
  created_at: string
  updated_at: string
}

export interface OnboardingData {
  name: string
  sector: string
  employee_count: number
  first_reporting_year: number
}

export interface DashboardStats {
  materiality_completed: number
  data_collection_progress: number
  report_sections_completed: number
  compliance_score: number
}
