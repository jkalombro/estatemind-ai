import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../../../App', () => ({ useAuth: vi.fn() }));

import { useAuth } from '../../../App';
import { onSnapshot, addDoc, updateDoc, deleteDoc } from '../../../firebase';
import { PropertyManager } from './PropertyManager';

const mockUser = { uid: 'test-uid', email: 'test@test.com' };
const sampleProperty = {
  id: 'prop1',
  title: 'Ocean Villa',
  location: 'Malibu, CA',
  price: 2500000,
  type: 'House',
  status: 'For Sale',
  bedrooms: 4,
  bathrooms: 3,
  description: 'Beautiful ocean view property',
  agentId: 'test-uid',
};

function renderPropertyManager() {
  return render(
    <MemoryRouter>
      <PropertyManager />
    </MemoryRouter>
  );
}

describe('PropertyManager', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({
      user: mockUser, profile: null, loading: false, isAdmin: false, isBlocked: false,
    });
    vi.mocked(onSnapshot).mockImplementation((_q, cb: any) => {
      cb({ docs: [{ id: sampleProperty.id, data: () => sampleProperty }] });
      return vi.fn();
    });
    vi.mocked(addDoc).mockResolvedValue({ id: 'new-prop' } as any);
    vi.mocked(updateDoc).mockResolvedValue(undefined);
    vi.mocked(deleteDoc).mockResolvedValue(undefined);
  });

  it('renders Property Listings heading', async () => {
    renderPropertyManager();
    expect(await screen.findByText('Property Listings')).toBeInTheDocument();
  });

  it('renders existing property', async () => {
    renderPropertyManager();
    expect(await screen.findByText('Ocean Villa')).toBeInTheDocument();
    expect(screen.getByText('Malibu, CA')).toBeInTheDocument();
  });

  it('shows empty state when no properties', async () => {
    vi.mocked(onSnapshot).mockImplementation((_q, cb: any) => {
      cb({ docs: [] });
      return vi.fn();
    });
    renderPropertyManager();
    expect(await screen.findByText(/No properties listed yet/)).toBeInTheDocument();
  });

  it('shows search-specific empty message', async () => {
    renderPropertyManager();
    await screen.findByText('Ocean Villa');

    const searchInput = screen.getByPlaceholderText(/Search properties/);
    await userEvent.type(searchInput, 'zzz-no-match');

    expect(await screen.findByText(/No properties match your search/)).toBeInTheDocument();
  });

  it('opens add form on "Add Property" click', async () => {
    const user = userEvent.setup();
    renderPropertyManager();
    await screen.findByText('Property Listings');
    await user.click(screen.getByRole('button', { name: /Add Property/i }));
    expect(screen.getByText('New Property Listing')).toBeInTheDocument();
  });

  it('closes form on Cancel click', async () => {
    const user = userEvent.setup();
    renderPropertyManager();
    await screen.findByText('Property Listings');
    await user.click(screen.getByRole('button', { name: /Add Property/i }));
    await user.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(screen.queryByText('New Property Listing')).toBeNull();
  });

  it('submits new property form', async () => {
    const user = userEvent.setup();
    renderPropertyManager();
    await screen.findByText('Property Listings');
    await user.click(screen.getByRole('button', { name: /Add Property/i }));

    await user.type(screen.getByPlaceholderText('Modern Villa with Pool'), 'Test Home');
    await user.type(screen.getByPlaceholderText('123 Luxury Ave, Beverly Hills, CA'), 'Test City');
    await user.type(screen.getByPlaceholderText(/Describe the property/), 'A lovely home.');
    await user.click(screen.getByRole('button', { name: /Save Listing/i }));

    await waitFor(() => {
      expect(addDoc).toHaveBeenCalledWith(
        'mock-collection-ref',
        expect.objectContaining({ title: 'Test Home', location: 'Test City' })
      );
    });
  });

  it('opens confirmation modal when delete clicked', async () => {
    const user = userEvent.setup();
    renderPropertyManager();
    await screen.findByText('Ocean Villa');

    // Delete icon buttons (no text)
    const buttons = screen.getAllByRole('button');
    const deleteBtn = buttons.find(b => b.title === '' && b.querySelector('svg'));
    // Find the trash button specifically
    const trashButtons = buttons.filter(b => !b.textContent || b.textContent === '');
    await user.click(trashButtons[1]); // second icon button = delete

    expect(screen.getByText('Delete Listing')).toBeInTheDocument();
  });

  it('opens "Mark as Sold" modal when Mark as Sold clicked', async () => {
    const user = userEvent.setup();
    renderPropertyManager();
    await screen.findByText('Ocean Villa');

    await user.click(screen.getByRole('button', { name: /Mark as Sold/i }));
    // The modal title renders in an h3; both button and h3 say "Mark as Sold"
    expect(screen.getByRole('heading', { name: 'Mark as Sold' })).toBeInTheDocument();
  });

  it('shows "Mark as For Sale" for sold properties', async () => {
    const soldProperty = { ...sampleProperty, status: 'Sold' };
    vi.mocked(onSnapshot).mockImplementation((_q, cb: any) => {
      cb({ docs: [{ id: soldProperty.id, data: () => soldProperty }] });
      return vi.fn();
    });

    renderPropertyManager();
    expect(await screen.findByRole('button', { name: /Mark as For Sale/i })).toBeInTheDocument();
  });

  it('opens "Mark as For Sale" modal when button clicked', async () => {
    const soldProperty = { ...sampleProperty, status: 'Sold' };
    vi.mocked(onSnapshot).mockImplementation((_q, cb: any) => {
      cb({ docs: [{ id: soldProperty.id, data: () => soldProperty }] });
      return vi.fn();
    });

    const user = userEvent.setup();
    renderPropertyManager();
    await screen.findByRole('button', { name: /Mark as For Sale/i });
    await user.click(screen.getByRole('button', { name: /Mark as For Sale/i }));
    expect(screen.getByRole('heading', { name: 'Mark as For Sale' })).toBeInTheDocument();
  });

  it('opens edit form with pre-populated data', async () => {
    const user = userEvent.setup();
    renderPropertyManager();
    await screen.findByText('Ocean Villa');

    const iconButtons = screen.getAllByRole('button').filter(b => !b.textContent || b.textContent === '');
    await user.click(iconButtons[0]); // Edit button

    expect(screen.getByDisplayValue('Ocean Villa')).toBeInTheDocument();
  });

  it('filters properties by search query', async () => {
    renderPropertyManager();
    await screen.findByText('Ocean Villa');

    await userEvent.type(screen.getByPlaceholderText(/Search properties/), 'Ocean');
    expect(screen.getByText('Ocean Villa')).toBeInTheDocument();
  });

  it('filters properties by status', async () => {
    renderPropertyManager();
    await screen.findByText('Ocean Villa');

    await userEvent.selectOptions(screen.getByRole('combobox'), 'Sold');
    expect(screen.queryByText('Ocean Villa')).toBeNull();
  });
});
