-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create organizations table
CREATE TABLE organizations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  sector TEXT NOT NULL,
  employee_count INTEGER NOT NULL,
  first_reporting_year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create ESRS topics table
CREATE TABLE esrs_topics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create materiality assessments table
CREATE TABLE materiality_assessments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  esrs_topic_id UUID REFERENCES esrs_topics(id) ON DELETE CASCADE,
  impact_materiality INTEGER NOT NULL CHECK (impact_materiality >= 0 AND impact_materiality <= 100),
  financial_materiality INTEGER NOT NULL CHECK (financial_materiality >= 0 AND financial_materiality <= 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(organization_id, esrs_topic_id)
);

-- Create ESG metrics table
CREATE TABLE esg_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  owner TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  evidence_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create report sections table
CREATE TABLE report_sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  section_title TEXT NOT NULL,
  content TEXT NOT NULL,
  esrs_topic_id UUID REFERENCES esrs_topics(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample ESRS topics
INSERT INTO esrs_topics (code, title, description, category) VALUES
('E1', 'Climate Change', 'Climate change mitigation and adaptation', 'Environmental'),
('E2', 'Pollution', 'Pollution prevention and control', 'Environmental'),
('E3', 'Water and Marine Resources', 'Sustainable use and protection of water and marine resources', 'Environmental'),
('E4', 'Biodiversity and Ecosystems', 'Protection and restoration of biodiversity and ecosystems', 'Environmental'),
('E5', 'Resource Use and Circular Economy', 'Sustainable use of resources and circular economy', 'Environmental'),
('S1', 'Own Workforce', 'Working conditions and equal treatment', 'Social'),
('S2', 'Workers in Value Chain', 'Working conditions and equal treatment in value chain', 'Social'),
('S3', 'Affected Communities', 'Rights of affected communities', 'Social'),
('S4', 'Consumers and End-Users', 'Rights of consumers and end-users', 'Social'),
('G1', 'Governance', 'Governance, risk management and internal control', 'Governance');

-- Create indexes for better performance
CREATE INDEX idx_materiality_assessments_org_id ON materiality_assessments(organization_id);
CREATE INDEX idx_esg_metrics_org_id ON esg_metrics(organization_id);
CREATE INDEX idx_report_sections_org_id ON report_sections(organization_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_materiality_assessments_updated_at BEFORE UPDATE ON materiality_assessments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_esg_metrics_updated_at BEFORE UPDATE ON esg_metrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_report_sections_updated_at BEFORE UPDATE ON report_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
