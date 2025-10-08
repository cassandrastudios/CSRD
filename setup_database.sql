-- CSRD Co-Pilot Database Setup
-- Run this SQL in your Supabase SQL Editor

-- 1. Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sector TEXT,
  employee_count INTEGER,
  website TEXT,
  address TEXT,
  city TEXT,
  country TEXT,
  phone TEXT,
  first_reporting_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'contributor', 'viewer')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- 3. Create team_invites table
CREATE TABLE IF NOT EXISTS team_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'contributor', 'viewer')),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  organization_name TEXT,
  inviter_name TEXT,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- 5. Organizations RLS policies
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
CREATE POLICY "Users can view organizations they belong to" ON organizations
  FOR SELECT USING (
    id IN (SELECT organization_id FROM user_roles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
CREATE POLICY "Users can create organizations" ON organizations
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update organizations they belong to" ON organizations;
CREATE POLICY "Users can update organizations they belong to" ON organizations
  FOR UPDATE USING (
    id IN (SELECT organization_id FROM user_roles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete organizations they own" ON organizations;
CREATE POLICY "Users can delete organizations they own" ON organizations
  FOR DELETE USING (
    id IN (SELECT organization_id FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 6. User roles RLS policies
DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
CREATE POLICY "Users can view their own roles" ON user_roles
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can create roles for their organizations" ON user_roles;
CREATE POLICY "Users can create roles for their organizations" ON user_roles
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM user_roles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update roles in their organizations" ON user_roles;
CREATE POLICY "Users can update roles in their organizations" ON user_roles
  FOR UPDATE USING (
    organization_id IN (SELECT organization_id FROM user_roles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete roles from their organizations" ON user_roles;
CREATE POLICY "Users can delete roles from their organizations" ON user_roles
  FOR DELETE USING (
    organization_id IN (SELECT organization_id FROM user_roles WHERE user_id = auth.uid())
  );

-- 7. Team invites RLS policies
DROP POLICY IF EXISTS "Users can view invites for their organizations" ON team_invites;
CREATE POLICY "Users can view invites for their organizations" ON team_invites
  FOR SELECT USING (
    organization_id IN (SELECT organization_id FROM user_roles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can create invites for their organizations" ON team_invites;
CREATE POLICY "Users can create invites for their organizations" ON team_invites
  FOR INSERT WITH CHECK (
    organization_id IN (SELECT organization_id FROM user_roles WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete invites from their organizations" ON team_invites;
CREATE POLICY "Users can delete invites from their organizations" ON team_invites
  FOR DELETE USING (
    organization_id IN (SELECT organization_id FROM user_roles WHERE user_id = auth.uid())
  );

-- 8. Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_organization_id ON user_roles(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_token ON team_invites(token);
CREATE INDEX IF NOT EXISTS idx_team_invites_organization_id ON team_invites(organization_id);
CREATE INDEX IF NOT EXISTS idx_team_invites_expires_at ON team_invites(expires_at);

-- 9. Create function to automatically add user as admin when creating organization
CREATE OR REPLACE FUNCTION add_user_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_roles (user_id, organization_id, role)
  VALUES (auth.uid(), NEW.id, 'admin');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create trigger to automatically add user as admin
DROP TRIGGER IF EXISTS add_user_as_admin_trigger ON organizations;
CREATE TRIGGER add_user_as_admin_trigger
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION add_user_as_admin();
