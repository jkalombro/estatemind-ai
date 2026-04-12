import { useState } from 'react';
import { User, Bot, X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from '../../../shared/utils/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'error';
}

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  settings: any;
  scrollRef: React.RefObject<HTMLDivElement | null>;
  properties: any[];
  onShowContactForm?: () => void;
}

export function MessageList({ messages, isTyping, settings, scrollRef, properties, onShowContactForm }: MessageListProps) {
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoom, setZoom] = useState(1);

  const openCarousel = (property: any) => {
    setSelectedProperty(property);
    setCurrentImageIndex(0);
    setZoom(1);
  };

  const closeCarousel = () => {
    setSelectedProperty(null);
    setZoom(1);
  };

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedProperty) return;
    setCurrentImageIndex((prev) => (prev + 1) % selectedProperty.images.length);
    setZoom(1);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!selectedProperty) return;
    setCurrentImageIndex((prev) => (prev - 1 + selectedProperty.images.length) % selectedProperty.images.length);
    setZoom(1);
  };

  return (
    <div 
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-950/50"
    >
      <AnimatePresence initial={false}>
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className={cn(
              "flex gap-2.5 max-w-[90%] sm:max-w-[85%]",
              msg.sender === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            <div className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm overflow-hidden",
              msg.sender === 'user' ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-100 dark:border-gray-700"
            )}>
              {msg.sender === 'user' ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                settings?.chatbotAvatarUrl ? (
                  <img 
                    src={settings.chatbotAvatarUrl} 
                    alt="AI" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Bot className="w-3.5 h-3.5" />
                )
              )}
            </div>
            <div className={cn(
              "p-3 rounded-2xl shadow-sm text-sm leading-relaxed",
              msg.sender === 'user' 
                ? "bg-blue-600 text-white rounded-tr-none" 
                : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-tl-none"
            )}>
              <div className={cn(
                "prose prose-sm max-w-none prose-headings:text-inherit prose-p:leading-relaxed prose-strong:text-inherit prose-img:rounded-xl prose-img:shadow-md prose-img:my-2",
                msg.sender === 'user' ? "prose-invert" : "dark:prose-invert"
              )}>
                <Markdown
                  components={{
                    img: ({ node, alt, src, ...props }) => {
                      const property = properties.find(p => p.title === alt);
                      const moreCount = property?.images?.length > 1 ? property.images.length - 1 : 0;

                      return (
                        <div 
                          className="relative group cursor-pointer inline-block"
                          onClick={() => property && openCarousel(property)}
                        >
                          <img
                            {...props}
                            src={src}
                            alt={alt}
                            className="max-w-full h-auto rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm transition-transform group-hover:scale-[1.02]"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                          {moreCount > 0 && (
                            <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 flex items-center gap-2">
                                <Maximize2 className="w-4 h-4 text-white" />
                                <span className="text-white font-bold text-xs">+{moreCount} more</span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    },
                  }}
                >
                  {msg.text.replace('[SHOW_CONTACT_FORM]', '')}
                </Markdown>
              </div>
              
              {msg.text.includes('[SHOW_CONTACT_FORM]') && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() => onShowContactForm?.()}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-100 dark:shadow-none active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    Click here to provide your contact info
                  </button>
                </div>
              )}

              <div className={cn(
                "text-[10px] mt-1.5 opacity-70 flex items-center gap-2",
                msg.sender === 'user' ? "justify-end" : ""
              )}>
                <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                {msg.sender === 'user' && msg.status === 'sending' && (
                  <span className="italic animate-pulse">Sending...</span>
                )}
                {msg.sender === 'user' && msg.status === 'error' && (
                  <span className="text-red-200">Failed to send</span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Photo Carousel Modal */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col"
            onClick={closeCarousel}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6">
              <div className="text-white">
                <h3 className="font-bold text-lg">{selectedProperty.title}</h3>
                <p className="text-sm text-gray-400">{selectedProperty.location}</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-white/10 rounded-lg p-1 mr-4">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setZoom(z => Math.max(1, z - 0.5)); }}
                    className="p-2 hover:bg-white/10 rounded-md text-white transition-colors"
                  >
                    <ZoomOut className="w-5 h-5" />
                  </button>
                  <span className="text-white text-xs font-bold px-2 w-12 text-center">{Math.round(zoom * 100)}%</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setZoom(z => Math.min(3, z + 0.5)); }}
                    className="p-2 hover:bg-white/10 rounded-md text-white transition-colors"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </button>
                </div>
                <button 
                  onClick={closeCarousel}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Main View */}
            <div className="flex-1 relative flex items-center justify-center overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentImageIndex}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ 
                    opacity: 1, 
                    scale: zoom,
                    transition: { type: 'spring', damping: 25, stiffness: 200 }
                  }}
                  exit={{ opacity: 0, scale: 1.1 }}
                  className="relative w-full h-full flex items-center justify-center p-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img 
                    src={selectedProperty.images[currentImageIndex]} 
                    alt={`${selectedProperty.title} - ${currentImageIndex + 1}`}
                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              {selectedProperty.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-4 md:left-8 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all active:scale-90"
                  >
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-4 md:right-8 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-all active:scale-90"
                  >
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails / Counter */}
            <div className="p-6 flex flex-col items-center gap-4">
              <div className="text-white/60 text-sm font-medium">
                Image {currentImageIndex + 1} of {selectedProperty.images.length}
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 max-w-full px-4">
                {selectedProperty.images.map((img: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); setZoom(1); }}
                    className={cn(
                      "w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0",
                      idx === currentImageIndex ? "border-blue-500 scale-110" : "border-transparent opacity-50 hover:opacity-100"
                    )}
                  >
                    <img src={img} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {isTyping && (
        <div className="flex gap-2.5 max-w-[90%] sm:max-w-[85%]">
          <div className="w-7 h-7 rounded-full bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-100 dark:border-gray-700 flex items-center justify-center shadow-sm overflow-hidden">
            {settings?.chatbotAvatarUrl ? (
              <img 
                src={settings.chatbotAvatarUrl} 
                alt="AI" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Bot className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="bg-white dark:bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-100 dark:border-gray-700 shadow-sm flex gap-1 items-center">
            <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
            <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
            <span className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></span>
          </div>
        </div>
      )}
    </div>
  );
}
