import { useState, useEffect } from 'react';
import { useAuth } from '../../../App';
import { Save, ImagePlus, Loader2, X } from 'lucide-react';
import { db, doc, setDoc, getDoc } from '../../../firebase';
import { LoadingScreen } from './LoadingScreen';

export function SettingsManager() {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    chatbotName: 'EstateMind AI',
    chatbotAvatarUrl: '',
    welcomeMessage: 'Hello! How can I help you with your real estate needs today?'
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

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
          welcomeMessage: data.welcomeMessage || 'Hello! How can I help you with your real estate needs today?'
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
        agentId: user.uid,
        agentName: user.displayName || 'Unnamed Agent',
        agentPhoto: user.photoURL || ''
      });
      alert("Settings saved successfully!");
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      console.error("Cloudinary configuration missing.");
      alert("Cloudinary configuration is missing. Please check the settings.");
      return;
    }

    setUploadingAvatar(true);

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('upload_preset', uploadPreset);
      uploadData.append('folder', `avatars/${user.uid}`);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: uploadData,
        }
      );

      if (!response.ok) {
        throw new Error('Failed to upload image to Cloudinary');
      }

      const data = await response.json();
      setSettings(prev => ({ ...prev, chatbotAvatarUrl: data.secure_url }));
    } catch (error) {
      console.error("Error uploading avatar to Cloudinary:", error);
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setUploadingAvatar(false);
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
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Chatbot Name</label>
          <input
            type="text"
            value={settings.chatbotName}
            onChange={e => setSettings({ ...settings, chatbotName: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Chatbot Avatar</label>
          <div className="flex items-center gap-4">
            {settings.chatbotAvatarUrl ? (
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 group">
                <img src={settings.chatbotAvatarUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, chatbotAvatarUrl: '' })}
                  className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            ) : (
              <label className="w-20 h-20 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800 flex flex-col items-center justify-center gap-1 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all cursor-pointer">
                {uploadingAvatar ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <>
                    <ImagePlus className="w-5 h-5 text-gray-400" />
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Upload</span>
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingAvatar}
                  className="hidden"
                />
              </label>
            )}
            <div className="flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Upload a photo for your AI assistant. This will be visible to clients in the chat window.
              </p>
            </div>
          </div>
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
