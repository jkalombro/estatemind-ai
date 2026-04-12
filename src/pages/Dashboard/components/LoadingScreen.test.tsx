import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LoadingScreen } from './LoadingScreen';

describe('LoadingScreen', () => {
  it('renders without crashing', () => {
    const { container } = render(<LoadingScreen />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders a spinning element', () => {
    const { container } = render(<LoadingScreen />);
    // The spinning div has a border class
    const spinner = container.querySelector('.border-blue-600');
    expect(spinner).toBeInTheDocument();
  });

  it('renders within a flex container', () => {
    const { container } = render(<LoadingScreen />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('flex');
  });
});
