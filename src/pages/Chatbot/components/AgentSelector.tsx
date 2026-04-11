import { Building2, Sparkles } from 'lucide-react';
import { cn } from '../../../shared/utils/utils';

interface Agent {
  id: string;
  agencyName?: string;
  chatbotName?: string;
}

interface AgentSelectorProps {
  agents: Agent[];
  selectedAgent: string | null;
  onSelectAgent: (id: string) => void;
  urlAgentId: string | null;
}

export function AgentSelector({ agents, selectedAgent, onSelectAgent, urlAgentId }: AgentSelectorProps) {
  if (urlAgentId) return null;

  return (
    <div className="w-full md:w-64 flex flex-col gap-3">
      <div className="bg-white dark:bg-gray-900 p-3 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm transition-colors">
        <h2 className="text-[10px] font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          Select Agent
        </h2>
        <div className="space-y-1.5 max-h-40 md:max-h-none overflow-y-auto pr-1">
          {agents.map((agent) => (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent.id)}
              className={cn(
                "w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all border cursor-pointer",
                selectedAgent === agent.id
                  ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-sm"
                  : "bg-white dark:bg-gray-900 border-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
              )}
            >
              {agent.agencyName || "Unnamed Agent"}
              <div className="text-[9px] opacity-60 font-normal mt-0.5">
                AI: {agent.chatbotName}
              </div>
            </button>
          ))}
          {agents.length === 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 italic p-2">No active agents found.</p>
          )}
        </div>
      </div>

      <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-100 dark:shadow-none hidden md:block">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4" />
          <h3 className="font-bold text-sm">AI Powered</h3>
        </div>
        <p className="text-xs text-blue-100 leading-relaxed">
          Our AI is trained on real-time property data and agent FAQs to provide instant, accurate information.
        </p>
      </div>
    </div>
  );
}
