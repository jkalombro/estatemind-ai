import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

vi.mock('../../App', () => ({ useAuth: vi.fn() }));

vi.mock('./components/Overview', () => ({ Overview: () => <div>Overview Page</div> }));
vi.mock('./components/PropertyManager', () => ({ PropertyManager: () => <div>Properties Page</div> }));
vi.mock('./components/FAQManager', () => ({ FAQManager: () => <div>FAQs Page</div> }));
vi.mock('./components/ConversationManager', () => ({ ConversationManager: () => <div>Conversations Page</div> }));
vi.mock('./components/SettingsManager', () => ({ SettingsManager: () => <div>Settings Page</div> }));

import { useAuth } from '../../App';
import { Dashboard } from './DashboardPage';

const mockUser = { uid: 'test-uid', email: 'agent@test.com', displayName: 'Test Agent' };

// Wrap Dashboard in the same route structure used in App.tsx so nested routes resolve
function renderDashboard(initialPath = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/dashboard/*" element={<Dashboard />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser, profile: null, loading: false, isAdmin: false, isBlocked: false,
    });
  });

  it('renders nothing when user is null', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null, profile: null, loading: false, isAdmin: false, isBlocked: false,
    });
    const { container } = renderDashboard();
    expect(container.firstChild).toBeNull();
  });

  it('renders Dashboard sidebar when authenticated', () => {
    renderDashboard();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders all sidebar navigation links', () => {
    renderDashboard();
    expect(screen.getByRole('link', { name: /Overview/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Properties/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /FAQs/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Conversations/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Settings/i })).toBeInTheDocument();
  });

  it('renders Overview on /dashboard', () => {
    renderDashboard('/dashboard');
    expect(screen.getByText('Overview Page')).toBeInTheDocument();
  });

  it('renders Properties on /dashboard/properties', () => {
    renderDashboard('/dashboard/properties');
    expect(screen.getByText('Properties Page')).toBeInTheDocument();
  });

  it('renders FAQs on /dashboard/faqs', () => {
    renderDashboard('/dashboard/faqs');
    expect(screen.getByText('FAQs Page')).toBeInTheDocument();
  });

  it('renders Conversations on /dashboard/conversations', () => {
    renderDashboard('/dashboard/conversations');
    expect(screen.getByText('Conversations Page')).toBeInTheDocument();
  });

  it('renders Settings on /dashboard/settings', () => {
    renderDashboard('/dashboard/settings');
    expect(screen.getByText('Settings Page')).toBeInTheDocument();
  });
});
