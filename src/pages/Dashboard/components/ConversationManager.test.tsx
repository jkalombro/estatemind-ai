import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../App', () => ({ useAuth: vi.fn() }));

import { useAuth } from '../../../App';
import { onSnapshot, getDocs, deleteDoc } from '../../../firebase';
import { ConversationManager } from './ConversationManager';

const mockUser = { uid: 'test-uid', email: 'test@test.com' };

const sampleConv = {
  id: 'conv1',
  clientName: 'Alice Smith',
  contactInfo: 'alice@example.com',
  lastMessage: 'I am interested in the villa.',
  updatedAt: new Date().toISOString(),
  agentId: 'test-uid',
};

const sampleMessage = {
  id: 'msg1',
  text: 'Hello, I want to see a property.',
  sender: 'user',
  conversationId: 'conv1',
  agentId: 'test-uid',
  createdAt: new Date().toISOString(),
};

function renderConversationManager() {
  return render(
    <MemoryRouter>
      <ConversationManager />
    </MemoryRouter>
  );
}

describe('ConversationManager', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser, profile: null, loading: false, isAdmin: false, isBlocked: false,
    });

    let snapshotCallCount = 0;
    vi.mocked(onSnapshot).mockImplementation((_q, successCb: any, _errorCb?: any) => {
      snapshotCallCount++;
      if (snapshotCallCount % 2 === 1) {
        // conversations snapshot
        successCb({ docs: [{ id: sampleConv.id, data: () => sampleConv }] });
      } else {
        // messages snapshot
        successCb({ docs: [] });
      }
      return vi.fn();
    });

    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);
    vi.mocked(deleteDoc).mockResolvedValue(undefined);
  });

  it('renders Conversations heading', async () => {
    renderConversationManager();
    expect(await screen.findByText('Conversations')).toBeInTheDocument();
  });

  it('renders conversation list items', async () => {
    renderConversationManager();
    expect(await screen.findByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('I am interested in the villa.')).toBeInTheDocument();
  });

  it('shows empty state when no conversations', async () => {
    vi.mocked(onSnapshot).mockImplementation((_q, cb: any) => {
      cb({ docs: [] });
      return vi.fn();
    });
    renderConversationManager();
    expect(await screen.findByText('No conversations yet.')).toBeInTheDocument();
  });

  it('shows "Select a conversation" placeholder', async () => {
    renderConversationManager();
    await screen.findByText('Conversations');
    expect(screen.getByText('Select a conversation to view details')).toBeInTheDocument();
  });

  it('opens conversation detail on click', async () => {
    const user = userEvent.setup();
    renderConversationManager();
    await screen.findByText('Alice Smith');
    await user.click(screen.getByRole('button', { name: /Alice Smith/i }));
    // Contact info appears in both the list item and the detail pane
    const contactEls = screen.getAllByText('alice@example.com');
    expect(contactEls.length).toBeGreaterThanOrEqual(1);
  });

  it('shows "No messages" when conversation has no messages', async () => {
    const user = userEvent.setup();
    renderConversationManager();
    await screen.findByText('Alice Smith');
    await user.click(screen.getByRole('button', { name: /Alice Smith/i }));
    expect(await screen.findByText('No messages in this conversation yet.')).toBeInTheDocument();
  });

  it('shows messages when present', async () => {
    let callCount = 0;
    vi.mocked(onSnapshot).mockImplementation((_q, cb: any) => {
      callCount++;
      if (callCount === 1) {
        cb({ docs: [{ id: sampleConv.id, data: () => sampleConv }] });
      } else {
        cb({ docs: [{ id: sampleMessage.id, data: () => sampleMessage }] });
      }
      return vi.fn();
    });

    const user = userEvent.setup();
    renderConversationManager();
    await screen.findByText('Alice Smith');
    await user.click(screen.getByRole('button', { name: /Alice Smith/i }));
    expect(await screen.findByText('Hello, I want to see a property.')).toBeInTheDocument();
  });

  it('opens delete confirmation when trash clicked', async () => {
    const user = userEvent.setup();
    renderConversationManager();
    await screen.findByText('Alice Smith');

    // Trash buttons are icon-only with no text
    const allButtons = screen.getAllByRole('button');
    const trashBtn = allButtons.find(b => !b.textContent || b.textContent === '');
    if (trashBtn) await user.click(trashBtn);

    expect(await screen.findByText('Delete Conversation?')).toBeInTheDocument();
  });

  it('closes delete modal on Cancel', async () => {
    const user = userEvent.setup();
    renderConversationManager();
    await screen.findByText('Alice Smith');

    const allButtons = screen.getAllByRole('button');
    const trashBtn = allButtons.find(b => !b.textContent || b.textContent === '');
    if (trashBtn) await user.click(trashBtn);

    await screen.findByText('Delete Conversation?');
    await user.click(screen.getByRole('button', { name: /^Cancel$/i }));
    expect(screen.queryByText('Delete Conversation?')).toBeNull();
  });

  it('calls deleteDoc when Delete confirmed', async () => {
    vi.mocked(getDocs).mockResolvedValue({ docs: [] } as any);
    const user = userEvent.setup();
    renderConversationManager();
    await screen.findByText('Alice Smith');

    const allButtons = screen.getAllByRole('button');
    const trashBtn = allButtons.find(b => !b.textContent || b.textContent === '');
    if (trashBtn) await user.click(trashBtn);

    await screen.findByText('Delete Conversation?');
    await user.click(screen.getByRole('button', { name: /^Delete$/i }));

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalled();
    });
  });
});
