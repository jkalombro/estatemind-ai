import { Bot, Info } from 'lucide-react';

interface ChatHeaderProps {
  settings: any;
}

export function ChatHeader({ settings }: ChatHeaderProps) {
  return (
    <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden">
          {settings?.chatbotAvatarUrl ? (
            <img 
              src={settings.chatbotAvatarUrl} 
              alt="AI Avatar" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <Bot className="w-6 h-6" />
          )}
        </div>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white">{settings?.chatbotName || "EstateMind AI"}</h2>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Online & Ready</span>
          </div>
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
        <Info className="w-4 h-4" />
        Powered by Gemini
      </div>
    </div>
  );
}
