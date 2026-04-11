import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { Building2, MessageSquare, Settings, LayoutDashboard, Menu, X } from 'lucide-react';
import { cn } from '../../shared/utils/utils';
import { motion, AnimatePresence } from 'motion/react';

import { Overview } from './components/Overview';
import { PropertyManager } from './components/PropertyManager';
import { FAQManager } from './components/FAQManager';
import { ConversationManager } from './components/ConversationManager';
import { SettingsManager } from './components/SettingsManager';

export function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  const tabs = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Properties', path: '/dashboard/properties', icon: Building2 },
    { name: 'FAQs', path: '/dashboard/faqs', icon: MessageSquare },
    { name: 'Conversations', path: '/dashboard/conversations', icon: MessageSquare },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 relative">
      {/* Mobile Floating Menu Button */}
      <div className="md:hidden fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-blue-700 active:scale-95 transition-all"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 p-6 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:inset-auto md:w-64 md:p-0 md:bg-transparent md:border-none",
        isMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="md:p-4 md:bg-white md:dark:bg-gray-900 md:rounded-xl md:border md:border-gray-100 md:dark:border-gray-800 md:shadow-sm mb-6 transition-colors h-full md:h-auto">
          <div className="flex items-center justify-between mb-8 md:mb-4 px-2">
            <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Dashboard</h2>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="md:hidden p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <Link
                key={tab.path}
                to={tab.path}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer",
                  location.pathname === tab.path
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-none"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/properties" element={<PropertyManager />} />
          <Route path="/faqs" element={<FAQManager />} />
          <Route path="/conversations" element={<ConversationManager />} />
          <Route path="/settings" element={<SettingsManager />} />
        </Routes>
      </div>
    </div>
  );
}

