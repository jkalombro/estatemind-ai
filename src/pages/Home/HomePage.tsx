import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../App';
import { auth, signInWithPopup, googleProvider } from '../../firebase';
import { Building2, MessageSquare, ShieldCheck, ArrowRight, Sparkles, CheckCircle2, LogIn, LayoutDashboard } from 'lucide-react';
import { motion } from 'motion/react';

export function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const features = [
    {
      title: "AI Chatbot",
      description: "Automate responses to property inquiries and common questions 24/7.",
      icon: MessageSquare,
      color: "bg-blue-500"
    },
    {
      title: "Property Manager",
      description: "Easily manage your listings and keep your AI assistant updated.",
      icon: Building2,
      color: "bg-emerald-500"
    },
    {
      title: "FAQ Database",
      description: "Build a knowledge base for your agency to handle routine queries.",
      icon: ShieldCheck,
      color: "bg-purple-500"
    }
  ];

  return (
    <div className="space-y-24 pb-12">
      {/* Hero Section */}
      <section className="text-center space-y-8 pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium border border-blue-100 dark:border-blue-800">
            <Sparkles className="w-4 h-4" />
            <span>Next-Gen Real Estate AI</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Your Personal AI <br />
            <span className="text-blue-600 dark:text-blue-500">Real Estate Assistant</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            EstateMind AI helps agents manage listings and automate customer support with a powerful, customizable chatbot.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-wrap justify-center gap-4"
        >
          <Link
            to="/chatbot"
            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 group"
          >
            Try the Chatbot
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          {user ? (
            <Link
              to="/dashboard"
              className="px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-xl font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm flex items-center gap-2"
            >
              <LayoutDashboard className="w-5 h-5" />
              Go to Dashboard
            </Link>
          ) : (
            <button
              onClick={handleLogin}
              className="px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-800 rounded-xl font-semibold text-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <LogIn className="w-5 h-5" />
              Agent Login
            </button>
          )}
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 1), duration: 0.5 }}
            className="bg-white dark:bg-gray-900 p-8 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all group"
          >
            <div className={`${feature.color} w-12 h-12 rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform`}>
              <feature.icon className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
          </motion.div>
        ))}
      </section>

      {/* Social Proof / Trust */}
      <section className="bg-blue-600 dark:bg-blue-700 rounded-3xl p-12 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-blue-500 dark:bg-blue-600 rounded-full blur-3xl opacity-50"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-6 max-w-xl">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              Ready to automate your agency's communication?
            </h2>
            <ul className="space-y-3">
              {['24/7 Availability', 'Instant Property Details', 'Custom FAQ Training'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-blue-200" />
                  <span className="font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20">
              <p className="text-lg font-medium mb-4 italic">"EstateMind AI transformed how I handle late-night inquiries. My clients get answers instantly!"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-400"></div>
                <div>
                  <p className="font-bold">Sarah Jenkins</p>
                  <p className="text-sm text-blue-200">Top Producer, Metro Realty</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
