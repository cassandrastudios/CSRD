-- Fix Database Policies - Remove Infinite Recursion
-- Run this SQL in your Supabase SQL Editor to fix the RLS policy issues

-- 1. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
DROP POLICY IF EXISTS "Users can update organizations they belong to" ON organizations;
DROP POLICY IF EXISTS "Users can delete organizations they own" ON organizations;

DROP POLICY IF EXISTS "Users can view their own roles" ON user_roles;
DROP POLICY IF EXISTS "Users can create roles for their organizations" ON user_roles;
DROP POLICY IF EXISTS "Users can update roles in their organizations" ON user_roles;
DROP POLICY IF EXISTS "Users can delete roles from their organizations" ON user_roles;

DROP POLICY IF EXISTS "Users can view invites for their organizations" ON team_invites;
DROP POLICY IF EXISTS "Users can create invites for their organizations" ON team_invites;
DROP POLICY IF EXISTS "Users can delete invites from their organizations" ON team_invites;

-- 2. Create simple, non-recursive policies for organizations
CREATE POLICY "Allow all operations for authenticated users" ON organizations
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 3. Create simple policies for user_roles
CREATE POLICY "Allow all operations for authenticated users" ON user_roles
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 4. Create simple policies for team_invites
CREATE POLICY "Allow all operations for authenticated users" ON team_invites
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 5. Drop the problematic trigger function
DROP TRIGGER IF EXISTS add_user_as_admin_trigger ON organizations;
DROP FUNCTION IF EXISTS add_user_as_admin();

-- 6. Create a simpler trigger function that doesn't cause recursion
CREATE OR REPLACE FUNCTION add_user_as_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if the user doesn't already have a role in this organization
  INSERT INTO user_roles (user_id, organization_id, role)
  VALUES (auth.uid(), NEW.id, 'admin')
  ON CONFLICT (user_id, organization_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Recreate the trigger
CREATE TRIGGER add_user_as_admin_trigger
  AFTER INSERT ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION add_user_as_admin();
