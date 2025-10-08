-- Fix organizations table RLS policies
-- This migration adds proper RLS policies for the organizations table

-- Enable RLS on organizations table
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create a simple user_organizations table to track user-organization relationships
CREATE TABLE IF NOT EXISTS user_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'contributor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- Enable RLS on user_organizations
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_organizations_user_id ON user_organizations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_organizations_organization_id ON user_organizations(organization_id);

-- RLS Policies for organizations table
-- Users can view organizations they belong to
CREATE POLICY "Users can view their organizations" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- Users can insert organizations (they become admin by default)
CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT WITH CHECK (true);

-- Users can update organizations they belong to
CREATE POLICY "Users can update their organizations" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can delete organizations
CREATE POLICY "Only admins can delete organizations" ON organizations
  FOR DELETE USING (
    id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- RLS Policies for user_organizations table
-- Users can view their own organization memberships
CREATE POLICY "Users can view their organization memberships" ON user_organizations
  FOR SELECT USING (user_id = auth.uid());

-- Users can view organization memberships for organizations they belong to
CREATE POLICY "Users can view organization members" ON user_organizations
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid()
    )
  );

-- Only admins can manage organization memberships
CREATE POLICY "Admins can manage organization memberships" ON user_organizations
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id 
      FROM user_organizations 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Function to automatically add user to organization when they create one
CREATE OR REPLACE FUNCTION add_user_to_organization()
RETURNS TRIGGER AS $$
BEGIN
  -- Add the user who created the organization as an admin
  INSERT INTO user_organizations (user_id, organization_id, role)
  VALUES (auth.uid(), NEW.id, 'admin');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically add user to organization
CREATE TRIGGER on_organization_created
  AFTER INSERT ON organizations
  FOR EACH ROW EXECUTE FUNCTION add_user_to_organization();

-- Function to create a default organization for new users
CREATE OR REPLACE FUNCTION create_default_organization()
RETURNS TRIGGER AS $$
DECLARE
  org_id UUID;
BEGIN
  -- Create a default organization for the new user
  INSERT INTO organizations (name, sector, employee_count, first_reporting_year)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'organization_name', 'My Organization'),
    COALESCE(NEW.raw_user_meta_data->>'sector', 'Other'),
    1,
    EXTRACT(YEAR FROM NOW()) + 1
  )
  RETURNING id INTO org_id;
  
  -- Add the user as admin of this organization
  INSERT INTO user_organizations (user_id, organization_id, role)
  VALUES (NEW.id, org_id, 'admin');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create default organization for new users
CREATE TRIGGER on_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_default_organization();
