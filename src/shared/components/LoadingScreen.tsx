import { motion, AnimatePresence } from 'motion/react';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  type: 'login' | 'logout';
}

export function LoadingScreen({ type }: LoadingScreenProps) {
  const isLogin = type === 'login';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-md transition-colors duration-300"
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="flex flex-col items-center text-center p-12 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 max-w-sm w-full mx-4"
      >
        <div className="relative mb-10">
          {/* Outer rotating ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="w-32 h-32 rounded-full border-2 border-dashed border-blue-200 dark:border-blue-800"
          />
          
          {/* Inner pulsing ring */}
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-2 rounded-full bg-blue-50 dark:bg-blue-900/20"
          />

          {/* Main spinner */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-500"
          />

          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ 
                y: [0, -4, 0],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              {isLogin ? (
                <LogIn className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              ) : (
                <LogOut className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              )}
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
            {isLogin ? 'Signing you in' : 'Signing you out'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
            {isLogin 
              ? 'Authenticating with Google and preparing your real estate dashboard...' 
              : 'Safely closing your session and returning to the home page...'}
          </p>
        </motion.div>

        {/* Progress dots */}
        <div className="flex gap-2 mt-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{ 
                duration: 1, 
                repeat: Infinity, 
                delay: i * 0.2 
              }}
              className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500"
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
