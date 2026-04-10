import { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { ShieldAlert, Users, Search, Loader2 } from 'lucide-react';
import { db, collection, query, where, onSnapshot, updateDoc, doc, getDocs } from '../../firebase';
import { AnimatePresence } from 'motion/react';

import { AgentCard } from './components/AgentCard';

interface AgentStats {
  properties: number;
  conversations: number;
  itemsForSale: number;
  itemsSold: number;
}

export function Admin() {
  const { user, isAdmin } = useAuth();
  const [agents, setAgents] = useState<any[]>([]);
  const [stats, setStats] = useState<Record<string, AgentStats>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;

    // Fetch agents
    const agentsQuery = query(collection(db, 'users'), where('role', '==', 'agent'));
    const unsubscribeAgents = onSnapshot(agentsQuery, (snapshot) => {
      setAgents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    // Fetch all properties and conversations to calculate stats for all agents
    const fetchStats = async () => {
      const propertiesSnap = await getDocs(collection(db, 'properties'));
      const conversationsSnap = await getDocs(collection(db, 'conversations'));

      const newStats: Record<string, AgentStats> = {};

      propertiesSnap.docs.forEach(doc => {
        const data = doc.data();
        const agentId = data.agentId;
        if (agentId) {
          const current = newStats[agentId] || { properties: 0, conversations: 0, itemsForSale: 0, itemsSold: 0 };
          newStats[agentId] = {
            ...current,
            properties: current.properties + 1,
            itemsForSale: current.itemsForSale + (data.status === 'for-sale' ? 1 : 0),
            itemsSold: current.itemsSold + (data.status === 'sold' ? 1 : 0)
          };
        }
      });

      conversationsSnap.docs.forEach(doc => {
        const agentId = doc.data().agentId;
        if (agentId) {
          const current = newStats[agentId] || { properties: 0, conversations: 0, itemsForSale: 0, itemsSold: 0 };
          newStats[agentId] = {
            ...current,
            conversations: current.conversations + 1
          };
        }
      });

      setStats(newStats);
    };

    fetchStats();

    return () => {
      unsubscribeAgents();
    };
  }, [isAdmin]);

  const toggleBlock = async (agentId: string, currentStatus: boolean) => {
    setUpdatingId(agentId);
    try {
      await updateDoc(doc(db, 'users', agentId), {
        isBlocked: !currentStatus
      });
    } catch (error) {
      console.error("Error updating agent status:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
        <div className="bg-red-100 dark:bg-red-900/20 p-4 rounded-full">
          <ShieldAlert className="w-12 h-12 text-red-600 dark:text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access Denied</h1>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          You do not have permission to access the administrative panel.
        </p>
      </div>
    );
  }

  const filteredAgents = agents.filter(agent => 
    agent.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (agent.displayName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-blue-600" />
            Agent Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Monitor and manage real estate agents on the platform.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 transition-all"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredAgents.map((agent) => (
              <AgentCard 
                key={agent.id}
                agent={agent}
                stats={stats[agent.id]}
                updatingId={updatingId}
                onToggleBlock={toggleBlock}
              />
            ))}
          </AnimatePresence>

          {filteredAgents.length === 0 && (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
              <Users className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No agents found matching your search.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

