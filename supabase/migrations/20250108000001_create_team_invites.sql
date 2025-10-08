-- Create team_invites table
CREATE TABLE team_invites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'contributor', 'viewer')),
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  organization_name TEXT,
  inviter_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  accepted_by UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE team_invites ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to view invites for their organization
CREATE POLICY "Users can view invites for their organization" ON team_invites
  FOR SELECT USING (
    organization_name IN (
      SELECT name FROM organizations 
      WHERE id IN (
        SELECT organization_id FROM user_roles 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy to allow users to create invites for their organization
CREATE POLICY "Users can create invites for their organization" ON team_invites
  FOR INSERT WITH CHECK (
    organization_name IN (
      SELECT name FROM organizations 
      WHERE id IN (
        SELECT organization_id FROM user_roles 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Policy to allow users to update invites they created
CREATE POLICY "Users can update their invites" ON team_invites
  FOR UPDATE USING (
    inviter_name IN (
      SELECT COALESCE(user_metadata->>'display_name', user_metadata->>'full_name', email) 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

-- Policy to allow users to delete their invites
CREATE POLICY "Users can delete their invites" ON team_invites
  FOR DELETE USING (
    inviter_name IN (
      SELECT COALESCE(user_metadata->>'display_name', user_metadata->>'full_name', email) 
      FROM auth.users 
      WHERE id = auth.uid()
    )
  );

-- Create index for faster lookups
CREATE INDEX idx_team_invites_token ON team_invites(token);
CREATE INDEX idx_team_invites_email ON team_invites(email);
CREATE INDEX idx_team_invites_expires_at ON team_invites(expires_at);
