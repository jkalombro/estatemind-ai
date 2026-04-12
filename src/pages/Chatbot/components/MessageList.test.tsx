import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MessageList } from './MessageList';
import { createRef } from 'react';

const baseMessage = {
  id: 'm1',
  text: 'Hello world',
  sender: 'user' as const,
  timestamp: new Date('2024-01-01T10:00:00'),
};

const botMessage = {
  id: 'm2',
  text: 'Hi there!',
  sender: 'bot' as const,
  timestamp: new Date('2024-01-01T10:01:00'),
};

describe('MessageList', () => {
  const scrollRef = createRef<HTMLDivElement>();

  it('renders user messages', () => {
    render(
      <MessageList
        messages={[baseMessage]}
        isTyping={false}
        settings={null}
        scrollRef={scrollRef}
      />
    );
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('renders bot messages', () => {
    render(
      <MessageList
        messages={[botMessage]}
        isTyping={false}
        settings={null}
        scrollRef={scrollRef}
      />
    );
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('renders multiple messages', () => {
    render(
      <MessageList
        messages={[baseMessage, botMessage]}
        isTyping={false}
        settings={null}
        scrollRef={scrollRef}
      />
    );
    expect(screen.getByText('Hello world')).toBeInTheDocument();
    expect(screen.getByText('Hi there!')).toBeInTheDocument();
  });

  it('renders typing indicator when isTyping is true', () => {
    const { container } = render(
      <MessageList
        messages={[]}
        isTyping={true}
        settings={null}
        scrollRef={scrollRef}
      />
    );
    // Typing indicator has 3 bouncing dots
    const dots = container.querySelectorAll('.animate-bounce');
    expect(dots.length).toBe(3);
  });

  it('does not render typing indicator when isTyping is false', () => {
    const { container } = render(
      <MessageList
        messages={[]}
        isTyping={false}
        settings={null}
        scrollRef={scrollRef}
      />
    );
    const dots = container.querySelectorAll('.animate-bounce');
    expect(dots.length).toBe(0);
  });

  it('renders bot avatar image when chatbotAvatarUrl is set', () => {
    render(
      <MessageList
        messages={[botMessage]}
        isTyping={false}
        settings={{ chatbotAvatarUrl: 'https://example.com/bot.png' }}
        scrollRef={scrollRef}
      />
    );
    const imgs = screen.getAllByAltText('AI');
    expect(imgs.length).toBeGreaterThan(0);
    expect(imgs[0]).toHaveAttribute('src', 'https://example.com/bot.png');
  });

  it('renders typing avatar image when chatbotAvatarUrl is set', () => {
    render(
      <MessageList
        messages={[]}
        isTyping={true}
        settings={{ chatbotAvatarUrl: 'https://example.com/bot.png' }}
        scrollRef={scrollRef}
      />
    );
    const imgs = screen.getAllByAltText('AI');
    expect(imgs.length).toBeGreaterThan(0);
  });

  it('renders empty list without error', () => {
    const { container } = render(
      <MessageList
        messages={[]}
        isTyping={false}
        settings={null}
        scrollRef={scrollRef}
      />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders message timestamp', () => {
    render(
      <MessageList
        messages={[baseMessage]}
        isTyping={false}
        settings={null}
        scrollRef={scrollRef}
      />
    );
    // Timestamp formatted as HH:MM
    expect(screen.getByText(/\d{1,2}:\d{2}/)).toBeInTheDocument();
  });
});
