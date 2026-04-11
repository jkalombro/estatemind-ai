import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { auth, signInWithPopup, googleProvider } from '../../firebase';
import { Building2, MessageSquare, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, LogIn, LayoutDashboard, Bot, Home as HomeIcon, Zap, Heart } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../shared/utils/utils';

export function Home() {
  const { user, setAuthAction } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setAuthAction('login');
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (error) {
      console.error("Login failed:", error);
      setAuthAction(null);
    }
  };

  const features = [
    {
      title: "Friendly AI Sidekick",
      description: "Your bot handles late-night chats and routine questions with a smile (and perfect accuracy).",
      icon: Bot,
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
    },
    {
      title: "Smart House Manager",
      description: "Keep your listings organized and let your bot show them off to potential buyers instantly.",
      icon: HomeIcon,
      color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
    },
    {
      title: "Always-On Support",
      description: "While you're closing deals or sleeping, your bot is busy making sure no lead goes cold.",
      icon: Zap,
      color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
    }
  ];

  return (
    <div className="space-y-32 pb-24 overflow-hidden">
      {/* Hero Section - Playful & Professional */}
      <section className="relative pt-16 lg:pt-24">
        <div className="max-w-5xl mx-auto text-center space-y-10 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-sm font-bold border-2 border-blue-100 dark:border-blue-800/50"
          >
            <Sparkles className="w-4 h-4" />
            <span>Meet your new AI Sidekick!</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white leading-tight tracking-tight"
          >
            Real Estate Magic <br />
            <span className="text-blue-600 dark:text-blue-500 relative">
              Powered by AI
              <motion.div 
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -right-12 -top-4 hidden md:block"
              >
                <Bot className="w-12 h-12 text-amber-400" />
              </motion.div>
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto font-medium"
          >
            EstateMind AI is the friendly robot assistant that helps real estate agents manage listings and chat with clients 24/7.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link
              to="/chatbot"
              className="px-10 py-5 bg-blue-600 text-white rounded-[2rem] font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 dark:shadow-none flex items-center gap-3 group active:scale-95"
            >
              Chat with the Bot
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            {user ? (
              <Link
                to="/dashboard"
                className="px-10 py-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-4 border-gray-100 dark:border-gray-800 rounded-[2rem] font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-3 active:scale-95"
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
            ) : (
              <button
                onClick={handleLogin}
                className="px-10 py-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-4 border-gray-100 dark:border-gray-800 rounded-[2rem] font-bold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-3 cursor-pointer active:scale-95"
              >
                <LogIn className="w-5 h-5" />
                Agent Portal
              </button>
            )}
          </motion.div>
        </div>

        {/* Floating Illustrations Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <motion.div 
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-[10%] opacity-20 dark:opacity-10"
          >
            <HomeIcon className="w-24 h-24 text-blue-600" />
          </motion.div>
          <motion.div 
            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-20 right-[15%] opacity-20 dark:opacity-10"
          >
            <Bot className="w-32 h-32 text-emerald-500" />
          </motion.div>
          <motion.div 
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-40 right-[10%] opacity-10 dark:opacity-5"
          >
            <Sparkles className="w-16 h-16 text-amber-400" />
          </motion.div>
        </div>
      </section>

      {/* Feature Cards - Bento Style */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] border-4 border-gray-50 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group"
          >
            <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform", feature.color)}>
              <feature.icon className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">{feature.description}</p>
          </motion.div>
        ))}
      </section>

      {/* Helpful Bot Section */}
      <section className="bg-blue-600 dark:bg-blue-700 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <h2 className="text-4xl md:text-6xl font-black leading-tight">
              Your Bot never takes <br /> a day off! 🤖
            </h2>
            <p className="text-xl text-blue-100 font-medium leading-relaxed">
              While you're out showing houses or enjoying dinner, your helpful bot is busy answering questions, qualifying leads, and keeping your business running smoothly.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[
                "Instant Property Info",
                "24/7 Customer Support",
                "Lead Qualification",
                "Custom FAQ Training"
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <span className="font-bold">{item}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="w-full lg:w-[400px] flex-shrink-0">
            <motion.div 
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-2xl border-8 border-blue-500/30 relative"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900 dark:text-white">EstateMind Bot</p>
                  <p className="text-xs font-bold text-emerald-500">Online & Helpful</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none text-sm font-medium text-gray-700 dark:text-gray-300">
                  "Hi there! I can tell you all about the Modern Villa on 5th Ave. Would you like to see photos?"
                </div>
                <div className="bg-blue-600 p-4 rounded-2xl rounded-tr-none text-sm font-bold text-white ml-8">
                  "Yes please! Does it have a pool?"
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-2xl rounded-tl-none text-sm font-medium text-gray-700 dark:text-gray-300">
                  "It sure does! A beautiful infinity pool with a view. 🏊‍♂️"
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="text-center space-y-10 py-12">
        <div className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest text-sm">
          <Heart className="w-4 h-4 fill-current" />
          <span>Made for Agents</span>
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white">Ready to meet your bot?</h2>
        <div className="flex justify-center">
          <button
            onClick={handleLogin}
            className="px-12 py-6 bg-blue-600 text-white rounded-[2.5rem] font-black text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-200 dark:shadow-none hover:scale-105 active:scale-95 cursor-pointer"
          >
            Get Started for Free
          </button>
        </div>
      </section>
    </div>
  );
}
