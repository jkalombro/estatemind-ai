import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../App', () => ({ useAuth: vi.fn() }));

import { useAuth } from '../../../App';
import { getDoc, setDoc } from '../../../firebase';
import { SettingsManager } from './SettingsManager';

const mockUser = { uid: 'test-uid', email: 'test@test.com' };

function renderSettingsManager() {
  return render(
    <MemoryRouter>
      <SettingsManager />
    </MemoryRouter>
  );
}

describe('SettingsManager', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser, profile: null, loading: false, isAdmin: false, isBlocked: false,
    });
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false, data: () => ({}) } as any);
    vi.mocked(setDoc).mockResolvedValue(undefined);
  });

  it('renders Chatbot Settings heading', async () => {
    renderSettingsManager();
    expect(await screen.findByText('Chatbot Settings')).toBeInTheDocument();
  });

  it('renders Chatbot Name field', async () => {
    renderSettingsManager();
    await screen.findByText('Chatbot Settings');
    expect(screen.getByDisplayValue('EstateMind AI')).toBeInTheDocument();
  });

  it('renders Avatar URL field', async () => {
    renderSettingsManager();
    await screen.findByText('Chatbot Settings');
    expect(screen.getByPlaceholderText('https://example.com/avatar.png')).toBeInTheDocument();
  });

  it('renders Welcome Message field', async () => {
    renderSettingsManager();
    await screen.findByText('Chatbot Settings');
    expect(screen.getByDisplayValue(/Hello! How can I help/)).toBeInTheDocument();
  });

  it('loads saved settings from Firestore', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => ({
        chatbotName: 'Custom Bot',
        chatbotAvatarUrl: 'https://example.com/avatar.png',
        welcomeMessage: 'Welcome to Best Realty!',
      }),
    } as any);

    renderSettingsManager();
    expect(await screen.findByDisplayValue('Custom Bot')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Welcome to Best Realty!')).toBeInTheDocument();
  });

  it('defaults to "EstateMind AI" when no saved settings', async () => {
    renderSettingsManager();
    expect(await screen.findByDisplayValue('EstateMind AI')).toBeInTheDocument();
  });

  it('updates chatbot name field on user input', async () => {
    const user = userEvent.setup();
    renderSettingsManager();
    await screen.findByText('Chatbot Settings');

    const nameInput = screen.getByDisplayValue('EstateMind AI') as HTMLInputElement;
    await user.clear(nameInput);
    await user.type(nameInput, 'New Bot Name');

    expect(nameInput.value).toBe('New Bot Name');
  });

  it('submits form and calls setDoc with correct data', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const user = userEvent.setup();
    renderSettingsManager();
    await screen.findByText('Chatbot Settings');

    await user.click(screen.getByRole('button', { name: /Save Configuration/i }));

    await waitFor(() => {
      expect(setDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({ agentId: 'test-uid' })
      );
    });
    alertSpy.mockRestore();
  });

  it('shows alert on successful save', async () => {
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const user = userEvent.setup();
    renderSettingsManager();
    await screen.findByText('Chatbot Settings');

    await user.click(screen.getByRole('button', { name: /Save Configuration/i }));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith('Settings saved successfully!');
    });
    alertSpy.mockRestore();
  });

  it('disables save button while saving', async () => {
    let resolveSave!: () => void;
    vi.mocked(setDoc).mockImplementation(() => new Promise(res => { resolveSave = res; }));

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const user = userEvent.setup();
    renderSettingsManager();
    await screen.findByText('Chatbot Settings');

    await user.click(screen.getByRole('button', { name: /Save Configuration/i }));

    expect(screen.getByRole('button', { name: /Save Configuration/i })).toBeDisabled();
    resolveSave();
    alertSpy.mockRestore();
  });

  it('stays loading when user is null (effect returns early)', () => {
    vi.mocked(useAuth).mockReturnValue({
      user: null, profile: null, loading: false, isAdmin: false, isBlocked: false,
    });
    renderSettingsManager();
    expect(screen.queryByText('Chatbot Settings')).toBeNull();
  });
});
