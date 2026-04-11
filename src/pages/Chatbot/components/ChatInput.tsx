import { Send } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (val: string) => void;
  onSend: (e: React.FormEvent) => void;
  disabled: boolean;
}

export function ChatInput({ input, setInput, onSend, disabled }: ChatInputProps) {
  return (
    <div className="p-3 sm:p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors">
      <form onSubmit={onSend} className="relative group">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about properties, pricing, or office hours..."
          className="w-full pl-4 pr-12 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-800 outline-none transition-all shadow-inner text-sm placeholder:overflow-hidden placeholder:text-ellipsis placeholder:whitespace-nowrap"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 dark:shadow-none active:scale-95 flex items-center justify-center cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
      <p className="text-[9px] text-center text-gray-400 dark:text-gray-500 mt-2">
        AI can make mistakes. Consider verifying important property details.
      </p>
    </div>
  );
}
