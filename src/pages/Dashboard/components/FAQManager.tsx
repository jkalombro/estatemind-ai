import { useState, useEffect } from 'react';
import { useAuth } from '../../../App';
import { MessageSquare, Plus, Trash2, Edit, X, Save } from 'lucide-react';
import { db, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from '../../../firebase';
import { LoadingScreen } from './LoadingScreen';
import { ConfirmationModal } from '../../../shared/components/ConfirmationModal';

export function FAQManager() {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ question: '', answer: '' });
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'faqs'), where('agentId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFaqs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setIsSaving(true);
      if (editingId) {
        await updateDoc(doc(db, 'faqs', editingId), formData);
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'faqs'), {
          ...formData,
          agentId: user.uid,
          createdAt: new Date().toISOString()
        });
      }
      setIsAdding(false);
      setFormData({ question: '', answer: '' });
    } catch (error) {
      console.error("Error saving FAQ:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (faq: any) => {
    setEditingId(faq.id);
    setFormData({ 
      question: faq.question || '', 
      answer: faq.answer || '' 
    });
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete FAQ',
      message: 'Are you sure you want to delete this FAQ? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, 'faqs', id));
        } catch (error) {
          console.error("Error deleting FAQ:", error);
        }
      }
    });
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">FAQ Database</h1>
          <p className="text-gray-500 dark:text-gray-400">Train your AI with common questions and answers.</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setEditingId(null); }}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add FAQ
        </button>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xl w-full max-w-lg relative">
            {isSaving && (
              <div className="absolute inset-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-sm font-bold text-gray-900 dark:text-white">Saving FAQ...</p>
              </div>
            )}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editingId ? 'Edit FAQ' : 'New FAQ'}</h2>
              <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Question</label>
                <input
                  required
                  type="text"
                  value={formData.question}
                  onChange={e => setFormData({ ...formData, question: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="What are your office hours?"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Answer</label>
                <textarea
                  required
                  rows={4}
                  value={formData.answer}
                  onChange={e => setFormData({ ...formData, answer: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                  placeholder="We are open Monday to Friday, 9 AM to 6 PM."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 cursor-pointer">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Update FAQ' : 'Save FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.id} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex justify-between items-start gap-4">
            <div className="space-y-2">
              <h3 className="font-bold text-gray-900 dark:text-white">Q: {faq.question}</h3>
              <p className="text-gray-600 dark:text-gray-400 italic">A: {faq.answer}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => handleEdit(faq)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg cursor-pointer"><Edit className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(faq.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg cursor-pointer"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
        {faqs.length === 0 && !isAdding && (
          <div className="py-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
            <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No FAQs yet. Add some to help your AI assistant learn!</p>
          </div>
        )}
      </div>
      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        variant="danger"
      />
    </div>
  );
}
