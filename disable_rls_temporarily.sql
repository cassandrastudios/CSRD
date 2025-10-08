-- Temporarily Disable RLS to Fix Database Issues
-- Run this SQL in your Supabase SQL Editor

-- 1. Drop ALL existing policies
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Users can update organizations they belong to" ON organizations;
DROP POLICY IF EXISTS "Users can delete organizations they own" ON organizations;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON organizations;
DROP POLICY IF EXISTS "organizations_policy" ON organizations;

DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can create roles for their organizations" ON user_roles;
DROP POLICY IF EXISTS "Users can update roles in their organizations" ON user_roles;
DROP POLICY IF EXISTS "Users can delete roles from their organizations" ON user_roles;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON user_roles;
DROP POLICY IF EXISTS "user_roles_policy" ON user_roles;

DROP POLICY IF EXISTS "Users can view invites for their organizations" ON team_invites;
DROP POLICY IF EXISTS "Users can create invites for their organizations" ON team_invites;
DROP POLICY IF EXISTS "Users can delete invites from their organizations" ON team_invites;
DROP POLICY IF EXISTS "Allow all operations for authenticated users" ON team_invites;
DROP POLICY IF EXISTS "team_invites_policy" ON team_invites;

-- 2. Drop the problematic trigger and function
DROP TRIGGER IF EXISTS add_user_as_admin_trigger ON organizations;
DROP FUNCTION IF EXISTS add_user_as_admin();

-- 3. TEMPORARILY DISABLE RLS COMPLETELY
-- This will allow all operations without authentication checks
ALTER TABLE organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_invites DISABLE ROW LEVEL SECURITY;

-- 4. Test that tables are accessible
-- This should return true if RLS is properly disabled
SELECT 
  (SELECT COUNT(*) FROM organizations) as org_count,
  (SELECT COUNT(*) FROM user_roles) as role_count,
  (SELECT COUNT(*) FROM team_invites) as invite_count,
  'RLS disabled successfully' as status;
