-- Enhanced Materiality Assessment Schema
-- This migration adds comprehensive support for ESRS materiality assessment

-- Update ESRS topics table with more comprehensive data
ALTER TABLE esrs_topics ADD COLUMN IF NOT EXISTS category VARCHAR(20) CHECK (category IN ('Environmental', 'Social', 'Governance'));
ALTER TABLE esrs_topics ADD COLUMN IF NOT EXISTS subtopics JSONB DEFAULT '[]';
ALTER TABLE esrs_topics ADD COLUMN IF NOT EXISTS kpis JSONB DEFAULT '[]';
ALTER TABLE esrs_topics ADD COLUMN IF NOT EXISTS industry_benchmarks JSONB DEFAULT '{}';
ALTER TABLE esrs_topics ADD COLUMN IF NOT EXISTS esrs_reference VARCHAR(100);
ALTER TABLE esrs_topics ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create stakeholders table
CREATE TABLE IF NOT EXISTS stakeholders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'employee', 'client', 'supplier', 'civil_society', 'investor', 'regulator'
  contact_email VARCHAR(255),
  influence_rating INTEGER CHECK (influence_rating >= 1 AND influence_rating <= 5),
  engagement_frequency VARCHAR(50), -- 'monthly', 'quarterly', 'annually', 'as_needed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stakeholder engagement activities table
CREATE TABLE IF NOT EXISTS stakeholder_engagements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  stakeholder_id UUID REFERENCES stakeholders(id) ON DELETE CASCADE,
  esrs_topic_id INTEGER REFERENCES esrs_topics(id) ON DELETE CASCADE,
  engagement_type VARCHAR(50) NOT NULL, -- 'survey', 'interview', 'workshop', 'focus_group', 'public_consultation'
  activity_date DATE NOT NULL,
  description TEXT,
  feedback_summary TEXT,
  influence_on_scoring INTEGER CHECK (influence_on_scoring >= 1 AND influence_on_scoring <= 5),
  documents JSONB DEFAULT '[]', -- Array of document URLs/IDs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create evidence documents table
CREATE TABLE IF NOT EXISTS evidence_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  esrs_topic_id INTEGER REFERENCES esrs_topics(id) ON DELETE CASCADE,
  materiality_assessment_id UUID REFERENCES materiality_assessments(id) ON DELETE CASCADE,
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(50) NOT NULL, -- 'policy', 'certification', 'kpi_data', 'report', 'other'
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type VARCHAR(100),
  description TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create materiality rationale table
CREATE TABLE IF NOT EXISTS materiality_rationale (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  materiality_assessment_id UUID REFERENCES materiality_assessments(id) ON DELETE CASCADE,
  inside_out_rationale TEXT,
  outside_in_rationale TEXT,
  stakeholder_feedback_summary TEXT,
  evidence_summary TEXT,
  risk_factors TEXT,
  opportunity_factors TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create materiality assessment versions table for audit trail
CREATE TABLE IF NOT EXISTS materiality_assessment_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  materiality_assessment_id UUID REFERENCES materiality_assessments(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  impact_materiality INTEGER NOT NULL,
  financial_materiality INTEGER NOT NULL,
  rationale_snapshot JSONB,
  changed_by UUID REFERENCES profiles(id),
  change_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create assessment workflows table
CREATE TABLE IF NOT EXISTS assessment_workflows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  esrs_topic_id INTEGER REFERENCES esrs_topics(id) ON DELETE CASCADE,
  current_status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'under_review', 'approved', 'rejected'
  assigned_to UUID REFERENCES profiles(id),
  reviewer_id UUID REFERENCES profiles(id),
  approver_id UUID REFERENCES profiles(id),
  review_notes TEXT,
  approval_notes TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update materiality_assessments table
ALTER TABLE materiality_assessments ADD COLUMN IF NOT EXISTS inside_out_impact INTEGER CHECK (inside_out_impact >= 1 AND inside_out_impact <= 5);
ALTER TABLE materiality_assessments ADD COLUMN IF NOT EXISTS outside_in_impact INTEGER CHECK (outside_in_impact >= 1 AND outside_in_impact <= 5);
ALTER TABLE materiality_assessments ADD COLUMN IF NOT EXISTS materiality_status VARCHAR(20) DEFAULT 'not_material' CHECK (materiality_status IN ('not_material', 'material', 'highly_material'));
ALTER TABLE materiality_assessments ADD COLUMN IF NOT EXISTS assessment_status VARCHAR(20) DEFAULT 'draft' CHECK (assessment_status IN ('draft', 'under_review', 'approved'));
ALTER TABLE materiality_assessments ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE materiality_assessments ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES profiles(id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_stakeholders_organization_id ON stakeholders(organization_id);
CREATE INDEX IF NOT EXISTS idx_stakeholder_engagements_topic_id ON stakeholder_engagements(esrs_topic_id);
CREATE INDEX IF NOT EXISTS idx_evidence_documents_topic_id ON evidence_documents(esrs_topic_id);
CREATE INDEX IF NOT EXISTS idx_materiality_assessments_status ON materiality_assessments(assessment_status);
CREATE INDEX IF NOT EXISTS idx_esrs_topics_category ON esrs_topics(category);
CREATE INDEX IF NOT EXISTS idx_esrs_topics_active ON esrs_topics(is_active);

-- Insert comprehensive ESRS topics data
INSERT INTO esrs_topics (code, name, category, description, subtopics, kpis, industry_benchmarks, esrs_reference) VALUES
-- Environmental Topics
('E1', 'Climate Change', 'Environmental', 'Climate change mitigation and adaptation', 
 '["Greenhouse gas emissions", "Energy efficiency", "Renewable energy", "Climate adaptation"]',
 '["Scope 1, 2, 3 emissions", "Energy consumption", "Renewable energy %", "Climate risk exposure"]',
 '{"high_impact_sectors": ["Energy", "Transport", "Manufacturing"], "benchmark_threshold": 3}',
 'ESRS E1'),
('E2', 'Pollution', 'Environmental', 'Pollution prevention and control',
 '["Air pollution", "Water pollution", "Soil contamination", "Waste management"]',
 '["Air emissions", "Water discharge", "Waste generated", "Recycling rate"]',
 '{"high_impact_sectors": ["Chemicals", "Mining", "Manufacturing"], "benchmark_threshold": 3}',
 'ESRS E2'),
('E3', 'Water and Marine Resources', 'Environmental', 'Water and marine resource management',
 '["Water consumption", "Water quality", "Marine biodiversity", "Water stress"]',
 '["Water withdrawal", "Water discharge quality", "Water recycling", "Water stress index"]',
 '{"high_impact_sectors": ["Agriculture", "Food & Beverage", "Textiles"], "benchmark_threshold": 3}',
 'ESRS E3'),
('E4', 'Biodiversity and Ecosystems', 'Environmental', 'Biodiversity and ecosystem protection',
 '["Habitat destruction", "Species protection", "Ecosystem services", "Deforestation"]',
 '["Land use change", "Species impact", "Ecosystem restoration", "Biodiversity index"]',
 '{"high_impact_sectors": ["Agriculture", "Forestry", "Mining"], "benchmark_threshold": 3}',
 'ESRS E4'),
('E5', 'Resource Use and Circular Economy', 'Environmental', 'Resource efficiency and circular economy',
 '["Resource consumption", "Circular economy", "Waste reduction", "Product lifecycle"]',
 '["Material consumption", "Recycling rate", "Waste to landfill", "Circularity index"]',
 '{"high_impact_sectors": ["Manufacturing", "Retail", "Packaging"], "benchmark_threshold": 3}',
 'ESRS E5'),

-- Social Topics
('S1', 'Own Workforce', 'Social', 'Workforce rights and working conditions',
 '["Working conditions", "Health & safety", "Diversity & inclusion", "Training & development"]',
 '["Workplace injuries", "Employee turnover", "Diversity metrics", "Training hours"]',
 '{"high_impact_sectors": ["Manufacturing", "Construction", "Healthcare"], "benchmark_threshold": 4}',
 'ESRS S1'),
('S2', 'Workers in Value Chain', 'Social', 'Rights of workers in the value chain',
 '["Supply chain labor", "Forced labor", "Child labor", "Living wage"]',
 '["Supplier audits", "Labor violations", "Living wage compliance", "Supplier diversity"]',
 '{"high_impact_sectors": ["Retail", "Textiles", "Electronics"], "benchmark_threshold": 4}',
 'ESRS S2'),
('S3', 'Affected Communities', 'Social', 'Rights of affected communities',
 '["Community impact", "Indigenous rights", "Land rights", "Community development"]',
 '["Community investments", "Land disputes", "Community satisfaction", "Indigenous engagement"]',
 '{"high_impact_sectors": ["Mining", "Energy", "Infrastructure"], "benchmark_threshold": 4}',
 'ESRS S3'),
('S4', 'Consumers and End-Users', 'Social', 'Consumer and end-user rights',
 '["Product safety", "Data privacy", "Accessibility", "Consumer protection"]',
 '["Product recalls", "Privacy breaches", "Accessibility compliance", "Consumer complaints"]',
 '{"high_impact_sectors": ["Technology", "Healthcare", "Financial Services"], "benchmark_threshold": 4}',
 'ESRS S4'),

-- Governance Topics
('G1', 'Business Conduct', 'Governance', 'Business ethics and conduct',
 '["Anti-corruption", "Anti-bribery", "Business ethics", "Compliance"]',
 '["Ethics violations", "Compliance training", "Whistleblower reports", "Anti-corruption measures"]',
 '{"high_impact_sectors": ["All sectors"], "benchmark_threshold": 5}',
 'ESRS G1'),
('G2', 'Corporate Culture', 'Governance', 'Corporate culture and values',
 '["Corporate values", "Culture assessment", "Leadership", "Organizational behavior"]',
 '["Culture surveys", "Leadership effectiveness", "Employee engagement", "Values alignment"]',
 '{"high_impact_sectors": ["All sectors"], "benchmark_threshold": 4}',
 'ESRS G2'),
('G3', 'Management of Material Sustainability Risks', 'Governance', 'Risk management and oversight',
 '["Risk management", "Board oversight", "Sustainability governance", "Risk monitoring"]',
 '["Risk assessments", "Board meetings", "Risk incidents", "Governance effectiveness"]',
 '{"high_impact_sectors": ["All sectors"], "benchmark_threshold": 5}',
 'ESRS G3'),
('G4', 'Incentive Schemes', 'Governance', 'Executive compensation and incentives',
 '["Executive pay", "Sustainability incentives", "Performance metrics", "Pay equity"]',
 '["CEO pay ratio", "Sustainability-linked pay", "Gender pay gap", "Performance metrics"]',
 '{"high_impact_sectors": ["All sectors"], "benchmark_threshold": 4}',
 'ESRS G4')
ON CONFLICT (code) DO UPDATE SET
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  subtopics = EXCLUDED.subtopics,
  kpis = EXCLUDED.kpis,
  industry_benchmarks = EXCLUDED.industry_benchmarks,
  esrs_reference = EXCLUDED.esrs_reference;

-- Enable RLS on new tables
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholder_engagements ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiality_rationale ENABLE ROW LEVEL SECURITY;
ALTER TABLE materiality_assessment_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_workflows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Users can view stakeholders for their organization" ON stakeholders
  FOR SELECT USING (organization_id IN (
    SELECT id FROM organizations WHERE id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage stakeholders for their organization" ON stakeholders
  FOR ALL USING (organization_id IN (
    SELECT id FROM organizations WHERE id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can view stakeholder engagements for their organization" ON stakeholder_engagements
  FOR SELECT USING (organization_id IN (
    SELECT id FROM organizations WHERE id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage stakeholder engagements for their organization" ON stakeholder_engagements
  FOR ALL USING (organization_id IN (
    SELECT id FROM organizations WHERE id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can view evidence documents for their organization" ON evidence_documents
  FOR SELECT USING (organization_id IN (
    SELECT id FROM organizations WHERE id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage evidence documents for their organization" ON evidence_documents
  FOR ALL USING (organization_id IN (
    SELECT id FROM organizations WHERE id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can view materiality rationale for their organization" ON materiality_rationale
  FOR SELECT USING (materiality_assessment_id IN (
    SELECT id FROM materiality_assessments WHERE organization_id IN (
      SELECT id FROM organizations WHERE id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can manage materiality rationale for their organization" ON materiality_rationale
  FOR ALL USING (materiality_assessment_id IN (
    SELECT id FROM materiality_assessments WHERE organization_id IN (
      SELECT id FROM organizations WHERE id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can view assessment versions for their organization" ON materiality_assessment_versions
  FOR SELECT USING (materiality_assessment_id IN (
    SELECT id FROM materiality_assessments WHERE organization_id IN (
      SELECT id FROM organizations WHERE id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can manage assessment versions for their organization" ON materiality_assessment_versions
  FOR ALL USING (materiality_assessment_id IN (
    SELECT id FROM materiality_assessments WHERE organization_id IN (
      SELECT id FROM organizations WHERE id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can view assessment workflows for their organization" ON assessment_workflows
  FOR SELECT USING (organization_id IN (
    SELECT id FROM organizations WHERE id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage assessment workflows for their organization" ON assessment_workflows
  FOR ALL USING (organization_id IN (
    SELECT id FROM organizations WHERE id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));
