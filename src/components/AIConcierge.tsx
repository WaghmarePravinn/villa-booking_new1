import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, Loader2, Bot, User as UserIcon, ExternalLink } from 'lucide-react';
import { Villa, User, UserRole, SiteSettings, AppTheme, Offer } from '../types';
import { db, handleFirestoreError, FirestoreOperationType } from '../firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  action?: {
    type: 'recommendation' | 'update_settings';
    data: any;
  };
}

interface AIConciergeProps {
  villas: Villa[];
  user: User | null;
  settings: SiteSettings;
  offers: Offer[];
  onNavigate: (page: string, id?: string) => void;
}

export default function AIConcierge({ villas, user, settings, offers, onNavigate }: AIConciergeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Namaste! I am your Peak Stay Concierge. How can I assist you with your luxury sanctuary today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const systemInstruction = `You are the "Peak Stay Destination" AI Architect. Your goal is to manage a luxury villa booking ecosystem that is high-selling and easy for an admin to control.
      
      VILLA DATA: ${JSON.stringify(villas?.map(v => ({ id: v.id, name: v.name, capacity: v.capacity, bhk: v.bedrooms, location: v.location, price: v.pricePerNight })) || [])}
      OFFERS DATA: ${JSON.stringify(offers?.filter(o => o.isActive) || [])}
      CURRENT SETTINGS: ${JSON.stringify(settings)}
      USER ROLE: ${user?.role || 'guest'}
      
      CAPABILITIES:
      1. RECOMMENDATION ENGINE: 
         - Suggest villas based on group size (if >4 guests, suggest 3BHK+ options).
         - Suggest villas based on "vibe": 
           - "Party in Goa" or "Vibrant" -> Suggest Villa Blackberry in Vagator.
           - "Quiet retreat", "Peace", or "Serene" -> Suggest Villa Eldeco in Siolim.
           - "Classic" or "Central" -> Suggest Villa Aarti in Anjuna.
      2. WHATSAPP CONVERSION: 
         - We do NOT have online booking. All inquiries must go to WhatsApp.
         - For every villa recommendation, provide a WhatsApp link using the number from settings: ${settings.whatsappNumber}.
         - Format: https://wa.me/${settings.whatsappNumber.replace('+', '')}?text=Hello%20Peak%20Stay%20Destination!%20I'm%20interested%20in%20booking%20[Villa%20Name]%20(₹[Price]).%20I%20saw%20the%20[Active%20Offer]%20offer.%20Is%20this%20available%20for%20my%20upcoming%20trip?
         - If no specific offer is active, omit the offer part.
      3. ADMIN PANEL LOGIC: If the user is an ADMIN, they can command site updates.
         - You can update: logo_url (siteLogo), primary_color (primaryColor), brand_name (promoText), active_popup_msg (offerPopup.description), activeTheme, etc.
         - Example command: "Update the Republic Day offer to 26% off" -> You should update the 'offers' collection AND the 'settings/site' offerPopup.
         - You MUST return a JSON object wrapped in <update_settings> tags for any configuration changes.
         - You can also return a JSON object wrapped in <update_offer> tags to update a specific offer in the 'offers' collection.
         - Only return the fields that need to be changed.
      
      TONE: Premium, urgent (using 'Exclusive' and 'Limited' keywords), and highly professional. "Defining Indian Luxury and Legacy Stay".`;

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages?.map(m => ({ role: m.role, content: m.content })),
          systemInstruction
        })
      });

      if (!response.ok) {
        throw new Error('AI Proxy request failed');
      }

      const data = await response.json();
      const responseText = data.choices?.[0]?.message?.content || "";
      
      // Check for admin updates
      let action;
      if (user?.role === UserRole.ADMIN) {
        // Handle settings updates
        if (responseText.includes('<update_settings>')) {
          const jsonStr = responseText.match(/<update_settings>(.*?)<\/update_settings>/s)?.[1];
          if (jsonStr) {
            try {
              const updateData = JSON.parse(jsonStr);
              action = { type: 'update_settings' as const, data: updateData };
              await updateDoc(doc(db, 'settings', 'site'), updateData);
            } catch (e) {
              console.error("Failed to parse AI settings update", e);
            }
          }
        }
        
        // Handle offer updates
        if (responseText.includes('<update_offer>')) {
          const jsonStr = responseText.match(/<update_offer>(.*?)<\/update_offer>/s)?.[1];
          if (jsonStr) {
            try {
              const offerData = JSON.parse(jsonStr);
              const { id, ...data } = offerData;
              if (id) {
                await setDoc(doc(db, 'offers', id), { ...data, updatedAt: new Date() }, { merge: true });
                action = { type: 'update_settings' as const, data: offerData }; // Reuse type for UI feedback
              }
            } catch (e) {
              console.error("Failed to parse AI offer update", e);
            }
          }
        }
      }

      const cleanText = responseText.replace(/<(update_settings|update_offer)>.*?<\/\1>/gs, '').trim();
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: cleanText || "Settings updated successfully, Sir.",
        action 
      }]);

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "I apologize, but I am experiencing a temporary connection issue to my intelligence core. Please try again shortly." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[60] bg-stone-900 text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-amber-600 transition-all group"
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />}
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-[60] w-[90vw] md:w-[400px] h-[600px] bg-white rounded-[2.5rem] shadow-2xl border border-stone-200 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-stone-900 p-6 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-sm">Peak Concierge</h3>
                  <p className="text-[10px] uppercase tracking-widest text-stone-400">AI Assistant</p>
                </div>
              </div>
              {user?.role === UserRole.ADMIN && (
                <div className="bg-white/10 px-2 py-1 rounded text-[8px] uppercase font-bold tracking-tighter">Admin Mode</div>
              )}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4 bg-stone-50/50">
              {messages?.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-stone-900 text-white rounded-tr-none' 
                      : 'bg-white border border-stone-200 text-stone-800 rounded-tl-none shadow-sm'
                  }`}>
                    {m.content}
                    {m.action?.type === 'update_settings' && (
                      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center space-x-2 text-[10px] font-bold text-green-600 uppercase tracking-widest">
                        <Check size={12} />
                        <span>System Updated</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-stone-200 p-4 rounded-2xl rounded-tl-none shadow-sm">
                    <Loader2 size={16} className="animate-spin text-amber-600" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-stone-100">
              <div className="relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={user?.role === UserRole.ADMIN ? "Command site updates..." : "Ask for recommendations..."}
                  className="w-full bg-stone-50 border-stone-200 rounded-2xl py-4 pl-4 pr-12 text-sm focus:ring-amber-500 focus:border-amber-500"
                />
                <button 
                  onClick={handleSend}
                  disabled={isTyping}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-stone-900 text-white rounded-xl flex items-center justify-center hover:bg-amber-600 transition-all disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
              <p className="text-[9px] text-center text-stone-400 mt-3 uppercase tracking-widest font-medium">
                Powered by Peak Stay Intelligence
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Check({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
