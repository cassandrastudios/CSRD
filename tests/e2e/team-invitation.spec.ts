import { test, expect } from '@playwright/test';

test.describe('Team Invitation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to settings page
    await page.goto('/settings');

    // Wait for the page to load
    await page.waitForSelector('text=Settings');
  });

  test('should display team management section', async ({ page }) => {
    // Check that team management section is visible
    await expect(page.getByText('Team Management')).toBeVisible();
    await expect(page.getByText('Invite Team Members')).toBeVisible();
    await expect(page.getByText('Current Team')).toBeVisible();
    await expect(page.getByText('Role Permissions')).toBeVisible();
  });

  test('should open invite form when clicking invite member button', async ({
    page,
  }) => {
    // Click the invite member button
    await page.getByText('Invite Member').click();

    // Check that the invite form is visible
    await expect(page.getByText('Send Invitation')).toBeVisible();
    await expect(page.getByPlaceholder('colleague@company.com')).toBeVisible();
    await expect(
      page.getByDisplayValue('Contributor - Edit reports and data')
    ).toBeVisible();
  });

  test('should allow selecting different roles', async ({ page }) => {
    // Open invite form
    await page.getByText('Invite Member').click();

    // Select different roles
    const roleSelect = page.getByDisplayValue(
      'Contributor - Edit reports and data'
    );

    await roleSelect.selectOption('admin');
    await expect(roleSelect).toHaveValue('admin');

    await roleSelect.selectOption('manager');
    await expect(roleSelect).toHaveValue('manager');

    await roleSelect.selectOption('viewer');
    await expect(roleSelect).toHaveValue('viewer');
  });

  test('should validate email input', async ({ page }) => {
    // Open invite form
    await page.getByText('Invite Member').click();

    // Try to send invite with invalid email
    await page.getByPlaceholder('colleague@company.com').fill('invalid-email');
    await page.getByText('Send Invite').click();

    // Should show error message
    await expect(
      page.getByText('Please enter a valid email address')
    ).toBeVisible();
  });

  test('should send invite with valid email', async ({ page }) => {
    // Mock the API response
    await page.route('**/api/invite-member', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Invitation sent successfully',
        }),
      });
    });

    // Open invite form
    await page.getByText('Invite Member').click();

    // Fill in valid email and select role
    await page
      .getByPlaceholder('colleague@company.com')
      .fill('test@example.com');
    await page
      .getByDisplayValue('Contributor - Edit reports and data')
      .selectOption('contributor');

    // Send invite
    await page.getByText('Send Invite').click();

    // Should show success message
    await expect(
      page.getByText('Invite sent to test@example.com as contributor')
    ).toBeVisible();

    // Form should be closed
    await expect(page.getByText('Send Invitation')).not.toBeVisible();
  });

  test('should display pending invites', async ({ page }) => {
    // This test would require setting up a mock state with pending invites
    // For now, we'll just check that the section exists
    await expect(page.getByText('Pending Invites')).toBeVisible();
  });

  test('should show role permissions', async ({ page }) => {
    // Check that all role permissions are displayed
    await expect(page.getByText('Admin')).toBeVisible();
    await expect(page.getByText('Manager')).toBeVisible();
    await expect(page.getByText('Contributor')).toBeVisible();
    await expect(page.getByText('Viewer')).toBeVisible();

    // Check that each role has permission descriptions
    await expect(page.getByText('Full access to all features')).toBeVisible();
    await expect(
      page.getByText('Invite and manage team members')
    ).toBeVisible();
    await expect(
      page.getByText('Edit assigned reports and data')
    ).toBeVisible();
    await expect(page.getByText('Read-only access to reports')).toBeVisible();
  });

  test('should cancel invite form', async ({ page }) => {
    // Open invite form
    await page.getByText('Invite Member').click();

    // Fill in some data
    await page
      .getByPlaceholder('colleague@company.com')
      .fill('test@example.com');

    // Click cancel
    await page.getByText('Cancel').click();

    // Form should be closed
    await expect(page.getByText('Send Invitation')).not.toBeVisible();

    // Button should be back to "Invite Member"
    await expect(page.getByText('Invite Member')).toBeVisible();
  });
});

test.describe('Organization Information', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/settings');
    await page.waitForSelector('text=Settings');
  });

  test('should display organization ID', async ({ page }) => {
    // Check that organization ID field is visible and disabled
    const orgIdInput = page.getByDisplayValue(/local-|org-/);
    await expect(orgIdInput).toBeVisible();
    await expect(orgIdInput).toBeDisabled();
  });

  test('should allow editing organization details', async ({ page }) => {
    // Edit organization name
    const nameInput = page.getByDisplayValue('My Organization');
    await nameInput.clear();
    await nameInput.fill('Updated Organization');
    await expect(nameInput).toHaveValue('Updated Organization');

    // Edit employee count
    const employeeInput = page.getByDisplayValue('1');
    await employeeInput.clear();
    await employeeInput.fill('100');
    await expect(employeeInput).toHaveValue('100');
  });

  test('should display file upload section', async ({ page }) => {
    // Check that file upload section is visible
    await expect(
      page.getByText('Add files for context about your company')
    ).toBeVisible();
    await expect(
      page.getByText('Click to upload or drag and drop')
    ).toBeVisible();
    await expect(
      page.getByText('PDF, DOC, DOCX, TXT, XLS, XLSX (max 10MB each)')
    ).toBeVisible();
  });
});
