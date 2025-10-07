-- Update the trigger function to automatically create admin stakeholders
CREATE OR REPLACE FUNCTION create_stakeholder_from_invite()
RETURNS TRIGGER AS $$
DECLARE
  user_org_id UUID;
BEGIN
  -- First, check if there's a pending invite for this email
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
  
  -- If no invite was found, create a default admin stakeholder
  -- First, get or create a default organization for this user
  SELECT id INTO user_org_id
  FROM organizations 
  WHERE name = COALESCE(NEW.raw_user_meta_data->>'organization_name', 'My Organization')
  AND created_by = NEW.id
  LIMIT 1;
  
  -- If no organization exists, create one
  IF user_org_id IS NULL THEN
    INSERT INTO organizations (name, created_by, description)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'organization_name', 'My Organization'),
      NEW.id,
      'Default organization created during user registration'
    )
    RETURNING id INTO user_org_id;
  END IF;
  
  -- Create admin stakeholder for the user
  INSERT INTO stakeholders (
    email,
    name,
    role,
    status,
    organization_id,
    user_id,
    invited_by,
    joined_at
  )
  VALUES (
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    'admin',
    'active',
    user_org_id,
    NEW.id,
    NEW.id,
    NOW()
  )
  ON CONFLICT (email, organization_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
