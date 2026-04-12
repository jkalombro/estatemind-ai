import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AgentSelector } from './AgentSelector';

const agents = [
  { id: 'a1', agencyName: 'Sunrise Realty', chatbotName: 'SunBot' },
  { id: 'a2', agencyName: 'Pacific Homes', chatbotName: 'PacBot' },
];

describe('AgentSelector', () => {
  it('returns null when urlAgentId is provided', () => {
    const { container } = render(
      <AgentSelector
        agents={agents}
        selectedAgent={null}
        onSelectAgent={vi.fn()}
        urlAgentId="a1"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders agent list when urlAgentId is null', () => {
    render(
      <AgentSelector
        agents={agents}
        selectedAgent={null}
        onSelectAgent={vi.fn()}
        urlAgentId={null}
      />
    );
    expect(screen.getByText('Sunrise Realty')).toBeInTheDocument();
    expect(screen.getByText('Pacific Homes')).toBeInTheDocument();
  });

  it('shows "No active agents found." when agents list is empty', () => {
    render(
      <AgentSelector
        agents={[]}
        selectedAgent={null}
        onSelectAgent={vi.fn()}
        urlAgentId={null}
      />
    );
    expect(screen.getByText(/No active agents found/)).toBeInTheDocument();
  });

  it('shows chatbotName under each agent', () => {
    render(
      <AgentSelector
        agents={agents}
        selectedAgent={null}
        onSelectAgent={vi.fn()}
        urlAgentId={null}
      />
    );
    expect(screen.getByText('AI: SunBot')).toBeInTheDocument();
    expect(screen.getByText('AI: PacBot')).toBeInTheDocument();
  });

  it('calls onSelectAgent with agent id when clicked', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <AgentSelector
        agents={agents}
        selectedAgent={null}
        onSelectAgent={onSelect}
        urlAgentId={null}
      />
    );
    await user.click(screen.getByText('Sunrise Realty'));
    expect(onSelect).toHaveBeenCalledWith('a1');
  });

  it('applies selected styling to the active agent', () => {
    render(
      <AgentSelector
        agents={agents}
        selectedAgent="a1"
        onSelectAgent={vi.fn()}
        urlAgentId={null}
      />
    );
    const activeBtn = screen.getByText('Sunrise Realty').closest('button')!;
    expect(activeBtn.className).toContain('bg-blue-50');
  });

  it('shows "Unnamed Agent" for agents without agencyName', () => {
    render(
      <AgentSelector
        agents={[{ id: 'x', chatbotName: 'Bot' }]}
        selectedAgent={null}
        onSelectAgent={vi.fn()}
        urlAgentId={null}
      />
    );
    expect(screen.getByText(/Unnamed Agent/)).toBeInTheDocument();
  });

  it('renders Select Agent heading', () => {
    render(
      <AgentSelector
        agents={agents}
        selectedAgent={null}
        onSelectAgent={vi.fn()}
        urlAgentId={null}
      />
    );
    expect(screen.getByRole('heading', { name: /Select Agent/i })).toBeInTheDocument();
  });
});
