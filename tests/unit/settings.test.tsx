import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings } from '@/components/settings';

// Mock the Layout component
jest.mock('@/components/layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="layout">{children}</div>
  ),
}));

// Mock the Supabase client
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
    updateUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
      getPublicUrl: jest.fn(),
    })),
  },
};

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}));

// Mock fetch for API calls
global.fetch = jest.fn();

describe('Settings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful user fetch
    mockSupabase.auth.getUser.mockResolvedValue({
      data: {
        user: {
          id: 'test-user-id',
          email: 'test@example.com',
          user_metadata: {
            display_name: 'Test User',
          },
          created_at: '2024-01-01T00:00:00Z',
          last_sign_in_at: '2024-01-01T00:00:00Z',
        },
      },
      error: null,
    });

    // Mock successful organization fetch
    mockSupabase
      .from()
      .select()
      .eq()
      .single.mockResolvedValue({
        data: {
          id: 'test-org-id',
          name: 'Test Organization',
          sector: 'Technology',
          employee_count: 50,
          first_reporting_year: 2025,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
        },
        error: null,
      });

    // Mock successful API calls
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  it('renders user information section', async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('User Information')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    });
  });

  it('renders organization information section', async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Organization Information')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Organization')).toBeInTheDocument();
      expect(screen.getByDisplayValue('test-org-id')).toBeInTheDocument();
    });
  });

  it('displays organization ID correctly', async () => {
    render(<Settings />);

    await waitFor(() => {
      const orgIdInput = screen.getByDisplayValue('test-org-id');
      expect(orgIdInput).toBeInTheDocument();
      expect(orgIdInput).toBeDisabled();
    });
  });

  it('allows editing organization name', async () => {
    const user = userEvent.setup();
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Organization')).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('Test Organization');
    await user.clear(nameInput);
    await user.type(nameInput, 'Updated Organization');

    expect(nameInput).toHaveValue('Updated Organization');
  });

  it('shows team management section', async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Team Management')).toBeInTheDocument();
      expect(screen.getByText('Invite Team Members')).toBeInTheDocument();
    });
  });

  it('opens invite form when clicking invite member button', async () => {
    const user = userEvent.setup();
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Invite Member')).toBeInTheDocument();
    });

    const inviteButton = screen.getByText('Invite Member');
    await user.click(inviteButton);

    expect(screen.getByText('Send Invitation')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('colleague@company.com')
    ).toBeInTheDocument();
  });

  it('allows selecting different roles in invite form', async () => {
    const user = userEvent.setup();
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Invite Member')).toBeInTheDocument();
    });

    const inviteButton = screen.getByText('Invite Member');
    await user.click(inviteButton);

    const roleSelect = screen.getByDisplayValue(
      'Contributor - Edit reports and data'
    );
    await user.selectOptions(roleSelect, 'admin');

    expect(roleSelect).toHaveValue('admin');
  });

  it('shows file upload section', async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(
        screen.getByText('Add files for context about your company')
      ).toBeInTheDocument();
      expect(
        screen.getByText('Click to upload or drag and drop')
      ).toBeInTheDocument();
    });
  });

  it('handles file upload', async () => {
    const user = userEvent.setup();
    render(<Settings />);

    await waitFor(() => {
      expect(
        screen.getByText('Add files for context about your company')
      ).toBeInTheDocument();
    });

    const file = new File(['test content'], 'test.pdf', {
      type: 'application/pdf',
    });
    const fileInput = screen.getByLabelText(/click to upload/i);

    await user.upload(fileInput, file);

    // Note: This would need proper mocking of the upload functionality
    expect(fileInput.files[0]).toBe(file);
  });

  it('displays role permissions correctly', async () => {
    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Role Permissions')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Manager')).toBeInTheDocument();
      expect(screen.getByText('Contributor')).toBeInTheDocument();
      expect(screen.getByText('Viewer')).toBeInTheDocument();
    });
  });

  it('saves user information successfully', async () => {
    const user = userEvent.setup();
    mockSupabase.auth.updateUser.mockResolvedValue({
      data: { user: {} },
      error: null,
    });

    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Save Profile')).toBeInTheDocument();
    });

    const displayNameInput = screen.getByDisplayValue('Test User');
    await user.clear(displayNameInput);
    await user.type(displayNameInput, 'Updated User');

    const saveButton = screen.getByText('Save Profile');
    await user.click(saveButton);

    await waitFor(() => {
      expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
        data: {
          display_name: 'Updated User',
        },
      });
    });
  });

  it('handles errors gracefully', async () => {
    mockSupabase.auth.getUser.mockRejectedValue(new Error('Network error'));

    render(<Settings />);

    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
});
