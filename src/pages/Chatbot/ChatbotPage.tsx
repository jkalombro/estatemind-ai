import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { db, collection, getDocs, query, where, onSnapshot, doc, getDoc, addDoc, updateDoc } from '../../firebase';
import { generateChatResponse } from '../../shared/services/gemini';
import { Info, X } from 'lucide-react';

import { AgentSelector } from './components/AgentSelector';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { ChatInput } from './components/ChatInput';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function Chatbot() {
  const [searchParams] = useSearchParams();
  const urlAgentId = searchParams.get('agentId');
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [faqs, setFaqs] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [agentNotFound, setAgentNotFound] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch all agents who have set up the app
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const q = query(collection(db, 'settings'));
        const snapshot = await getDocs(q);
        const agentList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || !selectedAgent) return;

    let currentConvId = conversationId;

    // Create new conversation session if it doesn't exist
    if (!currentConvId) {
      try {
        const newConv = await addDoc(collection(db, 'conversations'), {
          agentId: selectedAgent,
          clientName: '',
          contactInfo: '',
          lastMessage: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        currentConvId = newConv.id;
        setConversationId(newConv.id);
      } catch (error) {
        console.error("Error creating conversation:", error);
        return;
      }
    }

    const userText = input;
    const userMessage: Message = {
      id: Date.now().toString(),
      text: userText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Save user message to Firestore
    await addDoc(collection(db, 'messages'), {
      conversationId: currentConvId,
      agentId: selectedAgent,
      text: userText,
      sender: 'user',
      createdAt: new Date().toISOString()
    });

    // Simple heuristic to detect name/contact info
    if (userText.toLowerCase().includes('my name is') || userText.toLowerCase().includes('i am')) {
      const name = userText.split(/is|am/i)[1]?.trim().split(' ')[0];
      if (name) {
        await updateDoc(doc(db, 'conversations', currentConvId), {
          clientName: name,
          updatedAt: new Date().toISOString()
        });
      }
    }
    
    if (userText.includes('@') || /\d{10}/.test(userText)) {
      await updateDoc(doc(db, 'conversations', currentConvId), {
        contactInfo: userText,
        updatedAt: new Date().toISOString()
      });
    }

    const response = await generateChatResponse(userText, properties, faqs, settings);

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: response,
      sender: 'bot',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);

    // Save bot message to Firestore
    await addDoc(collection(db, 'messages'), {
      conversationId: currentConvId,
      agentId: selectedAgent,
      text: response,
      sender: 'bot',
      createdAt: new Date().toISOString()
    });

    // Update conversation last message
    await updateDoc(doc(db, 'conversations', currentConvId), {
      lastMessage: response,
      updatedAt: new Date().toISOString()
    });
  };

  useEffect(() => {
    if (settings?.agencyName) {
      document.title = `${settings.agencyName} - Chatbot`;
    }
    return () => {
      document.title = 'AI Real Estate Chatbot';
    };
  }, [settings]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <div className="w-12 h-12 border-4 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-12rem)] flex flex-col md:flex-row gap-6">
      {agentNotFound && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 p-3 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Info className="w-5 h-5" />
          </div>
          <div className="text-sm">
            <p className="font-bold text-amber-900 dark:text-amber-200">Agency Not Found</p>
            <p className="text-amber-700 dark:text-amber-400">The requested agency link is invalid. Showing default agency instead.</p>
          </div>
          <button onClick={() => setAgentNotFound(false)} className="p-1 hover:bg-amber-100 dark:hover:bg-amber-800 rounded-lg transition-colors">
            <X className="w-4 h-4 text-amber-500" />
          </button>
        </div>
      )}
      <AgentSelector 
        agents={agents} 
        selectedAgent={selectedAgent} 
        onSelectAgent={setSelectedAgent} 
        urlAgentId={urlAgentId} 
      />

      {/* Chat Interface */}
      <div className="flex-1 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl flex flex-col overflow-hidden relative transition-colors">
        <ChatHeader settings={settings} />
        <MessageList 
          messages={messages} 
          isTyping={isTyping} 
          settings={settings} 
          scrollRef={scrollRef} 
        />
        <ChatInput 
          input={input} 
          setInput={setInput} 
          onSend={handleSend} 
          disabled={isTyping || !selectedAgent} 
        />
      </div>
    </div>
  );
}

