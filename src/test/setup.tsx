import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

// Mock Firebase
vi.mock('../firebase', () => ({
  auth: { currentUser: null },
  db: {},
  googleProvider: {},
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChanged: vi.fn(),
  collection: vi.fn().mockReturnValue('mock-collection-ref'),
  doc: vi.fn().mockReturnValue('mock-doc-ref'),
  setDoc: vi.fn(),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  onSnapshot: vi.fn(),
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  deleteDoc: vi.fn(),
  serverTimestamp: vi.fn(() => new Date()),
  getDocFromServer: vi.fn(),
}));

// Mock motion/react — strip animation props so plain divs render
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, initial, animate, exit, transition, layout, ...rest }: any) =>
      React.createElement('div', rest, children),
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock react-markdown — render children as plain text
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) =>
    React.createElement('div', null, children),
}));

// Mock lucide-react — every named icon export becomes a simple <svg>
const Icon = ({ className, ...props }: any) =>
  React.createElement('svg', { className, ...props });

vi.mock('lucide-react', () => ({
  LogIn: Icon,
  LogOut: Icon,
  Home: Icon,
  Settings: Icon,
  MessageSquare: Icon,
  Building2: Icon,
  Sun: Icon,
  Moon: Icon,
  LayoutDashboard: Icon,
  ArrowRight: Icon,
  Sparkles: Icon,
  CheckCircle2: Icon,
  ShieldCheck: Icon,
  ShieldAlert: Icon,
  Plus: Icon,
  Trash2: Icon,
  Edit: Icon,
  Save: Icon,
  X: Icon,
  Search: Icon,
  Copy: Icon,
  Check: Icon,
  ExternalLink: Icon,
  Bot: Icon,
  Info: Icon,
  Send: Icon,
  User: Icon,
  Ban: Icon,
  Loader2: Icon,
  AlertTriangle: Icon,
  AlertCircle: Icon,
  Users: Icon,
}));

// Mock @google/genai
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(function () {
    return {
      models: {
        generateContent: vi.fn().mockResolvedValue({ text: 'Mocked AI response' }),
      },
    };
  }),
}));
