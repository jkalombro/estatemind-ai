import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleFirestoreError, OperationType, FirestoreErrorInfo } from './firestore';

// auth is mocked in setup.tsx — we can override currentUser per-test
import { auth } from '../../firebase';

describe('OperationType enum', () => {
  it('has all expected values', () => {
    expect(OperationType.CREATE).toBe('create');
    expect(OperationType.UPDATE).toBe('update');
    expect(OperationType.DELETE).toBe('delete');
    expect(OperationType.LIST).toBe('list');
    expect(OperationType.GET).toBe('get');
    expect(OperationType.WRITE).toBe('write');
  });
});

describe('handleFirestoreError()', () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  beforeEach(() => {
    consoleSpy.mockClear();
    // Reset currentUser to null
    (auth as any).currentUser = null;
  });

  it('returns FirestoreErrorInfo for an Error instance', () => {
    const error = new Error('Test error message');
    const result = handleFirestoreError(error, OperationType.GET, 'users/123');

    expect(result.error).toBe('Test error message');
    expect(result.operationType).toBe(OperationType.GET);
    expect(result.path).toBe('users/123');
  });

  it('stringifies non-Error values', () => {
    const result = handleFirestoreError('plain string error', OperationType.CREATE, null);
    expect(result.error).toBe('plain string error');
  });

  it('handles null path', () => {
    const result = handleFirestoreError(new Error('err'), OperationType.DELETE, null);
    expect(result.path).toBeNull();
  });

  it('logs to console.error', () => {
    handleFirestoreError(new Error('log test'), OperationType.LIST, 'some/path');
    expect(consoleSpy).toHaveBeenCalledOnce();
    expect(consoleSpy.mock.calls[0][0]).toBe('Firestore Error: ');
  });

  it('returns empty providerInfo when currentUser is null', () => {
    const result = handleFirestoreError(new Error('x'), OperationType.GET, null);
    expect(result.authInfo.providerInfo).toEqual([]);
    expect(result.authInfo.userId).toBeUndefined();
    expect(result.authInfo.email).toBeUndefined();
  });

  it('captures currentUser info when logged in', () => {
    (auth as any).currentUser = {
      uid: 'uid-123',
      email: 'test@example.com',
      emailVerified: true,
      isAnonymous: false,
      tenantId: null,
      providerData: [
        {
          providerId: 'google.com',
          displayName: 'Test User',
          email: 'test@example.com',
          photoURL: 'https://photo.url',
        },
      ],
    };

    const result = handleFirestoreError(new Error('auth test'), OperationType.UPDATE, 'col/doc');
    expect(result.authInfo.userId).toBe('uid-123');
    expect(result.authInfo.email).toBe('test@example.com');
    expect(result.authInfo.emailVerified).toBe(true);
    expect(result.authInfo.isAnonymous).toBe(false);
    expect(result.authInfo.providerInfo).toHaveLength(1);
    expect(result.authInfo.providerInfo[0].providerId).toBe('google.com');
    expect(result.authInfo.providerInfo[0].photoUrl).toBe('https://photo.url');
  });

  it('handles object errors', () => {
    const result = handleFirestoreError({ code: 'permission-denied' }, OperationType.WRITE, 'x');
    expect(result.error).toBe('[object Object]');
  });
});
