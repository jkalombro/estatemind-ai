import { Bot, Info, Moon, Sun } from 'lucide-react';
import { useTheme } from '../../../shared/context/ThemeContext';

interface ChatHeaderProps {
  settings: any;
}

export function ChatHeader({ settings }: ChatHeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden">
          {settings?.chatbotAvatarUrl ? (
            <img 
              src={settings.chatbotAvatarUrl} 
              alt="AI Avatar" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <Bot className="w-5 h-5" />
          )}
        </div>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white text-sm sm:text-base">{settings?.chatbotName || "EstateMind AI"}</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 font-medium">Online & Ready</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-500">
          <Info className="w-3.5 h-3.5" />
          Powered by Gemini
        </div>
      </div>
    </div>
  );
}
