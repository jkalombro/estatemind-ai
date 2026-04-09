import { useState, useEffect } from 'react';
import { useAuth } from '../../../App';
import { Building2, Plus, Trash2, Edit, Save, X, Search } from 'lucide-react';
import { db, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from '../../../firebase';
import { LoadingScreen } from './LoadingScreen';
import { cn } from '../../../shared/utils/utils';
import { ConfirmationModal } from '../../../shared/components/ConfirmationModal';

export function PropertyManager() {
  const { user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant: 'danger' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    variant: 'info'
  });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    location: '',
    type: 'House',
    status: 'For Sale',
    bedrooms: 0,
    bathrooms: 0
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'properties'), where('agentId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProperties(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingId) {
        await updateDoc(doc(db, 'properties', editingId), formData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'properties'), {
          ...formData,
          agentId: user.uid,
          createdAt: new Date().toISOString()
        });
      }
      setIsAdding(false);
      setFormData({ title: '', description: '', price: 0, location: '', type: 'House', status: 'For Sale', bedrooms: 0, bathrooms: 0 });
    } catch (error) {
      console.error("Error saving property:", error);
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Listing',
      message: 'Are you sure you want to delete this listing? This action cannot be undone.',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'properties', id));
        } catch (error) {
          console.error("Error deleting property:", error);
        }
      }
    });
  };

  const handleMarkAsSold = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Mark as Sold',
      message: 'Are you sure you want to mark this property as Sold?',
      variant: 'info',
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, 'properties', id), {
            status: 'Sold'
          });
        } catch (error) {
          console.error("Error marking property as sold:", error);
        }
      }
    });
  };

  const handleMarkAsForSale = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Mark as For Sale',
      message: 'Are you sure you want to mark this property as For Sale?',
      variant: 'info',
      onConfirm: async () => {
        try {
          await updateDoc(doc(db, 'properties', id), {
            status: 'For Sale'
          });
        } catch (error) {
          console.error("Error marking property as for sale:", error);
        }
      }
    });
  };

  const handleEdit = (property: any) => {
    setEditingId(property.id);
    setFormData({
      title: property.title || '',
      description: property.description || '',
      price: property.price || 0,
      location: property.location || '',
      type: property.type || 'House',
      status: property.status || 'For Sale',
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0
    });
    setIsAdding(true);
  };

  if (loading) return <LoadingScreen />;

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         property.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || property.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Property Listings</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your active real estate properties.</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setEditingId(null); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          >
            <option value="All">All Statuses</option>
            <option value="For Sale">For Sale</option>
            <option value="Sold">Sold</option>
            <option value="For Rent">For Rent</option>
            <option value="Rented">Rented</option>
          </select>
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search properties by title or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
        </div>
      </div>

      {isAdding && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editingId ? 'Edit Property' : 'New Property Listing'}</h2>
            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X className="w-6 h-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Property Title</label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                placeholder="Modern Villa with Pool"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
              <input
                required
                type="number"
                value={formData.price}
                onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
              <input
                required
                type="text"
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                placeholder="123 Luxury Ave, Beverly Hills, CA"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Property Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              >
                <option>House</option>
                <option>Apartment</option>
                <option>Condo</option>
                <option>Land</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
              >
                <option>For Sale</option>
                <option>Sold</option>
                <option>For Rent</option>
                <option>Rented</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bedrooms</label>
                <input
                  type="number"
                  value={formData.bedrooms}
                  onChange={e => setFormData({ ...formData, bedrooms: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Bathrooms</label>
                <input
                  type="number"
                  value={formData.bathrooms}
                  onChange={e => setFormData({ ...formData, bathrooms: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors"
                />
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-colors"
                placeholder="Describe the property's key features..."
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-6 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update Listing' : 'Save Listing'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredProperties.map((property) => (
          <div key={property.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{property.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Building2 className="w-3 h-3" />
                  {property.location}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(property)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all cursor-pointer"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(property.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
              <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{property.type}</span>
              <span className={cn(
                "px-2 py-1 rounded text-xs font-bold uppercase tracking-wider",
                property.status === 'Sold' || property.status === 'Rented' 
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
              )}>
                {property.status || 'For Sale'}
              </span>
              <span>{property.bedrooms} Beds</span>
              <span>{property.bathrooms} Baths</span>
              <span className="text-blue-600 dark:text-blue-400 ml-auto font-bold">{property.price.toLocaleString()}</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 leading-relaxed mb-4">
              {property.description}
            </p>
            <div className="mt-auto">
              {property.status !== 'Sold' ? (
                <button
                  onClick={() => handleMarkAsSold(property.id)}
                  className="w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 transition-all cursor-pointer"
                >
                  Mark as Sold
                </button>
              ) : (
                <button
                  onClick={() => handleMarkAsForSale(property.id)}
                  className="w-full py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-bold hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all cursor-pointer"
                >
                  Mark as For Sale
                </button>
              )}
            </div>
          </div>
        ))}
        {filteredProperties.length === 0 && !isAdding && (
          <div className="col-span-full py-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <Building2 className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {searchQuery ? 'No properties match your search.' : 'No properties listed yet. Start by adding your first one!'}
            </p>
          </div>
        )}
      </div>

      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant={confirmConfig.variant}
      />
    </div>
  );
}
