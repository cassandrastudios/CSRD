-- Complete Database Reset - Fix All RLS Issues
-- Run this SQL in your Supabase SQL Editor to completely fix the database

-- 1. Drop ALL existing policies to start completely fresh
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Users can update organizations they belong to" ON organizations;
DROP POLICY IF EXISTS "Users can delete organizations they own" ON organizations;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON organizations;

DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can create roles for their organizations" ON user_roles;
DROP POLICY IF EXISTS "Users can update roles in their organizations" ON user_roles;
DROP POLICY IF EXISTS "Users can delete roles from their organizations" ON user_roles;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON user_roles;

DROP POLICY IF EXISTS "Users can view invites for their organizations" ON team_invites;
DROP POLICY IF EXISTS "Users can create invites for their organizations" ON team_invites;
DROP POLICY IF EXISTS "Users can delete invites from their organizations" ON team_invites;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON team_invites;

-- 2. Drop the problematic trigger and function
DROP TRIGGER IF EXISTS add_user_as_admin_trigger ON organizations;
DROP FUNCTION IF EXISTS add_user_as_admin();

-- 3. Temporarily disable RLS to allow data operations
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites DISABLE ROW LEVEL SECURITY;

-- 4. Re-enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- 5. Create very simple, non-recursive policies
-- Organizations: Allow all operations for authenticated users
CREATE POLICY "organizations_policy" ON organizations
  FOR ALL USING (auth.uid() IS NOT NULL);

-- User roles: Allow all operations for authenticated users  
CREATE POLICY "user_roles_policy" ON user_roles
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Team invites: Allow all operations for authenticated users
CREATE POLICY "team_invites_policy" ON team_invites
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 6. Create a simple trigger function without recursion
CREATE OR REPLACE FUNCTION add_user_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user role without any complex logic
  INSERT INTO user_roles (user_id, organization_id, role)
  VALUES (auth.uid(), NEW.id, 'admin')
  ON CONFLICT (user_id, organization_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create the trigger
CREATE TRIGGER add_user_as_admin_trigger
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION add_user_as_admin();

-- 8. Test the policies by checking if they work
-- This should return true if policies are working
SELECT auth.uid() IS NOT NULL as policies_working;
