import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from './shared/context/ThemeContext';

vi.mock('./App', () => ({ useAuth: vi.fn() }));

import { useAuth } from './App';
import { signInWithPopup, signOut } from './firebase';
import { Layout } from './Layout';

function renderLayout(authValue: any = {}, path = '/') {
  vi.mocked(useAuth).mockReturnValue({
    user: null, profile: null, loading: false, isAdmin: false, isBlocked: false,
    ...authValue,
  });
  return render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider>
        <Layout>
          <div>Page Content</div>
        </Layout>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('Layout', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.mocked(signInWithPopup).mockResolvedValue({} as any);
    vi.mocked(signOut).mockResolvedValue(undefined);
  });

  it('renders children', () => {
    renderLayout();
    expect(screen.getByText('Page Content')).toBeInTheDocument();
  });

  it('renders EstateMind AI logo', () => {
    renderLayout();
    expect(screen.getByText('EstateMind AI')).toBeInTheDocument();
  });

  it('renders footer copyright', () => {
    renderLayout();
    expect(screen.getByText(/© 2026 EstateMind AI/)).toBeInTheDocument();
  });

  it('shows "Agent Login" button when unauthenticated', () => {
    renderLayout();
    expect(screen.getByRole('button', { name: /Agent Login/i })).toBeInTheDocument();
  });

  it('shows user info when authenticated', () => {
    renderLayout({
      user: { uid: 'u1', displayName: 'John Doe', email: 'john@test.com', photoURL: null },
    });
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@test.com')).toBeInTheDocument();
  });

  it('shows logout button when authenticated', () => {
    renderLayout({
      user: { uid: 'u1', displayName: 'John', email: 'j@t.com', photoURL: null },
    });
    const logoutBtn = screen.getByTitle('Logout');
    expect(logoutBtn).toBeInTheDocument();
  });

  it('calls signOut on logout click', async () => {
    const user = userEvent.setup();
    renderLayout({
      user: { uid: 'u1', displayName: 'John', email: 'j@t.com', photoURL: null },
    });
    await user.click(screen.getByTitle('Logout'));
    expect(signOut).toHaveBeenCalledOnce();
  });

  it('calls signInWithPopup on login click', async () => {
    const user = userEvent.setup();
    renderLayout();
    await user.click(screen.getByRole('button', { name: /Agent Login/i }));
    expect(signInWithPopup).toHaveBeenCalledOnce();
  });

  it('shows Home nav link when not logged in', () => {
    renderLayout();
    expect(screen.getByRole('link', { name: /Home/i })).toBeInTheDocument();
  });

  it('shows Dashboard nav link when logged in', () => {
    renderLayout({ user: { uid: 'u1', displayName: 'X', email: 'x@x.com', photoURL: null } });
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
  });

  it('shows Admin link when isAdmin is true', () => {
    renderLayout({
      user: { uid: 'u1', displayName: 'X', email: 'x@x.com', photoURL: null },
      isAdmin: true,
    });
    expect(screen.getByRole('link', { name: /Admin/i })).toBeInTheDocument();
  });

  it('hides Admin link when not admin', () => {
    renderLayout({ user: null });
    expect(screen.queryByRole('link', { name: /Admin/i })).toBeNull();
  });

  it('always shows Chatbot nav link', () => {
    renderLayout();
    expect(screen.getByRole('link', { name: /Chatbot/i })).toBeInTheDocument();
  });

  it('toggles theme on button click', async () => {
    const user = userEvent.setup();
    renderLayout();
    const themeBtn = screen.getByTitle(/Switch to dark mode/i);
    await user.click(themeBtn);
    expect(screen.getByTitle(/Switch to light mode/i)).toBeInTheDocument();
  });

  it('handles login error gracefully', async () => {
    vi.mocked(signInWithPopup).mockRejectedValueOnce(new Error('popup closed'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    renderLayout();
    await user.click(screen.getByRole('button', { name: /Agent Login/i }));
    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
    consoleSpy.mockRestore();
  });

  it('handles logout error gracefully', async () => {
    vi.mocked(signOut).mockRejectedValueOnce(new Error('network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = userEvent.setup();
    renderLayout({
      user: { uid: 'u1', displayName: 'X', email: 'x@x.com', photoURL: null },
    });
    await user.click(screen.getByTitle('Logout'));
    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
    consoleSpy.mockRestore();
  });

  it('renders user avatar image when photoURL is provided', () => {
    renderLayout({
      user: { uid: 'u1', displayName: 'X', email: 'x@x.com', photoURL: 'https://photo.url' },
    });
    const img = screen.getByAltText('Profile');
    expect(img).toHaveAttribute('src', 'https://photo.url');
  });

  it('renders fallback avatar when photoURL is null', () => {
    renderLayout({
      user: { uid: 'u1', displayName: 'Bob', email: 'bob@test.com', photoURL: null },
    });
    const img = screen.getByAltText('Profile');
    expect(img.getAttribute('src')).toContain('Bob');
  });

  it('applies active class to current nav item', () => {
    renderLayout({ user: null }, '/chatbot');
    const chatbotLink = screen.getByRole('link', { name: /Chatbot/i });
    expect(chatbotLink.className).toContain('text-blue-700');
  });
});
