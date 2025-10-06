export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          sector: string
          employee_count: number
          first_reporting_year: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          sector: string
          employee_count: number
          first_reporting_year: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          sector?: string
          employee_count?: number
          first_reporting_year?: number
          created_at?: string
          updated_at?: string
        }
      }
      esrs_topics: {
        Row: {
          id: string
          code: string
          title: string
          description: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          code: string
          title: string
          description: string
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          code?: string
          title?: string
          description?: string
          category?: string
          created_at?: string
        }
      }
      materiality_assessments: {
        Row: {
          id: string
          organization_id: string
          esrs_topic_id: string
          impact_materiality: number
          financial_materiality: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          esrs_topic_id: string
          impact_materiality: number
          financial_materiality: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          esrs_topic_id?: string
          impact_materiality?: number
          financial_materiality?: number
          created_at?: string
          updated_at?: string
        }
      }
      esg_metrics: {
        Row: {
          id: string
          organization_id: string
          metric_name: string
          owner: string
          status: 'not_started' | 'in_progress' | 'completed'
          evidence_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          metric_name: string
          owner: string
          status?: 'not_started' | 'in_progress' | 'completed'
          evidence_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          metric_name?: string
          owner?: string
          status?: 'not_started' | 'in_progress' | 'completed'
          evidence_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      report_sections: {
        Row: {
          id: string
          organization_id: string
          section_title: string
          content: string
          esrs_topic_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          section_title: string
          content: string
          esrs_topic_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          section_title?: string
          content?: string
          esrs_topic_id?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
