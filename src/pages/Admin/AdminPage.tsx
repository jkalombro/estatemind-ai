import { useState, useEffect } from 'react';
import { useAuth } from '../../App';
import { Link } from 'react-router-dom';
import { ShieldAlert, Users, Search, Loader2, MessageSquare, Building2 } from 'lucide-react';
import { db, collection, query, where, onSnapshot, updateDoc, doc, getDocs } from '../../firebase';
import { cn } from '../../shared/utils/utils';
import { motion, AnimatePresence } from 'motion/react';

import { AgentCard } from './components/AgentCard';

interface AgentStats {
  properties: number;
  conversations: number;
  clients: number;
  itemsForSale: number;
  itemsSold: number;
}

export function Admin() {
  const { user, isAdmin } = useAuth();
  const [agents, setAgents] = useState<any[]>([]);
  const [stats, setStats] = useState<Record<string, AgentStats>>({});
  const [globalStats, setGlobalStats] = useState({
    totalConversations: 0,
    totalClients: 0,
    itemsForSale: 0,
    totalSold: 0
  });
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
      let gConvs = 0;
      let gClients = 0;
      let gForSale = 0;
      let gSold = 0;

      propertiesSnap.docs.forEach(doc => {
        const data = doc.data();
        const agentId = data.agentId;
        const isSold = data.status === 'Sold';
        const isForSale = data.status === 'For Sale' || !data.status;
        
        if (isSold) gSold++;
        if (isForSale) gForSale++;

        if (agentId) {
          const current = newStats[agentId] || { properties: 0, conversations: 0, clients: 0, itemsForSale: 0, itemsSold: 0 };
          newStats[agentId] = {
            ...current,
            properties: current.properties + 1,
            itemsForSale: current.itemsForSale + (isForSale ? 1 : 0),
            itemsSold: current.itemsSold + (isSold ? 1 : 0)
          };
        }
      });

      conversationsSnap.docs.forEach(doc => {
        const data = doc.data();
        const agentId = data.agentId;
        const isClient = data.clientName || data.contactInfo;
        
        gConvs++;
        if (isClient) gClients++;

        if (agentId) {
          const current = newStats[agentId] || { properties: 0, conversations: 0, clients: 0, itemsForSale: 0, itemsSold: 0 };
          newStats[agentId] = {
            ...current,
            conversations: current.conversations + 1,
            clients: current.clients + (isClient ? 1 : 0)
          };
        }
      });

      setStats(newStats);
      setGlobalStats({
        totalConversations: gConvs,
        totalClients: gClients,
        itemsForSale: gForSale,
        totalSold: gSold
      });
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

      {/* Global Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Conversations', value: globalStats.totalConversations, icon: MessageSquare, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20', path: '/dashboard/conversations' },
          { title: 'Clients', value: globalStats.totalClients, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20', path: '/dashboard/clients' },
          { title: 'Items for Sale', value: globalStats.itemsForSale, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', path: '/dashboard/properties' },
          { title: 'Total Sold', value: globalStats.totalSold, icon: Building2, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', path: '/dashboard/properties' },
        ].map((card, i) => (
          <Link key={card.title} to={card.path}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-gray-900 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:border-blue-200 dark:hover:border-blue-800 transition-all group h-full"
            >
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-transform group-hover:scale-110", card.bg)}>
                <card.icon className={cn("w-5 h-5", card.color)} />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{card.title}</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{card.value}</p>
              </div>
            </motion.div>
          </Link>
        ))}
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

