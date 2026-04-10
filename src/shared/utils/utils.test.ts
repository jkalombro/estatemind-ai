import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn()', () => {
  it('returns empty string for no args', () => {
    expect(cn()).toBe('');
  });

  it('merges class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes with objects', () => {
    expect(cn('base', { active: true, hidden: false })).toBe('base active');
  });

  it('handles arrays of classes', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });

  it('resolves tailwind conflicts (last wins)', () => {
    const result = cn('px-2', 'px-4');
    expect(result).toBe('px-4');
  });

  it('handles undefined and null values', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar');
  });

  it('handles false values', () => {
    expect(cn('foo', false && 'bar')).toBe('foo');
  });

  it('merges complex tailwind classes correctly', () => {
    const result = cn('text-sm text-gray-500', 'text-blue-600');
    expect(result).toBe('text-sm text-blue-600');
  });
});
