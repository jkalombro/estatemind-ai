import { useState, useEffect } from 'react';
import { useAuth } from '../../../App';
import { Save } from 'lucide-react';
import { db, doc, setDoc, getDoc } from '../../../firebase';
import { LoadingScreen } from './LoadingScreen';

export function SettingsManager() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    chatbotName: 'EstateMind AI',
    chatbotAvatarUrl: '',
    welcomeMessage: 'Hello! How can I help you with your real estate needs today?',
    agencyName: ''
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchSettings = async () => {
      const docRef = doc(db, 'settings', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          chatbotName: data.chatbotName || 'EstateMind AI',
          chatbotAvatarUrl: data.chatbotAvatarUrl || '',
          welcomeMessage: data.welcomeMessage || 'Hello! How can I help you with your real estate needs today?',
          agencyName: data.agencyName || ''
        });
      }
      setLoading(false);
    };
    fetchSettings();
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', user.uid), {
        ...settings,
        agentId: user.uid
      });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Chatbot Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Customize how your AI assistant interacts with clients.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm space-y-6 transition-colors">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Agent / Business Name</label>
          <input
            type="text"
            value={settings.agencyName}
            onChange={e => setSettings({ ...settings, agencyName: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="John Doe Real Estate"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Chatbot Name</label>
          <input
            type="text"
            value={settings.chatbotName}
            onChange={e => setSettings({ ...settings, chatbotName: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Chatbot Avatar URL</label>
          <input
            type="text"
            value={settings.chatbotAvatarUrl}
            onChange={e => setSettings({ ...settings, chatbotAvatarUrl: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
            placeholder="https://example.com/avatar.png"
          />
          <p className="text-[10px] text-gray-400 dark:text-gray-500 italic">Provide a direct link to an image (e.g., from Unsplash or your agency site).</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Welcome Message</label>
          <textarea
            rows={3}
            value={settings.welcomeMessage}
            onChange={e => setSettings({ ...settings, welcomeMessage: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-colors"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {saving ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
          Save Configuration
        </button>
      </form>
    </div>
  );
}
