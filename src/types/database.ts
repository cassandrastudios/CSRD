export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string;
          name: string;
          sector: string;
          employee_count: number;
          first_reporting_year: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sector: string;
          employee_count: number;
          first_reporting_year: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sector?: string;
          employee_count?: number;
          first_reporting_year?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      esrs_topics: {
        Row: {
          id: number;
          code: string;
          name: string;
          description: string;
          category: 'Environmental' | 'Social' | 'Governance';
          subtopics: string[];
          kpis: string[];
          industry_benchmarks: {
            high_impact_sectors: string[];
            benchmark_threshold: number;
          };
          esrs_reference: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: number;
          code: string;
          name: string;
          description: string;
          category: 'Environmental' | 'Social' | 'Governance';
          subtopics?: string[];
          kpis?: string[];
          industry_benchmarks?: {
            high_impact_sectors: string[];
            benchmark_threshold: number;
          };
          esrs_reference: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: number;
          code?: string;
          name?: string;
          description?: string;
          category?: 'Environmental' | 'Social' | 'Governance';
          subtopics?: string[];
          kpis?: string[];
          industry_benchmarks?: {
            high_impact_sectors: string[];
            benchmark_threshold: number;
          };
          esrs_reference?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      materiality_assessments: {
        Row: {
          id: string;
          organization_id: string;
          esrs_topic_id: number;
          impact_materiality: number;
          financial_materiality: number;
          inside_out_impact: number;
          outside_in_impact: number;
          materiality_status: 'not_material' | 'material' | 'highly_material';
          assessment_status: 'draft' | 'under_review' | 'approved';
          last_reviewed_at: string | null;
          reviewed_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          esrs_topic_id: number;
          impact_materiality: number;
          financial_materiality: number;
          inside_out_impact: number;
          outside_in_impact: number;
          materiality_status?: 'not_material' | 'material' | 'highly_material';
          assessment_status?: 'draft' | 'under_review' | 'approved';
          last_reviewed_at?: string | null;
          reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          esrs_topic_id?: number;
          impact_materiality?: number;
          financial_materiality?: number;
          inside_out_impact?: number;
          outside_in_impact?: number;
          materiality_status?: 'not_material' | 'material' | 'highly_material';
          assessment_status?: 'draft' | 'under_review' | 'approved';
          last_reviewed_at?: string | null;
          reviewed_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      stakeholders: {
        Row: {
          id: string;
          organization_id: string;
          name: string;
          category:
            | 'employee'
            | 'client'
            | 'supplier'
            | 'civil_society'
            | 'investor'
            | 'regulator';
          contact_email: string | null;
          influence_rating: number;
          engagement_frequency:
            | 'monthly'
            | 'quarterly'
            | 'annually'
            | 'as_needed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          name: string;
          category:
            | 'employee'
            | 'client'
            | 'supplier'
            | 'civil_society'
            | 'investor'
            | 'regulator';
          contact_email?: string | null;
          influence_rating: number;
          engagement_frequency:
            | 'monthly'
            | 'quarterly'
            | 'annually'
            | 'as_needed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          name?: string;
          category?:
            | 'employee'
            | 'client'
            | 'supplier'
            | 'civil_society'
            | 'investor'
            | 'regulator';
          contact_email?: string | null;
          influence_rating?: number;
          engagement_frequency?:
            | 'monthly'
            | 'quarterly'
            | 'annually'
            | 'as_needed';
          created_at?: string;
          updated_at?: string;
        };
      };
      stakeholder_engagements: {
        Row: {
          id: string;
          organization_id: string;
          stakeholder_id: string;
          esrs_topic_id: number;
          engagement_type:
            | 'survey'
            | 'interview'
            | 'workshop'
            | 'focus_group'
            | 'public_consultation';
          activity_date: string;
          description: string | null;
          feedback_summary: string | null;
          influence_on_scoring: number;
          documents: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          stakeholder_id: string;
          esrs_topic_id: number;
          engagement_type:
            | 'survey'
            | 'interview'
            | 'workshop'
            | 'focus_group'
            | 'public_consultation';
          activity_date: string;
          description?: string | null;
          feedback_summary?: string | null;
          influence_on_scoring: number;
          documents?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          stakeholder_id?: string;
          esrs_topic_id?: number;
          engagement_type?:
            | 'survey'
            | 'interview'
            | 'workshop'
            | 'focus_group'
            | 'public_consultation';
          activity_date?: string;
          description?: string | null;
          feedback_summary?: string | null;
          influence_on_scoring?: number;
          documents?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      evidence_documents: {
        Row: {
          id: string;
          organization_id: string;
          esrs_topic_id: number;
          materiality_assessment_id: string;
          document_name: string;
          document_type:
            | 'policy'
            | 'certification'
            | 'kpi_data'
            | 'report'
            | 'other';
          file_url: string;
          file_size: number | null;
          mime_type: string | null;
          description: string | null;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          esrs_topic_id: number;
          materiality_assessment_id: string;
          document_name: string;
          document_type:
            | 'policy'
            | 'certification'
            | 'kpi_data'
            | 'report'
            | 'other';
          file_url: string;
          file_size?: number | null;
          mime_type?: string | null;
          description?: string | null;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          esrs_topic_id?: number;
          materiality_assessment_id?: string;
          document_name?: string;
          document_type?:
            | 'policy'
            | 'certification'
            | 'kpi_data'
            | 'report'
            | 'other';
          file_url?: string;
          file_size?: number | null;
          mime_type?: string | null;
          description?: string | null;
          uploaded_by?: string;
          created_at?: string;
        };
      };
      materiality_rationale: {
        Row: {
          id: string;
          materiality_assessment_id: string;
          inside_out_rationale: string | null;
          outside_in_rationale: string | null;
          stakeholder_feedback_summary: string | null;
          evidence_summary: string | null;
          risk_factors: string | null;
          opportunity_factors: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          materiality_assessment_id: string;
          inside_out_rationale?: string | null;
          outside_in_rationale?: string | null;
          stakeholder_feedback_summary?: string | null;
          evidence_summary?: string | null;
          risk_factors?: string | null;
          opportunity_factors?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          materiality_assessment_id?: string;
          inside_out_rationale?: string | null;
          outside_in_rationale?: string | null;
          stakeholder_feedback_summary?: string | null;
          evidence_summary?: string | null;
          risk_factors?: string | null;
          opportunity_factors?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      assessment_workflows: {
        Row: {
          id: string;
          organization_id: string;
          esrs_topic_id: number;
          current_status: 'draft' | 'under_review' | 'approved' | 'rejected';
          assigned_to: string | null;
          reviewer_id: string | null;
          approver_id: string | null;
          review_notes: string | null;
          approval_notes: string | null;
          submitted_at: string | null;
          reviewed_at: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          esrs_topic_id: number;
          current_status?: 'draft' | 'under_review' | 'approved' | 'rejected';
          assigned_to?: string | null;
          reviewer_id?: string | null;
          approver_id?: string | null;
          review_notes?: string | null;
          approval_notes?: string | null;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          esrs_topic_id?: number;
          current_status?: 'draft' | 'under_review' | 'approved' | 'rejected';
          assigned_to?: string | null;
          reviewer_id?: string | null;
          approver_id?: string | null;
          review_notes?: string | null;
          approval_notes?: string | null;
          submitted_at?: string | null;
          reviewed_at?: string | null;
          approved_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      esg_metrics: {
        Row: {
          id: string;
          organization_id: string;
          metric_name: string;
          owner: string;
          status: 'not_started' | 'in_progress' | 'completed';
          evidence_url?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          metric_name: string;
          owner: string;
          status?: 'not_started' | 'in_progress' | 'completed';
          evidence_url?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          metric_name?: string;
          owner?: string;
          status?: 'not_started' | 'in_progress' | 'completed';
          evidence_url?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      report_sections: {
        Row: {
          id: string;
          organization_id: string;
          section_title: string;
          content: string;
          esrs_topic_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          organization_id: string;
          section_title: string;
          content: string;
          esrs_topic_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          organization_id?: string;
          section_title?: string;
          content?: string;
          esrs_topic_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Convenience types for easier usage
export type ESRS_Topic = Database['public']['Tables']['esrs_topics']['Row'];
export type MaterialityAssessment =
  Database['public']['Tables']['materiality_assessments']['Row'];
export type Stakeholder = Database['public']['Tables']['stakeholders']['Row'];
export type StakeholderEngagement =
  Database['public']['Tables']['stakeholder_engagements']['Row'];
export type EvidenceDocument =
  Database['public']['Tables']['evidence_documents']['Row'];
export type MaterialityRationale =
  Database['public']['Tables']['materiality_rationale']['Row'];
export type AssessmentWorkflow =
  Database['public']['Tables']['assessment_workflows']['Row'];
