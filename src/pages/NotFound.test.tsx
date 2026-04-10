import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { NotFound } from './NotFound';

describe('NotFound', () => {
  it('renders 404 heading', () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>);
    expect(screen.getByText('404 - Page Not Found')).toBeInTheDocument();
  });

  it('renders description text', () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>);
    expect(screen.getByText(/The page you're looking for doesn't exist/)).toBeInTheDocument();
  });

  it('renders Back to Home link pointing to /', () => {
    render(<MemoryRouter><NotFound /></MemoryRouter>);
    const link = screen.getByRole('link', { name: /Back to Home/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/');
  });
});
