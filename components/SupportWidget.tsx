
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Home, Send, HelpCircle, Search, ChevronRight, ArrowLeft, Loader2, Crown } from 'lucide-react';
import { SiteConfig } from '../types';
import { generateAIResponse } from '../services/aiService';
import { sendTelegramMessage } from '../services/telegramService';

interface SupportWidgetProps {
    config: SiteConfig;
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

type Tab = 'home' | 'messages' | 'support' | 'search_results' | 'faq_detail';

interface ChatMessage {
    text: string;
    isUser: boolean;
    timestamp: number;
}

const SupportWidget: React.FC<SupportWidgetProps> = ({ config, isOpen, onOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState<Tab>('home');
    const [searchQuery, setSearchQuery] = useState('');
    
    // Initialize with a welcome message
    const [messages, setMessages] = useState<ChatMessage[]>([
        { text: "Hello! How can I assist you today?", isUser: false, timestamp: Date.now() }
    ]);
    
    const [inputText, setInputText] = useState('');
    const [isBotTyping, setIsBotTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [selectedFAQ, setSelectedFAQ] = useState<any>(null);

    // Support Form State (3rd Tab)
    const [supportName, setSupportName] = useState('');
    const [supportMsg, setSupportMsg] = useState('');
    const [supportSending, setSupportSending] = useState(false);
    const [supportSuccess, setSupportSuccess] = useState(false);

    // Scroll to bottom of chat
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, activeTab]);

    // MESSAGE EXPIRY LOGIC (5 Hours)
    // Check every minute to prune old messages
    useEffect(() => {
        const interval = setInterval(() => {
            const now = Date.now();
            const fiveHoursMs = 5 * 60 * 60 * 1000;
            
            setMessages(prevMsgs => {
                // Keep messages that are NEWER than 5 hours
                const validMsgs = prevMsgs.filter(msg => (now - msg.timestamp) < fiveHoursMs);
                
                // If filtered length is different, update state. Otherwise keep ref.
                if (validMsgs.length !== prevMsgs.length) {
                    return validMsgs.length > 0 ? validMsgs : [{ text: "Chat history cleared due to expiry.", isUser: false, timestamp: Date.now() }];
                }
                return prevMsgs;
            });
        }, 60000); // Run every 60 seconds

        return () => clearInterval(interval);
    }, []);

    // Filtering Logic
    const filteredFAQs = (config.faqs || []).filter(faq => 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const featuredFAQs = (config.faqs || []).filter(faq => faq.isFeatured).slice(0, 5);

    // Chatbot Logic
    const handleSendMessage = async () => {
        if (!inputText.trim()) return;
        
        const userMsg = inputText;
        setMessages(prev => [...prev, { text: userMsg, isUser: true, timestamp: Date.now() }]);
        setInputText('');
        setIsBotTyping(true);

        if (config.aiConfig && config.aiConfig.enabled) {
            // Use LLM Service
            const reply = await generateAIResponse(userMsg, config.aiConfig, config.faqs || []);
            setMessages(prev => [...prev, { text: reply, isUser: false, timestamp: Date.now() }]);
        } else if (config.chatbotWebhookUrl && config.chatbotWebhookUrl.startsWith('http')) {
            // Fallback to legacy webhook
            try {
                const res = await fetch(config.chatbotWebhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: userMsg })
                });
                const data = await res.json().catch(() => ({}));
                const reply = data.reply || data.message || "I have received your message. Our team will get back to you shortly.";
                setMessages(prev => [...prev, { text: reply, isUser: false, timestamp: Date.now() }]);
            } catch (e) {
                setMessages(prev => [...prev, { text: "Sorry, I'm having trouble connecting to the server right now.", isUser: false, timestamp: Date.now() }]);
            }
        } else {
            // Static Response
            setTimeout(() => {
                setMessages(prev => [...prev, { text: "I'm a demo bot. Please configure the AI Assistant in the Admin Panel!", isUser: false, timestamp: Date.now() }]);
            }, 1000);
        }
        setIsBotTyping(false);
    };

    const handleSendSupportTicket = async () => {
        if (!supportName || !supportMsg) return;
        setSupportSending(true);

        if (config.supportContact?.method === 'telegram') {
            await sendTelegramMessage({
                botToken: config.supportContact.botToken,
                chatId: config.supportContact.chatId
            }, `🎫 SUPPORT TICKET\n👤 Name: ${supportName}\n💬 Message: ${supportMsg}`);
        } else if (config.supportContact?.method === 'webhook' && config.supportContact.webhookUrl) {
            try {
                await fetch(config.supportContact.webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name: supportName, message: supportMsg })
                });
            } catch (e) {}
        }

        setSupportSending(false);
        setSupportSuccess(true);
        setTimeout(() => {
            setSupportSuccess(false);
            setSupportName('');
            setSupportMsg('');
        }, 3000);
    };

    const openFAQ = (faq: any) => {
        setSelectedFAQ(faq);
        setActiveTab('faq_detail');
    };

    return (
        <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[60] font-sans">
            
            {/* MAIN FLOATING BUTTON */}
            {!isOpen && (
                <button 
                    onClick={onOpen}
                    className="group relative w-14 h-14 md:w-16 md:h-16 bg-black border-2 border-gold-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(239,191,50,0.6)] hover:scale-110 transition-all duration-500"
                >
                    <MessageCircle className="text-gold-400 w-7 h-7 md:w-8 md:h-8 group-hover:text-white transition-colors relative z-10" />
                    
                    {/* Black Hole Text Effect */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible">
                        <span className="absolute -top-10 whitespace-nowrap bg-black/90 text-gold-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded border border-gold-500/30 shadow-lg opacity-0 transform scale-0 rotate-180 group-hover:opacity-100 group-hover:scale-100 group-hover:rotate-0 transition-all duration-500 origin-center">
                            We are here
                        </span>
                    </div>
                </button>
            )}

            {/* WIDGET WINDOW */}
            {isOpen && (
                <div className="absolute bottom-0 right-0 w-[90vw] sm:w-[380px] h-[75vh] sm:h-[600px] bg-[#121212] border border-gold-600/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in origin-bottom-right">
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-black via-[#1a1a1a] to-black p-4 border-b border-gray-800 flex justify-between items-center flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-gold-400 font-bold font-cinzel tracking-wider text-sm md:text-base">EMPERIAL SUPPORT</span>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-1 rounded-full hover:bg-white/10">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-[#0F0F0F]">
                        
                        {/* HOME TAB */}
                        {activeTab === 'home' && (
                            <div className="p-5 space-y-6">
                                <div className="text-center space-y-2 pt-2">
                                    <h2 className="text-2xl md:text-3xl font-bold text-white animate-fade-in">HELLO THERE 👋</h2>
                                    <p className="text-gray-400 text-xs md:text-sm leading-relaxed px-2">
                                        Need Help? Search our help center for answers or start a conversation with our AI assistant, or you can message us, and we will respond as quickly as possible.
                                    </p>
                                </div>

                                {/* Help Center Search */}
                                <div className="space-y-3">
                                    <h3 className="text-gold-500 text-xs font-bold uppercase tracking-widest border-b border-gold-900/30 pb-1">Help Center</h3>
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-gold-500 transition-colors" />
                                        <input 
                                            type="text" 
                                            placeholder="Search for your answers..." 
                                            className="w-full bg-black border border-gray-700 rounded-lg py-3 pl-10 pr-4 text-sm text-white focus:border-gold-500 outline-none transition-colors placeholder-gray-600"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                        
                                        {/* Suggestions Dropdown */}
                                        {searchQuery && (
                                            <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1a1a] border border-gray-700 rounded-lg shadow-xl z-20 overflow-hidden animate-fade-in">
                                                {filteredFAQs.slice(0, 5).map(faq => (
                                                    <div key={faq.id} onClick={() => openFAQ(faq)} className="p-3 border-b border-gray-800 hover:bg-white/5 cursor-pointer transition-colors">
                                                        <p className="text-gold-200 text-sm font-bold">{faq.question}</p>
                                                        <p className="text-gray-500 text-xs truncate mt-1 flex items-center gap-1"><Crown size={10} className="text-gold-600" /> {faq.answer}</p>
                                                    </div>
                                                ))}
                                                {filteredFAQs.length > 5 && (
                                                    <button 
                                                        onClick={() => setActiveTab('search_results')}
                                                        className="w-full text-center p-2 text-xs text-gold-500 hover:text-white bg-black font-bold hover:bg-gold-900/20 transition-colors"
                                                    >
                                                        Show all {filteredFAQs.length} results
                                                    </button>
                                                )}
                                                {filteredFAQs.length === 0 && (
                                                    <div className="p-4 text-center text-gray-500 text-sm">No results found.</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Knowledge Base Articles */}
                                <div className="space-y-3">
                                    <h3 className="text-gold-500 text-xs font-bold uppercase tracking-widest border-b border-gold-900/30 pb-1">Knowledge Base Articles</h3>
                                    <div className="space-y-2">
                                        {featuredFAQs.map(faq => (
                                            <div key={faq.id} onClick={() => openFAQ(faq)} className="bg-[#151515] p-3 rounded-lg border border-gray-800 flex items-center justify-between group cursor-pointer hover:border-gold-500/30 hover:bg-[#1a1a1a] transition-all">
                                                <span className="text-sm text-gray-300 group-hover:text-white line-clamp-1">{faq.question}</span>
                                                <ChevronRight size={14} className="text-gray-600 group-hover:text-gold-500 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        ))}
                                        {featuredFAQs.length === 0 && <p className="text-gray-600 text-xs italic text-center py-2">No featured articles available.</p>}
                                    </div>
                                </div>

                                {/* Bot Prompt */}
                                <div className="bg-gradient-to-r from-gold-900/10 to-transparent p-4 rounded-xl border border-gold-500/20 mt-4">
                                    <p className="text-sm text-gray-300 mb-3">You can ask the bot if it wasn't helpful.</p>
                                    <button 
                                        onClick={() => setActiveTab('messages')}
                                        className="text-xs font-bold text-black bg-gold-500 px-4 py-2 rounded-lg hover:bg-gold-400 transition-colors flex items-center gap-2 shadow-gold-glow w-full justify-center"
                                    >
                                        <MessageCircle size={14} /> Ask AI Assistant
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* SEARCH RESULTS TAB */}
                        {activeTab === 'search_results' && (
                            <div className="flex flex-col h-full">
                                <div className="p-4 border-b border-gray-800 flex items-center gap-2 bg-[#151515] sticky top-0 z-10">
                                    <button onClick={() => setActiveTab('home')} className="text-gold-500 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"><ArrowLeft size={20} /></button>
                                    <h3 className="font-bold text-white text-sm">Search Results</h3>
                                </div>
                                <div className="flex-1 p-4 space-y-4 overflow-y-auto">
                                    {filteredFAQs.map(faq => (
                                        <div key={faq.id} onClick={() => openFAQ(faq)} className="bg-[#1a1a1a] p-4 rounded-xl border border-gray-800 hover:border-gold-500/20 transition-colors cursor-pointer">
                                            <h4 className="text-gold-400 font-bold mb-2 text-sm">{faq.question}</h4>
                                            <div className="text-gray-300 text-sm leading-relaxed flex gap-2">
                                                <Crown size={14} className="text-gold-600 flex-shrink-0 mt-1" />
                                                <span className="line-clamp-2">{faq.answer}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* FAQ DETAIL TAB */}
                        {activeTab === 'faq_detail' && selectedFAQ && (
                            <div className="flex flex-col h-full bg-[#0F0F0F]">
                                <div className="p-4 border-b border-gray-800 flex items-center gap-2 bg-[#151515] sticky top-0 z-10">
                                    <button onClick={() => setActiveTab('home')} className="text-gold-500 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"><ArrowLeft size={20} /></button>
                                    <h3 className="font-bold text-white text-sm">Article View</h3>
                                </div>
                                
                                <div className="p-6">
                                    {/* Requested Header */}
                                    <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                                        <div className="p-2 bg-gold-900/20 rounded-full border border-gold-500/30">
                                            <Crown className="text-gold-500 w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-cinzel font-bold text-white">EMPERIAL</h2>
                                            <p className="text-xs text-gold-500 font-bold tracking-widest uppercase">Support</p>
                                        </div>
                                    </div>

                                    <h1 className="text-xl font-bold text-white mb-6">{selectedFAQ.question}</h1>
                                    
                                    <div className="bg-[#1a1a1a] p-5 rounded-xl border border-gray-800 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                                        <Crown size={16} className="inline-block mr-2 text-gold-500 mb-1" />
                                        {selectedFAQ.answer}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MESSAGES TAB */}
                        {activeTab === 'messages' && (
                            <div className="flex flex-col h-full">
                                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                                    {messages.map((msg, idx) => (
                                        <div key={idx} className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-md ${msg.isUser ? 'bg-gold-500 text-black font-medium rounded-br-sm' : 'bg-[#1a1a1a] border border-gray-800 text-gray-300 rounded-bl-sm'}`}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                    {isBotTyping && (
                                        <div className="flex justify-start animate-fade-in">
                                            <div className="bg-[#1a1a1a] border border-gray-800 p-3 rounded-2xl rounded-bl-sm">
                                                <Loader2 className="w-4 h-4 text-gold-500 animate-spin" />
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                                <div className="p-4 bg-[#151515] border-t border-gray-800 sticky bottom-0">
                                    <div className="relative">
                                        <input 
                                            type="text" 
                                            placeholder="Type a message..." 
                                            className="w-full bg-black border border-gray-700 rounded-full py-3 pl-4 pr-12 text-sm text-white focus:border-gold-500 outline-none transition-colors placeholder-gray-600"
                                            value={inputText}
                                            onChange={(e) => setInputText(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        />
                                        <button 
                                            onClick={handleSendMessage}
                                            disabled={!inputText.trim() || isBotTyping}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-gold-500 rounded-full text-black hover:bg-gold-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                                        >
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* SUPPORT TAB (Conditional - Updated for Telegram) */}
                        {activeTab === 'support' && (
                            <div className="p-6 h-full flex flex-col items-center justify-center">
                                <div className="w-full max-w-xs text-center">
                                    <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-700">
                                        <Send className="w-10 h-10 text-gold-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Contact Support</h3>
                                    <p className="text-gray-400 text-sm mb-6">Send a direct message to our support team.</p>
                                    
                                    {supportSuccess ? (
                                        <div className="bg-green-900/20 border border-green-500/50 p-4 rounded-xl text-green-400 text-sm font-bold animate-fade-in">
                                            Message Sent Successfully!
                                        </div>
                                    ) : (
                                        <div className="space-y-4 text-left">
                                            <div>
                                                <label className="text-xs font-bold text-gold-400 uppercase">Your Name</label>
                                                <input 
                                                    type="text" 
                                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-gold-500 outline-none mt-1"
                                                    placeholder="Enter name"
                                                    value={supportName}
                                                    onChange={(e) => setSupportName(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gold-400 uppercase">Message</label>
                                                <textarea 
                                                    className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-gold-500 outline-none mt-1 h-32"
                                                    placeholder="How can we help?"
                                                    value={supportMsg}
                                                    onChange={(e) => setSupportMsg(e.target.value)}
                                                />
                                            </div>
                                            <button 
                                                onClick={handleSendSupportTicket}
                                                disabled={supportSending || !supportName || !supportMsg}
                                                className="w-full bg-gold-500 text-black font-bold py-3 rounded-lg hover:bg-gold-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {supportSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                                Send Ticket
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer Navigation */}
                    <div className="bg-black border-t border-gray-800 h-16 flex items-center justify-around flex-shrink-0">
                        <button onClick={() => setActiveTab('home')} className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${activeTab === 'home' || activeTab === 'search_results' || activeTab === 'faq_detail' ? 'text-gold-500' : 'text-gray-600 hover:text-gray-400'}`}>
                            <Home size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-wide">Home</span>
                        </button>
                        <button onClick={() => setActiveTab('messages')} className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${activeTab === 'messages' ? 'text-gold-500' : 'text-gray-600 hover:text-gray-400'}`}>
                            <MessageCircle size={20} />
                            <span className="text-[10px] font-bold uppercase tracking-wide">Messages</span>
                        </button>
                        {config.enableSupportTab && (
                            <button onClick={() => setActiveTab('support')} className={`flex flex-col items-center gap-1 w-full h-full justify-center transition-colors ${activeTab === 'support' ? 'text-gold-500' : 'text-gray-600 hover:text-gray-400'}`}>
                                <Send size={20} />
                                <span className="text-[10px] font-bold uppercase tracking-wide">Support</span>
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupportWidget;
