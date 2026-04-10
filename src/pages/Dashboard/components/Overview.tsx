import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../App';
import { Building2, MessageSquare, Copy, Check, ExternalLink, Settings } from 'lucide-react';
import { db, collection, query, where, onSnapshot, doc } from '../../../firebase';
import { cn } from '../../../shared/utils/utils';
import { motion } from 'motion/react';
import { LoadingScreen } from './LoadingScreen';

export function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    month: 0,
    forSale: 0,
    sold: 0,
    listings: 0
  });
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    if (!user) return;

    const unsubscribeSettings = onSnapshot(doc(db, 'settings', user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setSettings(snapshot.data());
      }
    });

    const conversationsQuery = query(collection(db, 'conversations'), where('agentId', '==', user.uid));
    const propertiesQuery = query(collection(db, 'properties'), where('agentId', '==', user.uid));

    const unsubscribeConvs = onSnapshot(conversationsQuery, (snapshot) => {
      const now = new Date();
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

      let monthCount = 0;

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const date = new Date(data.createdAt || data.updatedAt);
        if (date >= monthAgo) monthCount++;
      });

      setStats(prev => ({ ...prev, month: monthCount }));
      setLoading(false);
    });

    const unsubscribeProps = onSnapshot(propertiesQuery, (snapshot) => {
      let forSale = 0;
      let sold = 0;
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.status === 'Sold') {
          sold++;
        } else if (data.status === 'For Sale' || !data.status) {
          forSale++;
        }
      });

      setStats(prev => ({ ...prev, listings: snapshot.size, forSale, sold }));
    });

    return () => {
      unsubscribeSettings();
      unsubscribeConvs();
      unsubscribeProps();
    };
  }, [user]);

  const baseUrl = window.location.href.split('#')[0];
  const chatbotUrl = `${baseUrl}${baseUrl.endsWith('/') ? '' : '/'}#/chatbot?agentId=${user?.uid}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(chatbotUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <LoadingScreen />;

  const statCards = [
    { title: 'Clients This Month', value: stats.month, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'Items for Sale', value: stats.forSale, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { title: 'Items Sold', value: stats.sold, icon: Building2, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { title: 'Total Listings', value: stats.listings, icon: Building2, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Overview</h1>
        <p className="text-gray-500 dark:text-gray-400">Your AI chatbot's performance at a glance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
          >
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", card.bg)}>
              <card.icon className={cn("w-6 h-6", card.color)} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
              <p className="text-4xl font-black text-gray-900 dark:text-white tracking-tight">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-900 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm space-y-8"
      >
        {/* Chatbot Summary Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={settings?.chatbotAvatarUrl || `https://ui-avatars.com/api/?name=${settings?.chatbotName || 'AI'}&background=0D8ABC&color=fff`} 
                alt="Chatbot Avatar" 
                className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-50 dark:border-blue-900/30 shadow-sm"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                {settings?.chatbotName || 'EstateMind AI'}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Managed by <span className="font-medium text-blue-600 dark:text-blue-400">{user?.displayName || 'Agent'}</span>
              </p>
            </div>
          </div>
          
          <Link 
            to="/dashboard/settings" 
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold transition-all border border-gray-200 dark:border-gray-700"
          >
            <Settings className="w-4 h-4" />
            Customize Chatbot
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Your AI Chatbot Link
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Share this link with your clients or embed it on your website to start capturing leads.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-2xl border border-gray-100 dark:border-gray-700/50 w-full md:w-auto">
            <code className="px-3 py-1 text-sm font-mono text-blue-600 dark:text-blue-400 truncate max-w-[200px] md:max-w-xs">
              {chatbotUrl}
            </code>
            <div className="flex gap-1">
              <button
                onClick={copyToClipboard}
                className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all text-gray-500 hover:text-blue-600 cursor-pointer"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
              </button>
              <a
                href={chatbotUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 hover:bg-white dark:hover:bg-gray-700 rounded-xl transition-all text-gray-500 hover:text-blue-600 cursor-pointer"
                title="Open in new tab"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-blue-200 dark:shadow-none overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Ready to scale?</h2>
          <p className="text-blue-100 max-w-md mb-6">Your AI is handling conversations efficiently. Add more properties or FAQs to improve its knowledge base.</p>
          <div className="flex gap-4">
            <Link to="/dashboard/properties" className="bg-white text-blue-600 px-6 py-2 rounded-xl font-bold hover:bg-blue-50 transition-colors cursor-pointer">Add Listings</Link>
            <Link to="/dashboard/faqs" className="bg-blue-500/30 backdrop-blur-md text-white border border-blue-400/30 px-6 py-2 rounded-xl font-bold hover:bg-blue-500/40 transition-colors cursor-pointer">Train AI</Link>
          </div>
        </div>
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -left-20 -top-20 w-60 h-60 bg-indigo-400/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
