import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db, collection, getDocs, query, where, onSnapshot, doc, getDoc, addDoc, updateDoc } from '../../firebase';
import { generateChatResponse } from '../../shared/services/gemini';
import { Info, X, Loader2 } from 'lucide-react';
import { cn } from '../../shared/utils/utils';

import { AgentSelector } from './components/AgentSelector';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

export function Chatbot() {
  const [searchParams] = useSearchParams();
  const urlAgentId = searchParams.get('agentId');
  const isSharedChatbot = !!urlAgentId;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [agentName, setAgentName] = useState('the agent');
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [agentNotFound, setAgentNotFound] = useState(false);
  const [consecutiveFailures, setConsecutiveFailures] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactFormData, setContactFormData] = useState({ name: '', contact: '' });
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isProcessing = useRef(false);

  // Fetch all agents who have set up the app
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        // Fetch all settings to know who has configured their chatbot
        // We only fetch settings because users collection is protected (PII)
        const settingsQuery = query(collection(db, 'settings'));
        const settingsSnapshot = await getDocs(settingsQuery);
        
        const agentList = settingsSnapshot.docs.map(doc => {
          const settingsData = doc.data();
          return {
            id: doc.id,
            ...settingsData,
            displayName: settingsData.agentName || settingsData.agencyName || 'Unnamed Agent',
            photoURL: settingsData.agentPhoto || settingsData.chatbotAvatarUrl
          };
        });

        setAgents(agentList);
        
        // If agentId is in URL, prioritize it
        if (urlAgentId) {
          const exists = agentList.some(a => a.id === urlAgentId);
          if (exists) {
            setSelectedAgent(urlAgentId);
          } else {
            console.warn("Agent ID from URL not found in settings collection:", urlAgentId);
            setAgentNotFound(true);
            if (agentList.length > 0) setSelectedAgent(agentList[0].id);
          }
        } else if (agentList.length > 0) {
          setSelectedAgent(agentList[0].id);
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAgents();
  }, [urlAgentId]);

  // Fetch data for selected agent
  useEffect(() => {
    if (!selectedAgent) return;

    const fetchSettings = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'settings', selectedAgent));
        if (docSnap.exists()) {
          const data = docSnap.data();
          setSettings(data);
          setAgentName(data.agentName || data.agencyName || 'the agent');
          setMessages([{
            id: 'welcome',
            text: data.welcomeMessage || "Hello! How can I help you today?",
            sender: 'bot',
            timestamp: new Date()
          }]);
        } else {
          console.error("Agent settings not found for:", selectedAgent);
          setSettings(null);
        }
      } catch (error) {
        console.error("Error fetching agent settings:", error);
      }
    };

    const qProps = query(collection(db, 'properties'), where('agentId', '==', selectedAgent));
    const qFaqs = query(collection(db, 'faqs'), where('agentId', '==', selectedAgent));

    const unsubProps = onSnapshot(qProps, (snap) => setProperties(snap.docs.map(d => d.data())), (err) => console.error("Props error:", err));
    const unsubFaqs = onSnapshot(qFaqs, (snap) => setFaqs(snap.docs.map(d => d.data())), (err) => console.error("FAQs error:", err));

    fetchSettings();
    setConversationId(null);
    
    return () => {
      unsubProps();
      unsubFaqs();
    };
  }, [selectedAgent]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || !selectedAgent || isProcessing.current) return;

    isProcessing.current = true;
    const userText = input;
    const userMessageId = Date.now().toString();
    const userMessage: Message = {
      id: userMessageId,
      text: userText,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending'
    };

    // Update UI immediately
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    const currentConvId = conversationId;
    const currentMessages = messages;

    // Defer heavy work to next tick to ensure UI update is painted immediately
    setTimeout(async () => {
      let activeConvId = currentConvId;
      
      try {
        // Create new conversation session if it doesn't exist
        if (!activeConvId) {
          const newConv = await addDoc(collection(db, 'conversations'), {
            agentId: selectedAgent,
            clientName: '',
            contactInfo: '',
            lastMessage: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
          activeConvId = newConv.id;
          setConversationId(newConv.id);
        }

        // Save user message to Firestore
        await addDoc(collection(db, 'messages'), {
          conversationId: activeConvId,
          agentId: selectedAgent,
          text: userText,
          sender: 'user',
          createdAt: new Date().toISOString()
        });

        // Update local status to 'sent'
        setMessages(prev => prev.map(m => m.id === userMessageId ? { ...m, status: 'sent' } : m));

        // Simple heuristic to detect name/contact info
        if (userText.toLowerCase().includes('my name is') || userText.toLowerCase().includes('i am')) {
          const name = userText.split(/is|am/i)[1]?.trim().split(' ')[0];
          if (name) {
            await updateDoc(doc(db, 'conversations', activeConvId), {
              clientName: name,
              updatedAt: new Date().toISOString()
            });
          }
        }
        
        if (userText.includes('@') || /\d{10}/.test(userText)) {
          await updateDoc(doc(db, 'conversations', activeConvId), {
            contactInfo: userText,
            updatedAt: new Date().toISOString()
          });
        }

        // Calculate message count (only user messages)
        const userMessages = currentMessages.filter(m => m.sender === 'user');
        const userMessageCount = userMessages.length + 1;

        // Format history for Gemini
        const history = currentMessages.map(m => ({
          role: m.sender === 'user' ? 'user' as const : 'model' as const,
          parts: [{ text: m.text }]
        }));

        const response = await generateChatResponse(userText, properties, faqs, settings, agentName, userMessageCount, history);

        // Reset failures on success
        setConsecutiveFailures(0);

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: response,
          sender: 'bot',
          timestamp: new Date(),
          status: 'sent'
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        isProcessing.current = false;

        // Save bot message to Firestore
        await addDoc(collection(db, 'messages'), {
          conversationId: activeConvId,
          agentId: selectedAgent,
          text: response,
          sender: 'bot',
          createdAt: new Date().toISOString()
        });

        // Update conversation last message
        await updateDoc(doc(db, 'conversations', activeConvId), {
          lastMessage: response,
          updatedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error("Error processing message:", error);
        
        const newCount = consecutiveFailures + 1;
        setConsecutiveFailures(newCount);
        
        // Determine error message based on failure count
        let errorText = "I'm having trouble connecting to my brain. Can you try again in a few seconds? 😅";
        if (newCount >= 3) {
          errorText = "I still can't connect to my brain at the moment, but I'm trying my best. Sorry for being such a failure 😔";
        }
        
        const botErrorMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: errorText,
          sender: 'bot',
          timestamp: new Date(),
          status: 'sent'
        };

        setMessages(prevMsgs => [
          ...prevMsgs.map(m => m.id === userMessageId ? { ...m, status: 'sent' as const } : m),
          botErrorMessage
        ]);
        
        setIsTyping(false);
        isProcessing.current = false;
      }
    }, 0);
  };

  useEffect(() => {
    return () => {
      document.title = 'AI Real Estate Chatbot';
    };
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactFormData.name || !contactFormData.contact || !conversationId) return;

    setIsSubmittingContact(true);
    try {
      await updateDoc(doc(db, 'conversations', conversationId), {
        clientName: contactFormData.name,
        contactInfo: contactFormData.contact,
        updatedAt: new Date().toISOString()
      });
      
      // Add a system message or bot confirmation
      const botMessage: Message = {
        id: Date.now().toString(),
        text: `Thank you, ${contactFormData.name}! I've saved your contact information (${contactFormData.contact}). ${agentName} will get in touch with you soon.`,
        sender: 'bot',
        timestamp: new Date(),
        status: 'sent'
      };
      setMessages(prev => [...prev, botMessage]);
      
      // Save to Firestore
      await addDoc(collection(db, 'messages'), {
        conversationId,
        agentId: selectedAgent,
        text: botMessage.text,
        sender: 'bot',
        createdAt: new Date().toISOString()
      });

      setShowContactForm(false);
      setContactFormData({ name: '', contact: '' });
    } catch (error) {
      console.error("Error saving contact info:", error);
    } finally {
      setIsSubmittingContact(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn(
      "max-w-5xl mx-auto flex flex-col md:flex-row gap-4 md:gap-6",
      isSharedChatbot ? "h-screen md:h-[calc(100vh-12rem)]" : "h-[calc(100vh-12rem)]"
    )}>
      {agentNotFound && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-3 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Info className="w-5 h-5" />
          </div>
          <div className="text-sm">
            <p className="font-bold text-amber-900 dark:text-amber-200">Agent Not Found</p>
            <p className="text-amber-700 dark:text-amber-400">The requested agent link is invalid. Showing default agent instead.</p>
          </div>
          <button onClick={() => setAgentNotFound(false)} className="p-1 hover:bg-amber-100 dark:hover:bg-amber-800 rounded-lg transition-colors">
            <X className="w-4 h-4 text-amber-500" />
          </button>
        </div>
      )}
      {!isSharedChatbot && (
        <AgentSelector 
          agents={agents} 
          selectedAgent={selectedAgent} 
          onSelectAgent={setSelectedAgent} 
          urlAgentId={urlAgentId} 
        />
      )}

      {/* Chat Interface */}
      <div className={cn(
        "flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl flex flex-col overflow-hidden relative transition-colors",
        isSharedChatbot ? "rounded-none md:rounded-3xl border-none md:border" : "rounded-3xl"
      )}>
        <ChatHeader settings={settings} />
        <MessageList 
          messages={messages} 
          isTyping={isTyping} 
          settings={settings} 
          scrollRef={scrollRef} 
          properties={properties}
          onShowContactForm={() => setShowContactForm(true)}
        />
        <ChatInput 
          input={input} 
          setInput={setInput} 
          onSend={handleSend} 
          disabled={isTyping || !selectedAgent} 
        />
      </div>

      {/* Contact Form Modal */}
      <AnimatePresence>
        {showContactForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Provide Contact Info</h3>
                <button onClick={() => setShowContactForm(false)} className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleContactSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Full Name</label>
                  <input
                    required
                    type="text"
                    value={contactFormData.name}
                    onChange={(e) => setContactFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">Contact Info (Email or Mobile)</label>
                  <input
                    required
                    type="text"
                    value={contactFormData.contact}
                    onChange={(e) => setContactFormData(prev => ({ ...prev, contact: e.target.value }))}
                    placeholder="email@example.com or 09123456789"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmittingContact}
                  className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 dark:shadow-none disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmittingContact ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Submit Information'
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

