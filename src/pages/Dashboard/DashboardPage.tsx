import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { Building2, MessageSquare, Settings, LayoutDashboard } from 'lucide-react';
import { cn } from '../../shared/utils/utils';

import { Overview } from './components/Overview';
import { PropertyManager } from './components/PropertyManager';
import { FAQManager } from './components/FAQManager';
import { ConversationManager } from './components/ConversationManager';
import { SettingsManager } from './components/SettingsManager';

export function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;

  const tabs = [
    { name: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Properties', path: '/dashboard/properties', icon: Building2 },
    { name: 'FAQs', path: '/dashboard/faqs', icon: MessageSquare },
    { name: 'Conversations', path: '/dashboard/conversations', icon: MessageSquare },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 space-y-2">
        <div className="p-4 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm mb-6 transition-colors">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 px-2">Dashboard</h2>
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

