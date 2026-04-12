/**
 * Test helpers: AuthContext mock wrapper and common render utilities.
 */
import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../shared/context/ThemeContext';

// A minimal AuthContext value that mirrors the real one
export interface MockAuthContextValue {
  user: any;
  profile: any;
  loading: boolean;
  isAdmin: boolean;
  isBlocked: boolean;
}

// We import the actual AuthContext from App to provide the right context value.
// Since App.tsx is complex (Firebase calls in useEffect), we re-export a helper
// that wraps children with a fake auth context.
import { createContext, useContext } from 'react';

export const MockAuthContext = createContext<MockAuthContextValue>({
  user: null,
  profile: null,
  loading: false,
  isAdmin: false,
  isBlocked: false,
});

export const defaultUser = {
  uid: 'test-uid-123',
  email: 'agent@test.com',
  displayName: 'Test Agent',
  photoURL: null,
};

interface WrapperProps {
  authValue?: Partial<MockAuthContextValue>;
  children: React.ReactNode;
}

export function TestWrapper({ authValue = {}, children }: WrapperProps) {
  const auth: MockAuthContextValue = {
    user: defaultUser,
    profile: { uid: 'test-uid-123', role: 'agent', email: 'agent@test.com', displayName: 'Test Agent', createdAt: null },
    loading: false,
    isAdmin: false,
    isBlocked: false,
    ...authValue,
  };

  return (
    <MockAuthContext.Provider value={auth}>
      <ThemeProvider>
        <MemoryRouter>
          {children}
        </MemoryRouter>
      </ThemeProvider>
    </MockAuthContext.Provider>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  authValue?: Partial<MockAuthContextValue>,
  options?: RenderOptions,
) {
  return render(
    <TestWrapper authValue={authValue}>{ui}</TestWrapper>,
    options,
  );
}
