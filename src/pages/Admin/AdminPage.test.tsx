import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../App', () => ({ useAuth: vi.fn() }));

import { useAuth } from '../../App';
import { onSnapshot, getDocs, updateDoc } from '../../firebase';
import { Admin } from './AdminPage';

const mockAdminUser = { uid: 'admin-uid', email: 'admin@test.com' };
const mockAgentUser = { uid: 'user-uid', email: 'user@test.com' };

const sampleAgent = {
  id: 'agent-1',
  displayName: 'Bob Builder',
  email: 'bob@test.com',
  isBlocked: false,
  role: 'agent',
};

function renderAdmin() {
  return render(
    <MemoryRouter>
      <Admin />
    </MemoryRouter>
  );
}

describe('Admin', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockAdminUser, profile: null, loading: false, isAdmin: true, isBlocked: false,
    });
    vi.mocked(onSnapshot).mockImplementation((_q, cb: any) => {
      cb({ docs: [{ id: sampleAgent.id, data: () => sampleAgent }] });
      return vi.fn();
    });
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);
    vi.mocked(updateDoc).mockResolvedValue(undefined);
  });

  it('renders nothing when user is null', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null, profile: null, loading: false, isAdmin: false, isBlocked: false,
    });
    const { container } = renderAdmin();
    expect(container.firstChild).toBeNull();
  });

  it('shows Access Denied when user is not admin', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockAgentUser, profile: null, loading: false, isAdmin: false, isBlocked: false,
    });
    renderAdmin();
    expect(screen.getByText('Access Denied')).toBeInTheDocument();
  });

  it('renders Agent Management heading for admins', async () => {
    renderAdmin();
    expect(await screen.findByText('Agent Management')).toBeInTheDocument();
  });

  it('renders agent list', async () => {
    renderAdmin();
    expect(await screen.findByText('Bob Builder')).toBeInTheDocument();
    expect(screen.getByText('bob@test.com')).toBeInTheDocument();
  });

  it('shows empty state when no agents match search', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await screen.findByText('Bob Builder');

    await user.type(screen.getByPlaceholderText(/Search agents/), 'zzz-no-match');
    expect(await screen.findByText(/No agents found/)).toBeInTheDocument();
  });

  it('filters agents by name', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await screen.findByText('Bob Builder');

    await user.type(screen.getByPlaceholderText(/Search agents/), 'Bob');
    expect(screen.getByText('Bob Builder')).toBeInTheDocument();
  });

  it('filters agents by email', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await screen.findByText('bob@test.com');

    await user.type(screen.getByPlaceholderText(/Search agents/), 'bob@test.com');
    expect(screen.getByText('Bob Builder')).toBeInTheDocument();
  });

  it('calls updateDoc when Block Agent is clicked', async () => {
    const user = userEvent.setup();
    renderAdmin();
    await screen.findByText('Bob Builder');

    await user.click(screen.getByRole('button', { name: /Block Agent/i }));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        { isBlocked: true }
      );
    });
  });

  it('calculates stats from getDocs', async () => {
    vi.mocked(getDocs).mockImplementation(async (coll: any) => {
      // Return a property doc for agent-1
      return {
        docs: [{ data: () => ({ agentId: 'agent-1' }) }]
      } as any;
    });

    renderAdmin();
    expect(await screen.findByText('Bob Builder')).toBeInTheDocument();
    // Stats are computed — just verify no crash
  });

  it('handles updateDoc error gracefully', async () => {
    vi.mocked(updateDoc).mockRejectedValueOnce(new Error('permission denied'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const user = userEvent.setup();
    renderAdmin();
    await screen.findByText('Bob Builder');

    await user.click(screen.getByRole('button', { name: /Block Agent/i }));

    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
    consoleSpy.mockRestore();
  });
});
