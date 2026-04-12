import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../../../shared/context/ThemeContext';

vi.mock('../../../App', () => ({ useAuth: vi.fn() }));

import { useAuth } from '../../../App';
import { onSnapshot } from '../../../firebase';
import { Overview } from './Overview';

const mockUser = { uid: 'test-uid', email: 'test@test.com', displayName: 'Tester' };

// Snapshot helpers
const docSnapshot = (exists: boolean, data: any = {}) => ({
  exists: () => exists,
  data: () => data,
});
const querySnapshot = (docs: any[] = [], size = 0) => ({
  docs,
  size: size || docs.length,
});

function renderOverview() {
  return render(
    <ThemeProvider>
      <MemoryRouter>
        <Overview />
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe('Overview', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser, profile: null, loading: false, isAdmin: false, isBlocked: false,
    });

    // onSnapshot is called 3 times: settings (doc), conversations (query), properties (query)
    let callCount = 0;
    vi.mocked(onSnapshot).mockImplementation((_q, cb: any) => {
      callCount++;
      if (callCount === 1) {
        // Settings DocumentSnapshot
        cb(docSnapshot(false));
      } else if (callCount === 2) {
        // Conversations QuerySnapshot
        cb(querySnapshot());
      } else {
        // Properties QuerySnapshot
        cb(querySnapshot());
      }
      return vi.fn();
    });
  });

  it('renders the Overview heading after loading', async () => {
    renderOverview();
    expect(await screen.findByText('Overview')).toBeInTheDocument();
  });

  it('renders all four stat cards', async () => {
    renderOverview();
    expect(await screen.findByText('Clients This Month')).toBeInTheDocument();
    expect(screen.getByText('Items for Sale')).toBeInTheDocument();
    expect(screen.getByText('Items Sold')).toBeInTheDocument();
    expect(screen.getByText('Total Listings')).toBeInTheDocument();
  });

  it('shows chatbot URL link section', async () => {
    renderOverview();
    await screen.findByText('Overview');
    expect(screen.getByText('Your AI Chatbot Link')).toBeInTheDocument();
  });

  it('shows zero counts when there are no conversations', async () => {
    renderOverview();
    await screen.findByText('Overview');
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBeGreaterThanOrEqual(4);
  });

  it('shows "Ready to scale?" CTA section', async () => {
    renderOverview();
    expect(await screen.findByText('Ready to scale?')).toBeInTheDocument();
  });

  it('has "Add Listings" link to /dashboard/properties', async () => {
    renderOverview();
    await screen.findByText('Ready to scale?');
    const link = screen.getByRole('link', { name: 'Add Listings' });
    expect(link).toHaveAttribute('href', '/dashboard/properties');
  });

  it('copies chatbot URL on copy button click', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      writable: true,
      configurable: true,
    });

    renderOverview();
    await screen.findByText('Overview');

    // Use fireEvent to avoid userEvent's own clipboard mock overriding ours
    fireEvent.click(screen.getByTitle('Copy to clipboard'));
    expect(writeText).toHaveBeenCalledOnce();
  });

  it('shows default chatbot name when settings has no chatbotName', async () => {
    renderOverview();
    await screen.findByText('Overview');
    expect(screen.getByText('EstateMind AI')).toBeInTheDocument();
  });

  it('shows chatbot name from settings when available', async () => {
    let callCount = 0;
    vi.mocked(onSnapshot).mockImplementation((_q, cb: any) => {
      callCount++;
      if (callCount === 1) {
        cb(docSnapshot(true, { chatbotName: 'Custom Bot', chatbotAvatarUrl: '' }));
      } else {
        cb(querySnapshot());
      }
      return vi.fn();
    });

    renderOverview();
    expect(await screen.findByText('Custom Bot')).toBeInTheDocument();
  });

  it('does not subscribe when user is null', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null, profile: null, loading: false, isAdmin: false, isBlocked: false,
    });
    renderOverview();
    // LoadingScreen stays because setLoading(false) is never called
    expect(screen.queryByText('Overview')).toBeNull();
  });
});
