import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../App', () => ({ useAuth: vi.fn() }));

import { useAuth } from '../../../App';
import { onSnapshot, addDoc, updateDoc, deleteDoc } from '../../../firebase';
import { FAQManager } from './FAQManager';

const mockUser = { uid: 'test-uid', email: 'test@test.com' };
const sampleFaqs = [
  { id: 'faq1', question: 'What are your hours?', answer: 'Mon-Fri 9–5', agentId: 'test-uid' },
];

function renderFAQManager() {
  return render(
    <MemoryRouter>
      <FAQManager />
    </MemoryRouter>
  );
}

describe('FAQManager', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser, profile: null, loading: false, isAdmin: false, isBlocked: false,
    });
    vi.mocked(onSnapshot).mockImplementation((_q, cb: any) => {
      cb({ docs: sampleFaqs.map(f => ({ id: f.id, data: () => f })) });
      return vi.fn();
    });
    vi.mocked(addDoc).mockResolvedValue({ id: 'new-faq' } as any);
    vi.mocked(updateDoc).mockResolvedValue(undefined);
    vi.mocked(deleteDoc).mockResolvedValue(undefined);
  });

  it('renders FAQ Database heading', async () => {
    renderFAQManager();
    expect(await screen.findByText('FAQ Database')).toBeInTheDocument();
  });

  it('renders existing FAQs', async () => {
    renderFAQManager();
    expect(await screen.findByText('Q: What are your hours?')).toBeInTheDocument();
    expect(screen.getByText('A: Mon-Fri 9–5')).toBeInTheDocument();
  });

  it('shows empty state when no FAQs', async () => {
    vi.mocked(onSnapshot).mockImplementation((_q, cb: any) => {
      cb({ docs: [] });
      return vi.fn();
    });
    renderFAQManager();
    expect(await screen.findByText(/No FAQs yet/)).toBeInTheDocument();
  });

  it('opens add form on "Add FAQ" click', async () => {
    const user = userEvent.setup();
    renderFAQManager();
    await screen.findByText('FAQ Database');
    await user.click(screen.getByRole('button', { name: /Add FAQ/i }));
    expect(screen.getByPlaceholderText(/What are your office hours/)).toBeInTheDocument();
  });

  it('closes form on Cancel click', async () => {
    const user = userEvent.setup();
    renderFAQManager();
    await screen.findByText('FAQ Database');
    await user.click(screen.getByRole('button', { name: /Add FAQ/i }));
    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(screen.queryByPlaceholderText(/What are your office hours/)).toBeNull();
  });

  it('submits new FAQ', async () => {
    const user = userEvent.setup();
    renderFAQManager();
    await screen.findByText('FAQ Database');
    await user.click(screen.getByRole('button', { name: /Add FAQ/i }));

    await user.type(screen.getByPlaceholderText(/What are your office hours/), 'Test Question');
    await user.type(screen.getByPlaceholderText(/We are open Monday/), 'Test Answer');
    await user.click(screen.getByRole('button', { name: /Save FAQ/i }));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({ question: 'Test Question', answer: 'Test Answer' })
      );
    });
  });

  it('opens edit form for existing FAQ', async () => {
    const user = userEvent.setup();
    renderFAQManager();
    await screen.findByText('Q: What are your hours?');

    // Click the edit button (first Edit icon button)
    const editButtons = screen.getAllByRole('button').filter(b => !b.textContent);
    await user.click(editButtons[0]);

    // Form should be pre-populated
    expect((screen.getByDisplayValue('What are your hours?') as HTMLInputElement).value).toBe('What are your hours?');
  });

  it('submits update for existing FAQ', async () => {
    const user = userEvent.setup();
    renderFAQManager();
    await screen.findByText('Q: What are your hours?');

    const editButtons = screen.getAllByRole('button').filter(b => !b.textContent);
    await user.click(editButtons[0]);

    await user.click(screen.getByRole('button', { name: /Save FAQ/i }));

    await waitFor(() => {
      expect(updateDoc).toHaveBeenCalledWith(
        'mock-doc-ref',
        expect.objectContaining({ question: 'What are your hours?' })
      );
    });
  });

  it('calls deleteDoc when delete confirmed', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const user = userEvent.setup();
    renderFAQManager();
    await screen.findByText('Q: What are your hours?');

    const allButtons = screen.getAllByRole('button').filter(b => !b.textContent);
    // The second icon button is delete (Trash2)
    await user.click(allButtons[1]);

    await waitFor(() => {
      expect(deleteDoc).toHaveBeenCalled();
    });
  });

  it('does not call deleteDoc when delete canceled', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    const user = userEvent.setup();
    renderFAQManager();
    await screen.findByText('Q: What are your hours?');

    const allButtons = screen.getAllByRole('button').filter(b => !b.textContent);
    await user.click(allButtons[1]);

    expect(deleteDoc).not.toHaveBeenCalled();
  });
});
