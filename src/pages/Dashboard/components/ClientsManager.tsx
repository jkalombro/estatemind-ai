import { useState, useEffect } from 'react';
import { useAuth } from '../../../App';
import { Users, Search, MessageSquare, X, Loader2, Calendar, User as UserIcon, Phone, Mail, Trash2, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { db, collection, query, where, onSnapshot, doc, getDocs, deleteDoc, writeBatch } from '../../../firebase';
import { cn } from '../../../shared/utils/utils';
import { motion, AnimatePresence } from 'motion/react';
import { LoadingScreen } from './LoadingScreen';
import { handleFirestoreError, OperationType } from '../../../shared/utils/firestore';

export function ClientsManager() {
  const { user } = useAuth();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    // We fetch conversations where clientName and contactInfo exist
    const q = query(
      collection(db, 'conversations'), 
      where('agentId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allConvs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Filter for "clients" (those who provided info)
      const clientList = allConvs.filter((c: any) => c.clientName || c.contactInfo);
      
      // Default sort by datetime added (createdAt)
      clientList.sort((a: any, b: any) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      setClients(clientList);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'conversations');
      setLoading(false);
    });
    
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!selectedConvId || !user) {
      setMessages([]);
      return;
    }
    
    setLoadingMessages(true);
    const q = query(
      collection(db, 'messages'), 
      where('agentId', '==', user.uid), 
      where('conversationId', '==', selectedConvId)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      setLoadingMessages(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'messages');
      setLoadingMessages(false);
    });
    
    return unsubscribe;
  }, [selectedConvId, user]);

  const handleDeleteClient = async () => {
    if (!deletingClientId || !user) return;
    
    setIsDeleting(true);
    try {
      // 1. Delete all messages for this conversation
      const messagesQuery = query(
        collection(db, 'messages'),
        where('conversationId', '==', deletingClientId)
      );
      const messagesSnapshot = await getDocs(messagesQuery);
      
      const batch = writeBatch(db);
      messagesSnapshot.docs.forEach((msgDoc) => {
        batch.delete(msgDoc.ref);
      });
      
      // 2. Delete the conversation document
      batch.delete(doc(db, 'conversations', deletingClientId));
      
      await batch.commit();
      setDeletingClientId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'conversations');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredClients = clients.filter(client => 
    (client.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (client.contactInfo || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage your leads and their AI chat history.</p>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or contact..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none w-full md:w-64 transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Contact Info</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date Added</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-gray-900 dark:text-white">{client.clientName || 'Anonymous'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
                      {client.contactInfo?.includes('@') ? <Mail className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
                      {client.contactInfo || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
                      <Calendar className="w-3.5 h-3.5" />
                      {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedConvId(client.id);
                          setSelectedClient(client);
                        }}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-all cursor-pointer"
                        title="View Conversation"
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setDeletingClientId(client.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all cursor-pointer"
                        title="Delete Client"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Users className="w-12 h-12 opacity-20" />
                      <p>No clients found.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversation Modal */}
      <AnimatePresence>
        {selectedConvId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-2xl flex flex-col h-[80vh] overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-white dark:bg-gray-900 sticky top-0 z-10">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedClient?.clientName || "Client Conversation"}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedClient?.contactInfo || "No contact info"}</p>
                </div>
                <button 
                  onClick={() => {
                    setSelectedConvId(null);
                    setSelectedClient(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30 dark:bg-gray-950/30">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "max-w-[85%] p-4 rounded-2xl text-sm shadow-sm",
                        msg.sender === 'user'
                          ? "bg-blue-600 text-white ml-auto rounded-tr-none"
                          : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none"
                      )}
                    >
                      <div className={cn(
                        "font-black text-[10px] uppercase tracking-widest mb-2 opacity-60",
                        msg.sender === 'user' ? "text-blue-100" : "text-blue-600 dark:text-blue-400"
                      )}>
                        {msg.sender === 'user' ? 'Client' : 'AI Assistant'}
                      </div>
                      <div className={cn(
                        "prose prose-sm max-w-none prose-p:leading-relaxed prose-strong:font-bold",
                        msg.sender === 'user' ? "prose-invert" : "dark:prose-invert"
                      )}>
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                      <div className="text-[10px] mt-2 opacity-50 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 italic">
                    No messages found.
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deletingClientId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md overflow-hidden"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Client?</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8">
                  This will permanently delete the client's information and their entire conversation history. This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeletingClientId(null)}
                    disabled={isDeleting}
                    className="flex-1 px-6 py-3 rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteClient}
                    disabled={isDeleting}
                    className="flex-1 px-6 py-3 rounded-xl font-bold bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200 dark:shadow-none transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      'Delete'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
