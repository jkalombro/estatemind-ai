import { useState, useEffect } from 'react';
import { useAuth } from '../../../App';
import { MessageSquare, Plus, Trash2, Edit } from 'lucide-react';
import { db, collection, query, where, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from '../../../firebase';
import { LoadingScreen } from './LoadingScreen';

export function FAQManager() {
  const { user } = useAuth();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ question: '', answer: '' });

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
    if (window.confirm("Delete this FAQ?")) {
      await deleteDoc(doc(db, 'faqs', id));
    }
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
        <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
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
                rows={3}
                value={formData.answer}
                onChange={e => setFormData({ ...formData, answer: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="We are open Monday to Friday, 9 AM to 6 PM."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-600 dark:text-gray-400 cursor-pointer">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">Save FAQ</button>
            </div>
          </form>
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
    </div>
  );
}
