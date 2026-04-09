import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import { auth, onAuthStateChanged, User, signInWithPopup, googleProvider, signOut, db, doc, getDoc, setDoc, serverTimestamp } from './firebase';
import { Layout } from './Layout';
import { Admin } from './pages/Admin/AdminPage';
import { Dashboard } from './pages/Dashboard/DashboardPage';
import { Chatbot } from './pages/Chatbot/ChatbotPage';
import { Home } from './pages/Home/HomePage';
import { NotFound } from './pages/NotFound';
import { LogIn, LogOut, Home as HomeIcon, Settings, MessageSquare, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { ThemeProvider } from './shared/context/ThemeContext';

// Auth Context
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'agent' | 'admin';
  isBlocked?: boolean;
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  isBlocked: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, profile: null, loading: true, isAdmin: false, isBlocked: false });

export const useAuth = () => useContext(AuthContext);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [blockedError, setBlockedError] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch or create user profile
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          if (data.isBlocked) {
            setBlockedError(true);
            await signOut(auth);
            setUser(null);
            setProfile(null);
          } else {
            setProfile(data);
            setUser(firebaseUser);
            setBlockedError(false);
          }
        } else {
          // Create new profile
          const isSuperAdmin = firebaseUser.email === 'jkninja238@gmail.com';
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Anonymous',
            role: isSuperAdmin ? 'admin' : 'agent',
            isBlocked: false,
            createdAt: serverTimestamp()
          };
          await setDoc(userDocRef, newProfile);
          setProfile(newProfile);
          setUser(firebaseUser);
          setBlockedError(false);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (blockedError && !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 text-center">
        <div className="bg-red-100 dark:bg-red-900/20 p-6 rounded-full mb-6">
          <ShieldAlert className="w-16 h-16 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Account Blocked</h1>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
          Your account has been suspended by an administrator. Please contact support if you believe this is a mistake.
        </p>
        <button 
          onClick={() => setBlockedError(false)}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none cursor-pointer"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const isAdmin = profile?.role === 'admin' || user?.email === 'jkninja238@gmail.com';
  const isBlocked = !!profile?.isBlocked;

  return (
    <ThemeProvider>
      <AuthContext.Provider value={{ user, profile, loading, isAdmin, isBlocked }}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Home />} />
              <Route path="/dashboard/*" element={<Dashboard />} />
              <Route path="/admin/*" element={<Admin />} />
              <Route path="/chatbot" element={<Chatbot />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </Router>
      </AuthContext.Provider>
    </ThemeProvider>
  );
}
