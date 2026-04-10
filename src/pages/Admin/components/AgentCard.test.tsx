import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgentCard } from './AgentCard';

const agent = {
  id: 'agent-1',
  displayName: 'Jane Doe',
  email: 'jane@example.com',
  isBlocked: false,
};

const blockedAgent = {
  ...agent,
  isBlocked: true,
};

const stats = { properties: 5, conversations: 12 };

describe('AgentCard', () => {
  it('renders agent display name', () => {
    render(<AgentCard agent={agent} stats={stats} updatingId={null} onToggleBlock={vi.fn()} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('renders agent email', () => {
    render(<AgentCard agent={agent} stats={stats} updatingId={null} onToggleBlock={vi.fn()} />);
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('renders property count', () => {
    render(<AgentCard agent={agent} stats={stats} updatingId={null} onToggleBlock={vi.fn()} />);
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('renders conversation count', () => {
    render(<AgentCard agent={agent} stats={stats} updatingId={null} onToggleBlock={vi.fn()} />);
    expect(screen.getByText('12')).toBeInTheDocument();
  });

  it('shows "Block Agent" for active agents', () => {
    render(<AgentCard agent={agent} stats={stats} updatingId={null} onToggleBlock={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Block Agent/i })).toBeInTheDocument();
  });

  it('shows "Unblock Agent" for blocked agents', () => {
    render(<AgentCard agent={blockedAgent} stats={stats} updatingId={null} onToggleBlock={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Unblock Agent/i })).toBeInTheDocument();
  });

  it('shows "Blocked" badge for blocked agents', () => {
    render(<AgentCard agent={blockedAgent} stats={stats} updatingId={null} onToggleBlock={vi.fn()} />);
    expect(screen.getByText('Blocked')).toBeInTheDocument();
  });

  it('does not show "Blocked" badge for active agents', () => {
    render(<AgentCard agent={agent} stats={stats} updatingId={null} onToggleBlock={vi.fn()} />);
    expect(screen.queryByText('Blocked')).toBeNull();
  });

  it('calls onToggleBlock with correct args when Block clicked', async () => {
    const onToggleBlock = vi.fn();
    const user = userEvent.setup();
    render(<AgentCard agent={agent} stats={stats} updatingId={null} onToggleBlock={onToggleBlock} />);
    await user.click(screen.getByRole('button', { name: /Block Agent/i }));
    expect(onToggleBlock).toHaveBeenCalledWith('agent-1', false);
  });

  it('calls onToggleBlock with correct args when Unblock clicked', async () => {
    const onToggleBlock = vi.fn();
    const user = userEvent.setup();
    render(<AgentCard agent={blockedAgent} stats={stats} updatingId={null} onToggleBlock={onToggleBlock} />);
    await user.click(screen.getByRole('button', { name: /Unblock Agent/i }));
    expect(onToggleBlock).toHaveBeenCalledWith('agent-1', true);
  });

  it('disables button while updating this agent', () => {
    render(<AgentCard agent={agent} stats={stats} updatingId="agent-1" onToggleBlock={vi.fn()} />);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('does not disable button when updatingId is a different agent', () => {
    render(<AgentCard agent={agent} stats={stats} updatingId="agent-99" onToggleBlock={vi.fn()} />);
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  it('shows 0 when stats is undefined', () => {
    render(<AgentCard agent={agent} stats={undefined} updatingId={null} onToggleBlock={vi.fn()} />);
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBe(4);
  });

  it('renders first letter of displayName as avatar', () => {
    render(<AgentCard agent={agent} stats={stats} updatingId={null} onToggleBlock={vi.fn()} />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });

  it('uses email initial when displayName is missing', () => {
    const noNameAgent = { ...agent, displayName: '' };
    render(<AgentCard agent={noNameAgent} stats={stats} updatingId={null} onToggleBlock={vi.fn()} />);
    expect(screen.getByText('J')).toBeInTheDocument();
  });
});
