import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  onAuthStateChanged,
  getDoc,
  setDoc,
  signOut,
  serverTimestamp,
} from './firebase';

vi.mock('./pages/Home/HomePage', () => ({ Home: () => <div>Home Page</div> }));
vi.mock('./pages/Dashboard/DashboardPage', () => ({ Dashboard: () => <div>Dashboard Page</div> }));
vi.mock('./pages/Chatbot/ChatbotPage', () => ({ Chatbot: () => <div>Chatbot Page</div> }));
vi.mock('./pages/Admin/AdminPage', () => ({ Admin: () => <div>Admin Page</div> }));
vi.mock('./Layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import App, { useAuth } from './App';
import { renderHook } from '@testing-library/react';

function mockAuth(firebaseUser: any) {
  vi.mocked(onAuthStateChanged).mockImplementation((_auth, cb: any) => {
    cb(firebaseUser);
    return vi.fn();
  });
}

const mockUser = {
  uid: 'uid-123',
  email: 'agent@test.com',
  displayName: 'Agent User',
  photoURL: null,
};

const mockAdminUser = {
  uid: 'admin-uid',
  email: 'jkninja238@gmail.com',
  displayName: 'Admin',
  photoURL: null,
};

describe('App', () => {
  beforeEach(() => {
    window.location.hash = '';
    vi.mocked(onAuthStateChanged).mockImplementation(() => vi.fn());
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false, data: () => ({}) } as any);
    vi.mocked(setDoc).mockResolvedValue(undefined);
    vi.mocked(serverTimestamp).mockReturnValue(new Date() as any);
    vi.mocked(signOut).mockResolvedValue(undefined);
  });

  it('shows a loading spinner initially', () => {
    render(<App />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders Home page for unauthenticated user', async () => {
    mockAuth(null);
    render(<App />);
    expect(await screen.findByText('Home Page')).toBeInTheDocument();
  });

  it('redirects authenticated user to /dashboard', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ uid: 'uid-123', email: 'agent@test.com', role: 'agent', isBlocked: false }),
    } as any);
    mockAuth(mockUser);
    render(<App />);
    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
  });

  it('creates new user profile when no Firestore doc exists', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);
    mockAuth(mockUser);
    render(<App />);
    await waitFor(() => expect(setDoc).toHaveBeenCalledOnce());
    const [, secondArg] = vi.mocked(setDoc).mock.calls[0];
    expect(secondArg).toMatchObject({ uid: 'uid-123', email: 'agent@test.com', role: 'agent' });
  });

  it('assigns admin role to super-admin email', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);
    mockAuth(mockAdminUser);
    render(<App />);
    await waitFor(() => expect(setDoc).toHaveBeenCalledOnce());
    const [, secondArg] = vi.mocked(setDoc).mock.calls[0];
    expect(secondArg).toMatchObject({ role: 'admin' });
  });

  it('signs out a blocked user and shows blocked screen', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ uid: 'uid-123', email: 'agent@test.com', role: 'agent', isBlocked: true }),
    } as any);
    mockAuth(mockUser);
    render(<App />);
    expect(await screen.findByText('Account Blocked')).toBeInTheDocument();
    expect(signOut).toHaveBeenCalledOnce();
  });

  it('clicking "Return to Home" dismisses the blocked screen', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ uid: 'uid-123', email: 'agent@test.com', role: 'agent', isBlocked: true }),
    } as any);
    mockAuth(mockUser);
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Account Blocked');
    await user.click(screen.getByRole('button', { name: /Return to Home/i }));
    // After dismissing, loading is false and user is null → Home page
    expect(await screen.findByText('Home Page')).toBeInTheDocument();
  });

  it('renders Home when signed out', async () => {
    mockAuth(null);
    render(<App />);
    expect(await screen.findByText('Home Page')).toBeInTheDocument();
  });

  it('computes isAdmin true for admin role', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({ uid: 'admin-uid', email: 'jkninja238@gmail.com', role: 'admin', isBlocked: false }),
    } as any);
    mockAuth(mockAdminUser);
    render(<App />);
    expect(await screen.findByText('Dashboard Page')).toBeInTheDocument();
  });
});

describe('useAuth hook', () => {
  it('returns default context values when used outside App', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
    expect(result.current.loading).toBe(true);
    expect(result.current.isAdmin).toBe(false);
    expect(result.current.isBlocked).toBe(false);
  });
});
