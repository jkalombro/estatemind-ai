import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmationModal } from './ConfirmationModal';

const defaultProps = {
  isOpen: true,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  title: 'Delete Item',
  message: 'Are you sure you want to delete this item?',
};

describe('ConfirmationModal', () => {
  it('renders nothing when isOpen is false', () => {
    render(<ConfirmationModal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Delete Item')).toBeNull();
  });

  it('renders title and message when open', () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
  });

  it('shows default confirm and cancel text', () => {
    render(<ConfirmationModal {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('shows custom confirm and cancel text', () => {
    render(
      <ConfirmationModal
        {...defaultProps}
        confirmText="Yes, Delete"
        cancelText="No, Keep"
      />
    );
    expect(screen.getByRole('button', { name: 'Yes, Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'No, Keep' })).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} onClose={onClose} />);
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onClose when X button is clicked', async () => {
    const onClose = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} onClose={onClose} />);
    // X button is the only button without accessible name from the icon
    const buttons = screen.getAllByRole('button');
    const closeButton = buttons.find(b => !b.textContent?.includes('Cancel') && !b.textContent?.includes('Confirm'));
    await user.click(closeButton!);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('calls onConfirm and onClose when confirm button is clicked', async () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<ConfirmationModal {...defaultProps} onClose={onClose} onConfirm={onConfirm} />);
    await user.click(screen.getByRole('button', { name: 'Confirm' }));
    expect(onConfirm).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('applies danger variant styles', () => {
    render(<ConfirmationModal {...defaultProps} variant="danger" />);
    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
    expect(confirmBtn.className).toContain('bg-red-600');
  });

  it('applies info variant styles (default)', () => {
    render(<ConfirmationModal {...defaultProps} variant="info" />);
    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
    expect(confirmBtn.className).toContain('bg-blue-600');
  });

  it('defaults to info variant when variant is not provided', () => {
    render(<ConfirmationModal {...defaultProps} />);
    const confirmBtn = screen.getByRole('button', { name: 'Confirm' });
    expect(confirmBtn.className).toContain('bg-blue-600');
  });
});
