-- Create stakeholder roles enum
CREATE TYPE stakeholder_role AS ENUM ('admin', 'manager', 'contributor');
CREATE TYPE stakeholder_status AS ENUM ('active', 'pending', 'inactive');

-- Create stakeholders table
CREATE TABLE stakeholders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role stakeholder_role NOT NULL DEFAULT 'contributor',
  status stakeholder_status NOT NULL DEFAULT 'pending',
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  last_active TIMESTAMP WITH TIME ZONE,
  assigned_areas TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Ensure unique email per organization
  UNIQUE(email, organization_id)
);

-- Create stakeholder invites table
CREATE TABLE stakeholder_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL,
  role stakeholder_role NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Ensure unique pending invite per email per organization
  UNIQUE(email, organization_id) WHERE used_at IS NULL
);

-- Create stakeholder assignments table
CREATE TABLE stakeholder_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stakeholder_id UUID NOT NULL REFERENCES stakeholders(id) ON DELETE CASCADE,
  area_type VARCHAR(50) NOT NULL CHECK (area_type IN ('materiality', 'value_chain', 'reporting', 'compliance', 'data_hub')),
  area_id VARCHAR(255) NOT NULL,
  assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Ensure unique assignment per stakeholder per area
  UNIQUE(stakeholder_id, area_type, area_id)
);

-- Create indexes for better performance
CREATE INDEX idx_stakeholders_organization_id ON stakeholders(organization_id);
CREATE INDEX idx_stakeholders_user_id ON stakeholders(user_id);
CREATE INDEX idx_stakeholders_email ON stakeholders(email);
CREATE INDEX idx_stakeholders_role ON stakeholders(role);
CREATE INDEX idx_stakeholders_status ON stakeholders(status);

CREATE INDEX idx_stakeholder_invites_organization_id ON stakeholder_invites(organization_id);
CREATE INDEX idx_stakeholder_invites_token ON stakeholder_invites(token);
CREATE INDEX idx_stakeholder_invites_email ON stakeholder_invites(email);

CREATE INDEX idx_stakeholder_assignments_stakeholder_id ON stakeholder_assignments(stakeholder_id);
CREATE INDEX idx_stakeholder_assignments_area ON stakeholder_assignments(area_type, area_id);

-- Create RLS policies
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholder_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholder_assignments ENABLE ROW LEVEL SECURITY;

-- Stakeholders can see other stakeholders in their organization
CREATE POLICY "Users can view stakeholders in their organization" ON stakeholders
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid()
    )
  );

-- Only admins and managers can insert stakeholders
CREATE POLICY "Admins and managers can create stakeholders" ON stakeholders
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN stakeholders s ON s.user_id = ur.user_id
      WHERE ur.user_id = auth.uid() 
      AND s.organization_id = stakeholders.organization_id
      AND s.role IN ('admin', 'manager')
    )
  );

-- Stakeholders can update their own record, admins can update any
CREATE POLICY "Stakeholders can update their own record or admins can update any" ON stakeholders
  FOR UPDATE USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN stakeholders s ON s.user_id = ur.user_id
      WHERE ur.user_id = auth.uid() 
      AND s.organization_id = stakeholders.organization_id
      AND s.role = 'admin'
    )
  );

-- Only admins can delete stakeholders
CREATE POLICY "Only admins can delete stakeholders" ON stakeholders
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN stakeholders s ON s.user_id = ur.user_id
      WHERE ur.user_id = auth.uid() 
      AND s.organization_id = stakeholders.organization_id
      AND s.role = 'admin'
    )
  );

-- Stakeholder invites policies
CREATE POLICY "Users can view invites in their organization" ON stakeholder_invites
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM user_roles 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins and managers can create invites" ON stakeholder_invites
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN stakeholders s ON s.user_id = ur.user_id
      WHERE ur.user_id = auth.uid() 
      AND s.organization_id = stakeholder_invites.organization_id
      AND s.role IN ('admin', 'manager')
    )
  );

-- Stakeholder assignments policies
CREATE POLICY "Users can view assignments in their organization" ON stakeholder_assignments
  FOR SELECT USING (
    stakeholder_id IN (
      SELECT id FROM stakeholders 
      WHERE organization_id IN (
        SELECT organization_id FROM user_roles 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Admins and managers can manage assignments" ON stakeholder_assignments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN stakeholders s ON s.user_id = ur.user_id
      WHERE ur.user_id = auth.uid() 
      AND s.organization_id = (
        SELECT organization_id FROM stakeholders 
        WHERE id = stakeholder_assignments.stakeholder_id
      )
      AND s.role IN ('admin', 'manager')
    )
  );

-- Create function to automatically create stakeholder when user signs up
CREATE OR REPLACE FUNCTION create_stakeholder_from_invite()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if there's a pending invite for this email
  INSERT INTO stakeholders (
    email,
    name,
    role,
    status,
    organization_id,
    user_id,
    invited_by,
    invited_at,
    joined_at
  )
  SELECT 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    si.role,
    'active',
    si.organization_id,
    NEW.id,
    si.invited_by,
    si.created_at,
    NOW()
  FROM stakeholder_invites si
  WHERE si.email = NEW.email
    AND si.used_at IS NULL
    AND si.expires_at > NOW()
  ON CONFLICT (email, organization_id) DO UPDATE SET
    user_id = NEW.id,
    status = 'active',
    joined_at = NOW(),
    updated_at = NOW();
  
  -- Mark the invite as used
  UPDATE stakeholder_invites 
  SET used_at = NOW()
  WHERE email = NEW.email
    AND used_at IS NULL
    AND expires_at > NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create stakeholder when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_stakeholder_from_invite();
