import { useState, useEffect } from 'react';
import { useAuth } from '../../../App';
import { MessageSquare, Trash2, X, Loader2 } from 'lucide-react';
import { db, collection, query, where, onSnapshot, deleteDoc, doc, getDocs } from '../../../firebase';
import { cn } from '../../../shared/utils/utils';
import { motion } from 'motion/react';
import { LoadingScreen } from './LoadingScreen';
import { handleFirestoreError, OperationType } from '../../../shared/utils/firestore';

export function ConversationManager() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedConv, setSelectedConv] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'conversations'), where('agentId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setConversations(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'conversations');
      setLoading(false);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!selectedConv || !user) {
      setMessages([]);
      return;
    }
    console.log("Fetching messages for conversation:", selectedConv.id);
    setLoadingMessages(true);
    const q = query(collection(db, 'messages'), where('agentId', '==', user.uid), where('conversationId', '==', selectedConv.id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log("Received messages snapshot:", snapshot.size);
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()));
      setLoadingMessages(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'messages');
      setLoadingMessages(false);
    });
    return unsubscribe;
  }, [selectedConv, user]);

  // Keep selectedConv in sync with conversations list
  useEffect(() => {
    if (selectedConv) {
      const current = conversations.find(c => c.id === selectedConv.id);
      if (current && current !== selectedConv) {
        setSelectedConv(current);
      }
    }
  }, [conversations, selectedConv]);

  const handleDelete = async (id: string) => {
    setIsDeleting(true);
    try {
      // Delete all messages in the conversation first
      const q = query(collection(db, 'messages'), where('agentId', '==', user.uid), where('conversationId', '==', id));
      const snapshot = await getDocs(q);
      const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, 'messages', d.id)));
      await Promise.all(deletePromises);
      
      // Delete the conversation document
      await deleteDoc(doc(db, 'conversations', id));
      
      if (selectedConv?.id === id) {
        setSelectedConv(null);
      }
      setDeletingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `conversations/${id}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Conversations</h1>
        <p className="text-gray-500 dark:text-gray-400">View and manage client interactions with your AI.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Conversations List */}
        <div className="lg:col-span-1 space-y-4">
          {conversations.map((conv, index) => (
            <div key={conv.id} className="relative group">
              <button
                onClick={() => setSelectedConv(conv)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl border transition-all pr-12 cursor-pointer",
                  selectedConv?.id === conv.id
                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 shadow-sm"
                    : "bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-gray-900 dark:text-white">
                    {conv.clientName || `Client #${conversations.length - index}`}
                  </h3>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 italic">
                  {conv.lastMessage || "No messages yet"}
                </p>
                {conv.contactInfo && (
                  <div className="mt-2 text-xs text-blue-600 dark:text-blue-400 font-medium truncate">
                    {conv.contactInfo}
                  </div>
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingId(conv.id);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {conversations.length === 0 && (
            <div className="py-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500 dark:text-gray-400">No conversations yet.</p>
            </div>
          )}
        </div>

        {/* Selected Conversation Detail */}
        <div className="lg:col-span-2">
          {selectedConv ? (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex flex-col h-[600px] transition-colors">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-gray-900 dark:text-white">
                    {selectedConv.clientName || "Unknown Client"}
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{selectedConv.contactInfo || "No contact info provided"}</p>
                </div>
                <button 
                  onClick={() => setSelectedConv(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 lg:hidden cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 dark:bg-gray-950/30">
                {loadingMessages ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "max-w-[80%] p-3 rounded-xl text-sm",
                        msg.sender === 'user'
                          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 ml-auto rounded-tr-none"
                          : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none"
                      )}
                    >
                      <div className="font-bold text-[10px] uppercase tracking-wider mb-1 opacity-50">
                        {msg.sender === 'user' ? 'Client' : 'AI Assistant'}
                      </div>
                      {msg.text}
                      <div className="text-[10px] mt-1 opacity-50 text-right">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 italic">
                    No messages in this conversation yet.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-[600px] flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700 transition-colors">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400">Select a conversation to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-xl border border-gray-200 dark:border-gray-800 relative overflow-hidden"
          >
            {isDeleting && (
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <p className="text-sm font-bold text-gray-900 dark:text-white">Deleting conversation...</p>
              </div>
            )}
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delete Conversation?</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
              This will permanently delete this conversation and all its messages. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeletingId(null)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deletingId)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-100 dark:shadow-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
