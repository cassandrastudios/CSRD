-- Test Database Connection
-- Run this in Supabase SQL Editor to verify the database is accessible

-- Test 1: Check if we can select from organizations table
SELECT COUNT(*) as organization_count FROM organizations;

-- Test 2: Check if we can insert a test record
INSERT INTO organizations (name, sector, employee_count, first_reporting_year)
VALUES ('Test Organization', 'Technology', 1, 2025)
RETURNING id, name;

-- Test 3: Check if we can select the test record
SELECT * FROM organizations WHERE name = 'Test Organization';

-- Test 4: Clean up test record
DELETE FROM organizations WHERE name = 'Test Organization';

-- Test 5: Final count
SELECT COUNT(*) as final_organization_count FROM organizations;
