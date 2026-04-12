import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from './ChatInput';

describe('ChatInput', () => {
  it('renders the input field', () => {
    render(<ChatInput input="" setInput={vi.fn()} onSend={vi.fn()} disabled={false} />);
    expect(screen.getByPlaceholderText(/Ask about properties/)).toBeInTheDocument();
  });

  it('shows the current input value', () => {
    render(<ChatInput input="hello" setInput={vi.fn()} onSend={vi.fn()} disabled={false} />);
    expect(screen.getByDisplayValue('hello')).toBeInTheDocument();
  });

  it('calls setInput when user types', async () => {
    const setInput = vi.fn();
    const user = userEvent.setup();
    render(<ChatInput input="" setInput={setInput} onSend={vi.fn()} disabled={false} />);
    await user.type(screen.getByPlaceholderText(/Ask about properties/), 'H');
    expect(setInput).toHaveBeenCalled();
  });

  it('disables send button when input is empty', () => {
    render(<ChatInput input="" setInput={vi.fn()} onSend={vi.fn()} disabled={false} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('disables send button when disabled prop is true', () => {
    render(<ChatInput input="hello" setInput={vi.fn()} onSend={vi.fn()} disabled={true} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('enables send button when input has text and not disabled', () => {
    render(<ChatInput input="hello" setInput={vi.fn()} onSend={vi.fn()} disabled={false} />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('calls onSend when form is submitted', async () => {
    const onSend = vi.fn((e) => e.preventDefault());
    const user = userEvent.setup();
    render(<ChatInput input="hello" setInput={vi.fn()} onSend={onSend} disabled={false} />);
    await user.click(screen.getByRole('button'));
    expect(onSend).toHaveBeenCalledOnce();
  });

  it('renders disclaimer text', () => {
    render(<ChatInput input="" setInput={vi.fn()} onSend={vi.fn()} disabled={false} />);
    expect(screen.getByText(/AI can make mistakes/)).toBeInTheDocument();
  });

  it('disables send button for whitespace-only input', () => {
    render(<ChatInput input="   " setInput={vi.fn()} onSend={vi.fn()} disabled={false} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
