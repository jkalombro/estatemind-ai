import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChatHeader } from './ChatHeader';

describe('ChatHeader', () => {
  it('shows default name when settings is null', () => {
    render(<ChatHeader settings={null} />);
    expect(screen.getByText('EstateMind AI')).toBeInTheDocument();
  });

  it('shows custom chatbotName from settings', () => {
    render(<ChatHeader settings={{ chatbotName: 'MyBot' }} />);
    expect(screen.getByText('MyBot')).toBeInTheDocument();
  });

  it('shows "Online & Ready" status', () => {
    render(<ChatHeader settings={null} />);
    expect(screen.getByText('Online & Ready')).toBeInTheDocument();
  });

  it('shows "Powered by Gemini" attribution', () => {
    render(<ChatHeader settings={null} />);
    expect(screen.getByText('Powered by Gemini')).toBeInTheDocument();
  });

  it('renders Bot icon when no avatar URL is provided', () => {
    const { container } = render(<ChatHeader settings={{ chatbotName: 'Bot' }} />);
    // Bot icon is an svg
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders avatar image when chatbotAvatarUrl is provided', () => {
    render(<ChatHeader settings={{ chatbotAvatarUrl: 'https://example.com/avatar.png', chatbotName: 'Bot' }} />);
    const img = screen.getByAltText('AI Avatar');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.png');
  });
});
