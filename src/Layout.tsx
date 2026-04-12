import { Link, useLocation, useNavigate } from 'react-router-dom';
import { auth, signInWithPopup, googleProvider, signOut } from './firebase';
import { useAuth } from './App';
import { LogIn, LogOut, Home, Settings, MessageSquare, Sun, Moon, LayoutDashboard } from 'lucide-react';
import { cn } from './shared/utils/utils';
import { useTheme } from './shared/context/ThemeContext';
import { APP_VERSION } from './constants';
import { LoadingScreen } from './shared/components/LoadingScreen';
import { AnimatePresence } from 'motion/react';

const LOGO_URL = "https://res.cloudinary.com/dydhpzure/image/upload/v1775986949/properties/Fxrvg4qbYsZhJU6oO3AugIN27IX2/clv3gexv5jn9snzqguag.png";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, authAction, setAuthAction } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setAuthAction('login');
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (error) {
      console.error("Login failed:", error);
      setAuthAction(null);
    }
  };

  const handleLogout = async () => {
    try {
      setAuthAction('logout');
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Logout failed:", error);
      setAuthAction(null);
    }
  };

  const navItems = [
    ...(user 
      ? [{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard }] 
      : [{ name: 'Home', path: '/', icon: Home }]
    ),
    { name: 'Chatbot', path: '/chatbot', icon: MessageSquare },
    ...(isAdmin ? [{ name: 'Admin', path: '/admin', icon: Settings }] : []),
  ];

  const isSharedChatbot = location.pathname === '/chatbot' && new URLSearchParams(location.search).has('agentId');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col transition-colors duration-300">
      <AnimatePresence>
        {authAction && <LoadingScreen type={authAction} />}
      </AnimatePresence>
      <header className={cn(
        "bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300",
        isSharedChatbot ? "hidden md:block" : "block"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <img 
                src={LOGO_URL} 
                alt="EstateMind AI" 
                className="w-10 h-10 rounded-lg object-contain" 
                referrerPolicy="no-referrer"
              />
              <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">EstateMind AI</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2",
                    location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path))
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  console.log('Toggling theme from:', theme);
                  toggleTheme();
                }}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </button>

              {user ? (
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex flex-col items-end">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.displayName}</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{user.email}</span>
                  </div>
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700"
                    referrerPolicy="no-referrer"
                  />
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                !isSharedChatbot && (
                  <button
                    onClick={handleLogin}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow-md active:scale-95"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="font-medium">Agent Login</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </header>

      <main className={cn(
        "flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8",
        isSharedChatbot ? "px-0 sm:px-6 py-0 sm:py-8" : ""
      )}>
        {children}
      </main>

      <footer className={cn(
        "bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-8 transition-colors duration-300",
        isSharedChatbot ? "hidden md:block" : "block"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © 2026 EstateMind AI. Empowering real estate agents with AI.
          </p>
          <p className="text-gray-400 dark:text-gray-600 text-[10px] mt-1 font-medium">
            {APP_VERSION}
          </p>
        </div>
      </footer>
    </div>
  );
}
