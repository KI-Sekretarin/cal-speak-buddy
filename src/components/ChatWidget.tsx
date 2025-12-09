import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Send, User, Bot, Loader2, Paperclip, Smile, MoreVertical, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import useSound from 'use-sound';

// Simple pop sound
const popSound = 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3';

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'bot' | 'agent';
    created_at: string;
}

interface ChatWidgetProps {
    companyId: string;
    companyName: string;
    visitorToken: string;
    primaryColor?: string;
    welcomeMessage?: string;
    suggestedQuestions?: string[];
    contactSlug?: string;
}

export default function ChatWidget({
    companyId,
    companyName,
    visitorToken,
    primaryColor = '#000000',
    welcomeMessage = 'Hallo! Wie kann ich Ihnen heute helfen?',
    suggestedQuestions = [],
    contactSlug
}: ChatWidgetProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [isOpen, setIsOpen] = useState(true); // For minimize/maximize if needed
    const scrollRef = useRef<HTMLDivElement>(null);
    const [play] = useSound(popSound, { volume: 0.5 });

    // Initialize session
    useEffect(() => {
        const initSession = async () => {
            const { data: sessions } = await supabase
                .from('chat_sessions')
                .select('id')
                .eq('user_id', companyId)
                .eq('visitor_token', visitorToken)
                .eq('status', 'active')
                .single();

            if (sessions) {
                setSessionId(sessions.id);
            } else {
                const { data: newSession } = await supabase
                    .from('chat_sessions')
                    .insert({
                        user_id: companyId,
                        visitor_token: visitorToken,
                        status: 'active'
                    })
                    .select()
                    .single();

                if (newSession) setSessionId(newSession.id);
            }
        };

        if (companyId && visitorToken) initSession();
    }, [companyId, visitorToken]);

    // Load messages and subscribe
    useEffect(() => {
        if (!sessionId) return;

        const fetchMessages = async () => {
            const { data } = await supabase
                .from('chat_messages')
                .select('*')
                .eq('session_id', sessionId)
                .order('created_at', { ascending: true });

            if (data) setMessages(data as Message[]);
        };

        fetchMessages();

        // Subscribe to new messages
        const channel = supabase
            .channel(`chat:${sessionId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'chat_messages',
                filter: `session_id=eq.${sessionId}`
            }, (payload) => {
                const newMessage = payload.new as Message;
                setMessages(prev => {
                    // Avoid duplicates
                    if (prev.find(m => m.id === newMessage.id)) return prev;
                    return [...prev, newMessage];
                });

                // Play sound if message is not from user
                if (newMessage.sender !== 'user') {
                    play();
                    setIsTyping(false); // Stop typing indicator
                }
            })
            .on('broadcast', { event: 'typing' }, () => {
                setIsTyping(true);
                // Clear typing after 3 seconds of no events
                setTimeout(() => setIsTyping(false), 3000);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId, play]);

    // Auto scroll
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    const sendMessage = async () => {
        if (!input.trim() || !sessionId) return;

        const content = input.trim();
        setInput('');
        setLoading(true);

        // Optimistic update
        const tempId = crypto.randomUUID();
        const tempMessage: Message = {
            id: tempId,
            content: content,
            sender: 'user',
            created_at: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMessage]);

        try {
            const { data: newMessage, error } = await supabase
                .from('chat_messages')
                .insert({
                    session_id: sessionId,
                    sender: 'user',
                    content: content
                })
                .select()
                .single();

            if (error) throw error;

            // Replace temp message with real one
            setMessages(prev => prev.map(m => m.id === tempId ? (newMessage as Message) : m));

            // Simulate AI thinking
            setTimeout(() => setIsTyping(true), 500);

        } catch (e) {
            console.error(e);
            // Remove temp message on error
            setMessages(prev => prev.filter(m => m.id !== tempId));
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <Card className="w-full h-[600px] flex flex-col shadow-2xl border-0 overflow-hidden bg-white/80 backdrop-blur-xl ring-1 ring-black/5">
            {/* Header */}
            <div
                className="p-4 flex items-center justify-between text-white shadow-md z-10"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}dd)` }}
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Avatar className="w-10 h-10 border-2 border-white/20">
                            <AvatarFallback className="bg-white/10 text-white"><Bot className="w-6 h-6" /></AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-none">{companyName}</h3>
                        <span className="text-xs text-white/80">Antwortet sofort</span>
                    </div>
                </div>
                <div className="flex gap-1">
                    {contactSlug && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-8 bg-white/20 hover:bg-white/30 text-white border-0"
                            onClick={() => window.open(`/contact/${contactSlug}`, '_blank')}
                        >
                            Zum Kontaktformular
                        </Button>
                    )}
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-8 w-8">
                        <MoreVertical className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Messages Area */}
            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden bg-slate-50/50 relative">
                <ScrollArea className="flex-1 p-4">
                    <div className="space-y-6 pb-4">
                        {/* Welcome Message */}
                        {messages.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-6 mt-4"
                            >
                                <div className="flex justify-start">
                                    <div className="flex gap-3 max-w-[85%]">
                                        <Avatar className="w-8 h-8 mt-1">
                                            <AvatarFallback className="bg-white border shadow-sm"><Bot className="w-4 h-4 text-primary" style={{ color: primaryColor }} /></AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <div className="p-4 rounded-2xl rounded-tl-none bg-white shadow-sm border border-slate-100 text-sm text-slate-700">
                                                {welcomeMessage}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground ml-1">Gerade eben</span>
                                        </div>
                                    </div>
                                </div>

                                {suggestedQuestions && suggestedQuestions.length > 0 && (
                                    <div className="flex flex-wrap gap-2 pl-11">
                                        {suggestedQuestions.map((q, i) => (
                                            <motion.button
                                                key={i}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setInput(q)}
                                                className="text-xs border bg-white hover:bg-slate-50 shadow-sm rounded-full px-4 py-2 transition-colors text-left"
                                                style={{ borderColor: primaryColor, color: primaryColor }}
                                            >
                                                {q}
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* Message List */}
                        <AnimatePresence initial={false}>
                            {messages.map((msg, index) => {
                                const isUser = msg.sender === 'user';
                                const isAgent = msg.sender === 'agent';
                                const showAvatar = !isUser && (index === 0 || messages[index - 1].sender === 'user');

                                return (
                                    <motion.div
                                        key={msg.id}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                        className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`flex gap-3 max-w-[85%] ${isUser ? 'flex-row-reverse' : ''}`}>
                                            {!isUser && (
                                                <div className="w-8 flex-shrink-0">
                                                    {showAvatar ? (
                                                        <Avatar className="w-8 h-8 mt-1">
                                                            <AvatarFallback className={isAgent ? 'bg-blue-600 text-white' : 'bg-white border shadow-sm'}>
                                                                {isAgent ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" style={{ color: primaryColor }} />}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                    ) : <div className="w-8" />}
                                                </div>
                                            )}

                                            <div className={`group relative ${!isUser ? 'space-y-1' : ''}`}>
                                                <div
                                                    className={`p-3 px-4 rounded-2xl text-sm shadow-sm ${isUser
                                                        ? 'text-white rounded-tr-none'
                                                        : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                                                        }`}
                                                    style={isUser ? { backgroundColor: primaryColor } : {}}
                                                >
                                                    <div className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}>
                                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                                    </div>
                                                </div>
                                                {/* Timestamp on hover */}
                                                <div className={`text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-4 ${isUser ? 'right-0' : 'left-0'} whitespace-nowrap`}>
                                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {/* Typing Indicator */}
                        <AnimatePresence>
                            {isTyping && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex justify-start"
                                >
                                    <div className="flex gap-3">
                                        <Avatar className="w-8 h-8 mt-1">
                                            <AvatarFallback className="bg-white border shadow-sm"><Bot className="w-4 h-4" style={{ color: primaryColor }} /></AvatarFallback>
                                        </Avatar>
                                        <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-1 items-center h-10">
                                            <motion.div
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                                                className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                                            />
                                            <motion.div
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                                                className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                                            />
                                            <motion.div
                                                animate={{ y: [0, -5, 0] }}
                                                transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                                                className="w-1.5 h-1.5 bg-slate-400 rounded-full"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-100">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            sendMessage();
                        }}
                        className="flex gap-2 items-end"
                    >
                        <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-primary rounded-full shrink-0">
                            <Paperclip className="w-5 h-5" />
                        </Button>
                        <div className="flex-1 relative">
                            <Textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Nachricht schreiben..."
                                disabled={loading || !sessionId}
                                className="min-h-[44px] max-h-[120px] resize-none rounded-2xl border-slate-200 focus:ring-primary/20 focus:border-primary pr-10 py-3 shadow-sm bg-slate-50 focus:bg-white transition-all"
                                rows={1}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-1 top-1 text-muted-foreground hover:text-primary rounded-full h-8 w-8"
                            >
                                <Smile className="w-5 h-5" />
                            </Button>
                        </div>
                        <Button
                            type="submit"
                            size="icon"
                            disabled={loading || !sessionId || !input.trim()}
                            className="rounded-full h-11 w-11 shadow-md shrink-0 transition-transform hover:scale-105 active:scale-95"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-0.5" />}
                        </Button>
                    </form>
                    <div className="text-center mt-2">
                        <a href="/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground flex items-center justify-center gap-1 hover:underline">
                            Powered by <span className="font-semibold text-primary">KI-Sekretärin</span>
                        </a>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
