import { POST } from '@/app/api/invite-member/route';
import { NextRequest } from 'next/server';

// Mock the Supabase client
const mockSupabase = {
  auth: {
    getUser: jest.fn(),
  },
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn(),
  })),
};

jest.mock('@/lib/supabase/server', () => ({
  createClient: () => mockSupabase,
}));

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn(),
    },
  })),
}));

describe('/api/invite-member', () => {
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
        },
        error: null,
      });

    // Mock successful database insert
    mockSupabase.from().insert.mockResolvedValue({
      data: { id: 'test-invite-id' },
      error: null,
    });
  });

  it('should create invite successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/invite-member', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        role: 'contributor',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toBe('Invitation sent successfully');
    expect(data.inviteToken).toBeDefined();
  });

  it('should return 400 for missing email', async () => {
    const request = new NextRequest('http://localhost:3000/api/invite-member', {
      method: 'POST',
      body: JSON.stringify({
        role: 'contributor',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Email and role are required');
  });

  it('should return 400 for missing role', async () => {
    const request = new NextRequest('http://localhost:3000/api/invite-member', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Email and role are required');
  });

  it('should return 401 for unauthenticated user', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    const request = new NextRequest('http://localhost:3000/api/invite-member', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        role: 'contributor',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('Unauthorized');
  });

  it('should handle database errors gracefully', async () => {
    mockSupabase.from().insert.mockResolvedValue({
      data: null,
      error: new Error('Database error'),
    });

    const request = new NextRequest('http://localhost:3000/api/invite-member', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        role: 'contributor',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200); // Should still succeed even if DB fails
    expect(data.success).toBe(true);
  });

  it('should generate unique invite token', async () => {
    const request = new NextRequest('http://localhost:3000/api/invite-member', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        role: 'contributor',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response1 = await POST(request);
    const data1 = await response1.json();

    const response2 = await POST(request);
    const data2 = await response2.json();

    expect(data1.inviteToken).toBeDefined();
    expect(data2.inviteToken).toBeDefined();
    expect(data1.inviteToken).not.toBe(data2.inviteToken);
  });

  it('should set correct expiration date', async () => {
    const request = new NextRequest('http://localhost:3000/api/invite-member', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        role: 'contributor',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const beforeTime = new Date();
    await POST(request);
    const afterTime = new Date();

    // Check that the database insert was called with correct expiration
    expect(mockSupabase.from().insert).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        role: 'contributor',
        expires_at: expect.any(String),
      })
    );

    // Verify expiration is approximately 7 days from now
    const insertCall = mockSupabase.from().insert.mock.calls[0][0];
    const expiresAt = new Date(insertCall.expires_at);
    const expectedMin = new Date(
      beforeTime.getTime() + 6 * 24 * 60 * 60 * 1000
    ); // 6 days
    const expectedMax = new Date(afterTime.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days

    expect(expiresAt.getTime()).toBeGreaterThan(expectedMin.getTime());
    expect(expiresAt.getTime()).toBeLessThan(expectedMax.getTime());
  });
});
