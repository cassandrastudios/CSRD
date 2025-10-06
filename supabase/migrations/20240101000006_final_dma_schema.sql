-- Final Double Materiality Assessment Schema
-- Fixed unique constraint and optimized for multi-user collaboration

-- Topics table (enhanced)
CREATE TABLE IF NOT EXISTS topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  category VARCHAR(20) NOT NULL CHECK (category IN ('Environmental', 'Social', 'Governance')),
  status VARCHAR(20) DEFAULT 'under_review' CHECK (status IN ('core', 'emerging', 'under_review', 'not_relevant')),
  custom_flag BOOLEAN DEFAULT false,
  description TEXT,
  esrs_code VARCHAR(10) UNIQUE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stakeholders table
CREATE TABLE IF NOT EXISTS stakeholders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('employee', 'client', 'investor', 'ngo', 'regulator', 'supplier', 'community', 'other')),
  influence INTEGER CHECK (influence >= 1 AND influence <= 5),
  engagement_type VARCHAR(50) CHECK (engagement_type IN ('survey', 'interview', 'workshop', 'focus_group', 'public_consultation', 'other')),
  notes TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Value chain mapping
CREATE TABLE IF NOT EXISTS value_chain (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  step VARCHAR(20) NOT NULL CHECK (step IN ('upstream', 'own_operations', 'downstream')),
  note TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Impacts, Risks, and Opportunities (IROs)
CREATE TABLE IF NOT EXISTS iros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('impact', 'risk', 'opportunity')),
  description TEXT NOT NULL,
  source VARCHAR(255),
  stakeholder_id UUID REFERENCES stakeholders(id) ON DELETE SET NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stakeholder feedback
CREATE TABLE IF NOT EXISTS stakeholder_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  stakeholder_id UUID REFERENCES stakeholders(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  note TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Materiality scores
CREATE TABLE IF NOT EXISTS scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 5),
  financial_score INTEGER CHECK (financial_score >= 1 AND financial_score <= 5),
  total_score DECIMAL(3,2) GENERATED ALWAYS AS ((impact_score + financial_score) / 2.0) STORED,
  rationale TEXT,
  scale_score INTEGER CHECK (scale_score >= 1 AND scale_score <= 5),
  scope_score INTEGER CHECK (scope_score >= 1 AND scope_score <= 5),
  remediability_score INTEGER CHECK (remediability_score >= 1 AND remediability_score <= 5),
  likelihood_score INTEGER CHECK (likelihood_score >= 1 AND likelihood_score <= 5),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evidence documents
CREATE TABLE IF NOT EXISTS evidence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(50),
  file_size INTEGER,
  description TEXT,
  uploaded_by UUID REFERENCES profiles(id),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log for collaboration tracking
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles and permissions for collaboration
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'manager', 'contributor', 'viewer', 'auditor')),
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Task assignments for collaboration
CREATE TABLE IF NOT EXISTS task_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by UUID REFERENCES profiles(id) ON DELETE CASCADE,
  task_type VARCHAR(50) NOT NULL CHECK (task_type IN ('scoring', 'evidence', 'review', 'approval')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
  due_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comments and discussions for collaboration
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_topics_organization_id ON topics(organization_id);
CREATE INDEX IF NOT EXISTS idx_topics_category ON topics(category);
CREATE INDEX IF NOT EXISTS idx_value_chain_topic_id ON value_chain(topic_id);
CREATE INDEX IF NOT EXISTS idx_iros_topic_id ON iros(topic_id);
CREATE INDEX IF NOT EXISTS idx_stakeholders_organization_id ON stakeholders(organization_id);
CREATE INDEX IF NOT EXISTS idx_stakeholder_feedback_topic_id ON stakeholder_feedback(topic_id);
CREATE INDEX IF NOT EXISTS idx_scores_topic_id ON scores(topic_id);
CREATE INDEX IF NOT EXISTS idx_evidence_topic_id ON evidence(topic_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_organization_id ON audit_log(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_organization_id ON user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_topic_id ON task_assignments(topic_id);
CREATE INDEX IF NOT EXISTS idx_comments_entity ON comments(entity_type, entity_id);

-- Enable RLS
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE value_chain ENABLE ROW LEVEL SECURITY;
ALTER TABLE iros ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholder_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collaboration
CREATE POLICY "Users can view topics for their organization" ON topics
  FOR SELECT USING (organization_id IN (
    SELECT id FROM organizations WHERE id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Users can manage topics for their organization" ON topics
  FOR ALL USING (organization_id IN (
    SELECT id FROM organizations WHERE id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));

-- Similar policies for other tables...
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

-- User roles policies
CREATE POLICY "Users can view roles for their organization" ON user_roles
  FOR SELECT USING (organization_id IN (
    SELECT id FROM organizations WHERE id IN (
      SELECT organization_id FROM profiles WHERE id = auth.uid()
    )
  ));

CREATE POLICY "Admins can manage roles for their organization" ON user_roles
  FOR ALL USING (
    organization_id IN (
      SELECT id FROM organizations WHERE id IN (
        SELECT organization_id FROM profiles WHERE id = auth.uid()
      )
    ) AND
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND organization_id = user_roles.organization_id 
      AND role = 'admin'
    )
  );

-- Insert sample ESRS topics
INSERT INTO topics (title, category, status, description, esrs_code, custom_flag) VALUES
-- Environmental Topics
('Climate Change', 'Environmental', 'core', 'Climate change mitigation and adaptation measures, including greenhouse gas emissions reduction and climate risk management', 'E1', false),
('Pollution', 'Environmental', 'core', 'Pollution prevention and control, including air, water, and soil pollution management', 'E2', false),
('Water and Marine Resources', 'Environmental', 'core', 'Water and marine resource management, including water consumption and marine biodiversity protection', 'E3', false),
('Biodiversity and Ecosystems', 'Environmental', 'core', 'Biodiversity and ecosystem protection, including habitat conservation and species protection', 'E4', false),
('Resource Use and Circular Economy', 'Environmental', 'core', 'Resource efficiency and circular economy practices, including waste reduction and material circularity', 'E5', false),

-- Social Topics
('Own Workforce', 'Social', 'core', 'Rights and working conditions of the company''s own workforce, including health and safety, diversity and inclusion', 'S1', false),
('Workers in Value Chain', 'Social', 'core', 'Rights of workers in the value chain, including supply chain labor standards and human rights', 'S2', false),
('Affected Communities', 'Social', 'core', 'Rights of affected communities, including community impact and indigenous rights', 'S3', false),
('Consumers and End-Users', 'Social', 'core', 'Consumer and end-user rights, including product safety and data privacy', 'S4', false),

-- Governance Topics
('Business Conduct', 'Governance', 'core', 'Business ethics and conduct, including anti-corruption and anti-bribery measures', 'G1', false),
('Corporate Culture', 'Governance', 'core', 'Corporate culture and values, including leadership and organizational behavior', 'G2', false),
('Management of Material Sustainability Risks', 'Governance', 'core', 'Risk management and oversight of sustainability-related risks', 'G3', false),
('Incentive Schemes', 'Governance', 'core', 'Executive compensation and incentive schemes, including sustainability-linked pay', 'G4', false)
ON CONFLICT (esrs_code) DO NOTHING;
