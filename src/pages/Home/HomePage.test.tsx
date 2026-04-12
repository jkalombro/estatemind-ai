import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../App', () => ({ useAuth: vi.fn() }));

import { useAuth } from '../../App';
import { signInWithPopup } from '../../firebase';
import { Home } from './HomePage';

function renderHome() {
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
}

describe('Home', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: null, profile: null, loading: false, isAdmin: false, isBlocked: false,
    });
    vi.mocked(signInWithPopup).mockResolvedValue({} as any);
  });

  it('renders the hero heading', () => {
    renderHome();
    expect(screen.getByText('Real Estate Assistant')).toBeInTheDocument();
  });

  it('renders "Try the Chatbot" link', () => {
    renderHome();
    expect(screen.getByRole('link', { name: /Try the Chatbot/i })).toBeInTheDocument();
  });

  it('renders "Agent Login" button when user is not logged in', () => {
    renderHome();
    expect(screen.getByRole('button', { name: /Agent Login/i })).toBeInTheDocument();
  });

  it('renders "Go to Dashboard" link when user is logged in', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { uid: 'u1', email: 'a@b.com' } as any,
      profile: null, loading: false, isAdmin: false, isBlocked: false,
    });
    renderHome();
    expect(screen.getByRole('link', { name: /Go to Dashboard/i })).toBeInTheDocument();
  });

  it('renders all three feature cards', () => {
    renderHome();
    expect(screen.getByText('AI Chatbot')).toBeInTheDocument();
    expect(screen.getByText('Property Manager')).toBeInTheDocument();
    expect(screen.getByText('FAQ Database')).toBeInTheDocument();
  });

  it('renders social proof section', () => {
    renderHome();
    expect(screen.getByText(/Ready to automate/)).toBeInTheDocument();
    expect(screen.getByText('24/7 Availability')).toBeInTheDocument();
  });

  it('renders testimonial quote', () => {
    renderHome();
    expect(screen.getByText(/EstateMind AI transformed/)).toBeInTheDocument();
    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument();
  });

  it('calls signInWithPopup on Agent Login click', async () => {
    const user = userEvent.setup();
    renderHome();
    await user.click(screen.getByRole('button', { name: /Agent Login/i }));
    expect(signInWithPopup).toHaveBeenCalledOnce();
  });

  it('handles login error gracefully', async () => {
    vi.mocked(signInWithPopup).mockRejectedValueOnce(new Error('Login failed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    renderHome();
    await user.click(screen.getByRole('button', { name: /Agent Login/i }));
    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
    consoleSpy.mockRestore();
  });

  it('renders "Next-Gen Real Estate AI" badge', () => {
    renderHome();
    expect(screen.getByText('Next-Gen Real Estate AI')).toBeInTheDocument();
  });
});
