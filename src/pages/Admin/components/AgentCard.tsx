import { Building2, MessageSquare, Ban, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../../shared/utils/utils';

interface AgentCardProps {
  agent: any;
  stats: any;
  updatingId: string | null;
  onToggleBlock: (id: string, status: boolean) => void;
}

export function AgentCard({ agent, stats, updatingId, onToggleBlock }: AgentCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "bg-white dark:bg-gray-900 p-6 rounded-3xl border shadow-sm transition-all flex flex-col md:flex-row md:items-center justify-between gap-6",
        agent.isBlocked ? "border-red-100 dark:border-red-900/30 bg-red-50/30 dark:bg-red-900/5" : "border-gray-100 dark:border-gray-800"
      )}
    >
      <div className="flex items-center gap-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold",
          agent.isBlocked ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
        )}>
          {(agent.displayName || agent.email)[0].toUpperCase()}
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {agent.displayName || 'Anonymous Agent'}
            {agent.isBlocked && <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full uppercase tracking-wider">Blocked</span>}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{agent.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 flex-1">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-[10px] font-medium uppercase tracking-wider">
            <MessageSquare className="w-3 h-3" />
            Clients
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {stats?.conversations || 0}
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-[10px] font-medium uppercase tracking-wider">
            <Building2 className="w-3 h-3 text-blue-500" />
            For Sale
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {stats?.itemsForSale || 0}
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-[10px] font-medium uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            Sold
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {stats?.itemsSold || 0}
          </p>
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-[10px] font-medium uppercase tracking-wider">
            <Building2 className="w-3 h-3" />
            Total Listings
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">
            {stats?.properties || 0}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggleBlock(agent.id, !!agent.isBlocked)}
          disabled={updatingId === agent.id}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-50",
            agent.isBlocked
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
              : "bg-red-100 text-red-700 hover:bg-red-200"
          )}
        >
          {updatingId === agent.id ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : agent.isBlocked ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Ban className="w-4 h-4" />
          )}
          {agent.isBlocked ? 'Unblock Agent' : 'Block Agent'}
        </button>
      </div>
    </motion.div>
  );
}
