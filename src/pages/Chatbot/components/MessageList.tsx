import { User, Bot } from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from '../../../shared/utils/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  settings: any;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export function MessageList({ messages, isTyping, settings, scrollRef }: MessageListProps) {
  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 dark:bg-gray-950/50"
    >
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "flex gap-3 max-w-[85%]",
              msg.sender === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm overflow-hidden",
              msg.sender === 'user' ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-100 dark:border-gray-700"
            )}>
              {msg.sender === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                settings?.chatbotAvatarUrl ? (
                  <img 
                    src={settings.chatbotAvatarUrl} 
                    alt="AI" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Bot className="w-4 h-4" />
                )
              )}
            </div>
            <div className={cn(
              "p-4 rounded-2xl shadow-sm text-sm leading-relaxed",
              msg.sender === 'user' 
                ? "bg-blue-600 text-white rounded-tr-none" 
                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none"
            )}>
              <div className={cn(
                "prose prose-sm max-w-none prose-headings:text-inherit prose-p:leading-relaxed prose-strong:text-inherit",
                msg.sender === 'user' ? "prose-invert" : "dark:prose-invert"
              )}>
                <Markdown>
                  {msg.text}
                </Markdown>
              </div>
              <div className={cn(
                "text-[10px] mt-2 opacity-70 flex items-center gap-2",
                msg.sender === 'user' ? "justify-end" : ""
              )}>
                <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.sender === 'user' && msg.status === 'sending' && (
                  <span className="italic animate-pulse">Sending...</span>
                )}
                {msg.sender === 'user' && msg.status === 'error' && (
                  <span className="text-red-200">Failed to send</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {isTyping && (
        <div className="flex gap-3 max-w-[85%]">
          <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-sm overflow-hidden">
            {settings?.chatbotAvatarUrl ? (
              <img 
                src={settings.chatbotAvatarUrl} 
                alt="AI" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Bot className="w-4 h-4" />
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm flex gap-1 items-center">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
          </div>
        </div>
      )}
    </div>
  );
}
