-- Populate ESRS topics with sample data
INSERT INTO esrs_topics (code, name, description, category) VALUES
-- Environmental Topics
('E1', 'Climate Change', 'Climate change mitigation and adaptation measures, including greenhouse gas emissions reduction and climate risk management', 'Environmental'),
('E2', 'Pollution', 'Pollution prevention and control, including air, water, and soil pollution management', 'Environmental'),
('E3', 'Water and Marine Resources', 'Water and marine resource management, including water consumption and marine biodiversity protection', 'Environmental'),
('E4', 'Biodiversity and Ecosystems', 'Biodiversity and ecosystem protection, including habitat conservation and species protection', 'Environmental'),
('E5', 'Resource Use and Circular Economy', 'Resource efficiency and circular economy practices, including waste reduction and material circularity', 'Environmental'),

-- Social Topics
('S1', 'Own Workforce', 'Rights and working conditions of the company''s own workforce, including health and safety, diversity and inclusion', 'Social'),
('S2', 'Workers in Value Chain', 'Rights of workers in the value chain, including supply chain labor standards and human rights', 'Social'),
('S3', 'Affected Communities', 'Rights of affected communities, including community impact and indigenous rights', 'Social'),
('S4', 'Consumers and End-Users', 'Consumer and end-user rights, including product safety and data privacy', 'Social'),

-- Governance Topics
('G1', 'Business Conduct', 'Business ethics and conduct, including anti-corruption and anti-bribery measures', 'Governance'),
('G2', 'Corporate Culture', 'Corporate culture and values, including leadership and organizational behavior', 'Governance'),
('G3', 'Management of Material Sustainability Risks', 'Risk management and oversight of sustainability-related risks', 'Governance'),
('G4', 'Incentive Schemes', 'Executive compensation and incentive schemes, including sustainability-linked pay', 'Governance')
ON CONFLICT (code) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  category = EXCLUDED.category;
