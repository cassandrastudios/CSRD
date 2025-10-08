import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navigation } from '@/components/Navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  usePathname() {
    return '/dashboard';
  },
}));

describe('Navigation Component', () => {
  const defaultProps = {
    isCollapsed: false,
    onToggle: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders navigation items correctly', () => {
    render(<Navigation {...defaultProps} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Materiality Assessment')).toBeInTheDocument();
    expect(screen.getByText('Data Hub')).toBeInTheDocument();
    expect(screen.getByText('Compliance')).toBeInTheDocument();
    expect(screen.getByText('Report Builder')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('shows collapsed state correctly', () => {
    render(<Navigation {...defaultProps} isCollapsed={true} />);

    // Text should not be visible when collapsed
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();

    // Icons should still be visible
    expect(screen.getByTitle('Dashboard')).toBeInTheDocument();
    expect(screen.getByTitle('Settings')).toBeInTheDocument();
  });

  it('calls onToggle when toggle button is clicked', async () => {
    const user = userEvent.setup();
    const onToggle = jest.fn();

    render(<Navigation {...defaultProps} onToggle={onToggle} />);

    const toggleButton = screen.getByRole('button', {
      name: /toggle navigation/i,
    });
    await user.click(toggleButton);

    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it('highlights active navigation item', () => {
    // Mock usePathname to return '/settings'
    jest.doMock('next/navigation', () => ({
      usePathname: () => '/settings',
    }));

    render(<Navigation {...defaultProps} />);

    // The Settings item should be highlighted
    const settingsButton = screen.getByText('Settings').closest('button');
    expect(settingsButton).toHaveClass('bg-blue-50', 'text-blue-700');
  });

  it('shows tooltips when collapsed', () => {
    render(<Navigation {...defaultProps} isCollapsed={true} />);

    // Check that tooltips are present
    expect(screen.getByTitle('Dashboard')).toBeInTheDocument();
    expect(screen.getByTitle('Materiality Assessment')).toBeInTheDocument();
    expect(screen.getByTitle('Data Hub')).toBeInTheDocument();
    expect(screen.getByTitle('Compliance')).toBeInTheDocument();
    expect(screen.getByTitle('Report Builder')).toBeInTheDocument();
    expect(screen.getByTitle('Settings')).toBeInTheDocument();
  });

  it('renders account section correctly', () => {
    render(<Navigation {...defaultProps} />);

    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByTitle('Account')).toBeInTheDocument();
  });

  it('shows account tooltip when collapsed', () => {
    render(<Navigation {...defaultProps} isCollapsed={true} />);

    expect(screen.getByTitle('Account')).toBeInTheDocument();
    expect(screen.queryByText('Account')).not.toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<Navigation {...defaultProps} />);

    // Check for proper ARIA labels and roles
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();

    // Check that buttons have proper accessibility
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveAttribute('type', 'button');
    });
  });

  it('handles keyboard navigation', async () => {
    const user = userEvent.setup();
    render(<Navigation {...defaultProps} />);

    // Focus on first navigation item
    const firstButton = screen.getByText('Dashboard').closest('button');
    firstButton?.focus();

    expect(document.activeElement).toBe(firstButton);

    // Test tab navigation
    await user.tab();
    const secondButton = screen
      .getByText('Materiality Assessment')
      .closest('button');
    expect(document.activeElement).toBe(secondButton);
  });

  it('maintains consistent styling', () => {
    render(<Navigation {...defaultProps} />);

    // Check that all navigation items have consistent classes
    const navItems = screen.getAllByRole('button').slice(0, -2); // Exclude toggle and account buttons

    navItems.forEach(item => {
      expect(item).toHaveClass('flex', 'items-center', 'w-full');
    });
  });

  it('handles resize events correctly', () => {
    const { rerender } = render(
      <Navigation {...defaultProps} isCollapsed={false} />
    );

    // Initially expanded
    expect(screen.getByText('Dashboard')).toBeInTheDocument();

    // Simulate collapse
    rerender(<Navigation {...defaultProps} isCollapsed={true} />);
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();

    // Simulate expand
    rerender(<Navigation {...defaultProps} isCollapsed={false} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
