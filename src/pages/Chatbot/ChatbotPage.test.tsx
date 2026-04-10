import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

// Mock gemini service
vi.mock('../../shared/services/gemini', () => ({
  generateChatResponse: vi.fn().mockResolvedValue('Bot reply'),
}));

import { getDocs, getDoc, onSnapshot, addDoc, updateDoc } from '../../firebase';
import { generateChatResponse } from '../../shared/services/gemini';
import { Chatbot } from './ChatbotPage';

const sampleAgent = {
  id: 'agent-1',
  agencyName: 'Sunrise Realty',
  chatbotName: 'SunBot',
  welcomeMessage: 'Welcome to Sunrise Realty!',
};

function renderChatbot(search = '') {
  return render(
    <MemoryRouter initialEntries={[`/chatbot${search}`]}>
      <Chatbot />
    </MemoryRouter>
  );
}

describe('Chatbot', () => {
  beforeEach(() => {
    // getDocs for agents list (settings collection)
    vi.mocked(getDocs).mockResolvedValue({
      docs: [{ id: sampleAgent.id, data: () => sampleAgent }],
    } as any);

    // getDoc for selected agent settings
    vi.mocked(getDoc).mockResolvedValue({
      exists: () => true,
      data: () => sampleAgent,
    } as any);

    // onSnapshot for properties and FAQs
    vi.mocked(onSnapshot).mockImplementation((_q, cb: any, _err?: any) => {
      cb({ docs: [] });
      return vi.fn();
    });

    vi.mocked(addDoc).mockResolvedValue({ id: 'conv-1' } as any);
    vi.mocked(updateDoc).mockResolvedValue(undefined);
    vi.mocked(generateChatResponse).mockResolvedValue('Bot reply');
  });

  it('shows loading spinner initially', () => {
    // getDocs never resolves so loading stays true
    vi.mocked(getDocs).mockImplementation(() => new Promise(() => {}));
    renderChatbot();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders the chat interface after loading', async () => {
    renderChatbot();
    expect(await screen.findByText('SunBot')).toBeInTheDocument();
  });

  it('renders welcome message from agent settings', async () => {
    renderChatbot();
    expect(await screen.findByText('Welcome to Sunrise Realty!')).toBeInTheDocument();
  });

  it('renders AgentSelector when no urlAgentId', async () => {
    renderChatbot();
    await screen.findByText('SunBot');
    expect(screen.getByRole('heading', { name: /Select Agent/i })).toBeInTheDocument();
  });

  it('hides AgentSelector when urlAgentId is in URL', async () => {
    renderChatbot('?agentId=agent-1');
    await screen.findByText('SunBot');
    expect(screen.queryByRole('heading', { name: /Select Agent/i })).toBeNull();
  });

  it('renders ChatInput', async () => {
    renderChatbot();
    await screen.findByText('SunBot');
    expect(screen.getByPlaceholderText(/Ask about properties/)).toBeInTheDocument();
  });

  it('disables send when no agent selected and input is empty', async () => {
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);
    renderChatbot();
    await waitFor(() => expect(screen.queryByText('.animate-spin')).toBeNull());
    // Input send button should be disabled
    const btn = screen.getByRole('button');
    expect(btn).toBeDisabled();
  });

  it('sends a message and shows bot reply', async () => {
    const user = userEvent.setup();
    renderChatbot('?agentId=agent-1');
    await screen.findByText('Welcome to Sunrise Realty!');

    const input = screen.getByPlaceholderText(/Ask about properties/);
    await user.type(input, 'Show me villas');
    await user.click(screen.getByRole('button'));

    expect(await screen.findByText('Show me villas')).toBeInTheDocument();
    expect(await screen.findByText('Bot reply')).toBeInTheDocument();
  });

  it('creates a new conversation doc on first send', async () => {
    const user = userEvent.setup();
    renderChatbot('?agentId=agent-1');
    await screen.findByText('Welcome to Sunrise Realty!');

    await user.type(screen.getByPlaceholderText(/Ask about properties/), 'Hello');
    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ agentId: 'agent-1' })
      );
    });
  });

  it('extracts client name from "I am" message', async () => {
    const user = userEvent.setup();
    renderChatbot('?agentId=agent-1');
    await screen.findByText('Welcome to Sunrise Realty!');

    await user.type(screen.getByPlaceholderText(/Ask about properties/), 'I am Alice');
    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ clientName: 'Alice' })
      );
    });
  });

  it('extracts contact info from email in message', async () => {
    const user = userEvent.setup();
    renderChatbot('?agentId=agent-1');
    await screen.findByText('Welcome to Sunrise Realty!');

    await user.type(screen.getByPlaceholderText(/Ask about properties/), 'alice@example.com');
    await user.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ contactInfo: 'alice@example.com' })
      );
    });
  });

  it('selects first agent from list when no urlAgentId', async () => {
    renderChatbot();
    // With agent-1 as first in the list, settings should load for it
    expect(await screen.findByText('SunBot')).toBeInTheDocument();
  });

  it('handles empty agents list gracefully', async () => {
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as any);

    renderChatbot();
    await waitFor(() => {
      expect(screen.queryByText('.animate-spin')).toBeNull();
    });
    // Should not crash with no agents
  });

  it('resets document title to default on unmount', async () => {
    const { unmount } = renderChatbot('?agentId=agent-1');
    await screen.findByText('Welcome to Sunrise Realty!');
    unmount();
    expect(document.title).toBe('AI Real Estate Chatbot');
  });

  it('handles addDoc error on conversation creation gracefully', async () => {
    vi.mocked(addDoc).mockRejectedValueOnce(new Error('Firestore error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const user = userEvent.setup();
    renderChatbot('?agentId=agent-1');
    await screen.findByText('Welcome to Sunrise Realty!');

    await user.type(screen.getByPlaceholderText(/Ask about properties/), 'Hello');
    await user.click(screen.getByRole('button'));

    await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
    consoleSpy.mockRestore();
  });
});
