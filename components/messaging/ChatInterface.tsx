'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { MessageSquare, Send, User, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import io, { Socket } from 'socket.io-client';

export function ChatInterface({ role }: { role: 'CLIENT' | 'FREELANCER' }) {
    const [contacts, setContacts] = useState<any[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [activeContact, setActiveContact] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    let typingTimeout = useRef<NodeJS.Timeout | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const fetchContacts = useCallback(async () => {
        try {
            const res = await fetch(`/api/messages/contacts?t=${Date.now()}`, { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setContacts(data.contacts || []);
                setCurrentUserId(data.currentUserId || '');
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingContacts(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    // Socket Initialization
    useEffect(() => {
        let sock: Socket;

        const initSocket = async () => {
            // Wake up Next.js WebSocket API Route
            await fetch('/api/socket/io');

            sock = io({
                path: '/api/socket/io',
                addTrailingSlash: false,
                withCredentials: true,
            });

            sock.on('connect', () => {
                console.log('Socket connected:', sock.id);
                // The prompt says "Emit join event with authenticated userId" 
                // We'll emit it even if backend handles it securely
                if (currentUserId) {
                    sock.emit('join', currentUserId);
                }
            });

            sock.on('receiveMessage', (message: any) => {
                setMessages(prev => {
                    // prevent duplicate messages
                    if (prev.find(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });
                setTimeout(scrollToBottom, 50);
                fetchContacts(); // Refresh contacts for latest message preview
            });

            sock.on('messageRead', () => {
                setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
            });

            sock.on('userTyping', () => {
                setIsTyping(true);
            });

            sock.on('userStopTyping', () => {
                setIsTyping(false);
            });

            setSocket(sock);
        };

        if (currentUserId) {
            initSocket();
        }

        return () => {
            if (sock) sock.disconnect();
        };
    }, [currentUserId, fetchContacts]);

    // Fetch Messages when active contact changes
    useEffect(() => {
        const fetchMessages = async () => {
            if (!activeContact) return;
            try {
                const timestamp = new Date().getTime();
                const res = await fetch(`/api/messages?contactId=${activeContact.id}&t=${timestamp}`, {
                    method: 'GET',
                    headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate', 'Pragma': 'no-cache', 'Expires': '0' },
                    cache: 'no-store'
                });

                if (res.ok) {
                    const data = await res.json();
                    if (data.messages) {
                        setMessages((prev) => {
                            // Merge fetched history with any live messages to avoid dups
                            const newMessages = [...data.messages];
                            prev.forEach(p => {
                                if (!newMessages.find(n => n.id === p.id)) {
                                    newMessages.push(p);
                                }
                            });
                            // sort by created At
                            newMessages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
                            
                            // Only update if difference
                            const isDifferent = prev.length !== newMessages.length || 
                                                JSON.stringify(prev) !== JSON.stringify(newMessages);
                            
                            if (isDifferent) {
                                setTimeout(scrollToBottom, 50);
                                return newMessages;
                            }
                            return prev;
                        });

                        // Optimistically mark unread messages as read using socket
                        const unreadMessages = data.messages.filter((m: any) => !m.isRead && m.receiverId === currentUserId);
                        if (unreadMessages.length > 0 && socket) {
                            socket.emit('markAsRead', { senderId: activeContact.id });
                        }
                    }
                }
            } catch (err) {
                console.error(err);
            }
        };

        fetchMessages();
        setIsTyping(false);
    }, [activeContact, currentUserId, socket]);

    // Live Read Receipt processing when active window receives a new text from the other party
    useEffect(() => {
        const unreadReceivedMessages = messages.filter(m => !m.isRead && m.receiverId === currentUserId && activeContact && m.senderId === activeContact.id);

        if (unreadReceivedMessages.length > 0 && socket) {
            socket.emit('markAsRead', { senderId: activeContact.id });
            setMessages(prev => prev.map(msg => msg.senderId === activeContact.id ? { ...msg, isRead: true } : msg));
        }
    }, [messages, currentUserId, activeContact, socket]);

    const handleTyping = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value);
        if (socket && activeContact) {
            socket.emit('typing', activeContact.id);
            
            if (typingTimeout.current) clearTimeout(typingTimeout.current);
            typingTimeout.current = setTimeout(() => {
                socket.emit('stopTyping', activeContact.id);
            }, 2000);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !activeContact || !socket) return;

        const content = inputValue;
        
        socket.emit('sendMessage', {
            receiverId: activeContact.id,
            content
        });
        
        setInputValue('');
        socket.emit('stopTyping', activeContact.id);
    };

    return (
        <div className="fade-in h-[calc(100vh-5rem)] flex flex-col pt-1">
            <h1 className="text-lg font-bold font-poppins text-gray-900 dark:text-white mb-3">
                Communicate directly with your project connections.
            </h1>

            <Card className="flex-1 bg-white dark:bg-gray-900 shadow-sm border-gray-100 dark:border-gray-800 flex overflow-hidden">

                {/* Left Pane - Sidebar */}
                <div className="w-[100px] md:w-1/3 border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col transition-all">
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 shrink-0 hidden md:block">
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">Conversations</div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loadingContacts ? (
                            <div className="p-4 text-center text-sm text-gray-500 hidden md:block">Loading chats...</div>
                        ) : contacts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center opacity-50 h-full">
                                <MessageSquare className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500 font-medium hidden md:block">No contacts yet</p>
                            </div>
                        ) : (
                            <div className="flex flex-col w-full">
                                {contacts.map(contact => (
                                    <button
                                        key={contact.id}
                                        onClick={() => setActiveContact(contact)}
                                        className={`w-full text-left p-3 md:p-4 border-b border-gray-100 dark:border-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-colors ${
                                            activeContact?.id === contact.id ? 'bg-white dark:bg-gray-800 shadow-[inset_4px_0_0_0_var(--tw-colors-primary)]' : ''
                                        }`}
                                    >
                                        <div className="flex items-center justify-center md:justify-start gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 relative">
                                                <User className="w-5 h-5" />
                                                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                                            </div>
                                            <div className="flex-1 min-w-0 hidden md:block">
                                                <h4 className="font-bold text-gray-900 dark:text-white truncate">{contact.name}</h4>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                                    {contact.lastMessage || 'Start a conversation'}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Pane - Chat */}
                <div className="flex-1 flex flex-col bg-white dark:bg-[#0c1017]">
                    {!activeContact ? (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="text-center opacity-50">
                                <MessageSquare className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-400 font-poppins mb-2">Your Messages</h3>
                                <p className="text-gray-500 max-w-sm mx-auto">Select a conversation from the sidebar to view your message history or start a new chat.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-4 bg-white dark:bg-gray-900 shrink-0">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 relative">
                                    <User className="w-5 h-5" />
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full"></span>
                                </div>
                                <div>
                                    <Link href={`/profile/${activeContact.id}`} className="hover:underline">
                                        <h3 className="font-bold text-gray-900 dark:text-white">{activeContact.name}</h3>
                                    </Link>
                                    <p className={`text-xs font-medium tracking-wide ${isTyping ? 'text-green-500' : 'text-primary'}`}>
                                        {isTyping ? 'Typing...' : 'Available to chat'}
                                    </p>
                                </div>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col" ref={containerRef}>
                                <div className="space-y-4 max-w-3xl w-full mx-auto flex-1 flex flex-col justify-end min-h-full">
                                    <div className="flex-1 shrink-0" />

                                    {messages.length === 0 ? (
                                        <div className="text-center opacity-50 py-10">
                                            <p className="text-sm font-medium">Say hello to start the conversation!</p>
                                        </div>
                                    ) : (
                                        <AnimatePresence initial={false}>
                                            {messages.map((msg) => {
                                                const isMe = msg.senderId === currentUserId;
                                                return (
                                                    <motion.div
                                                        key={msg.id}
                                                        initial={{ opacity: 0, scale: 0.95, y: 15 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className={`flex w-full mt-4 ${isMe ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        <div className={`max-w-[85%] md:max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                            <div
                                                                className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                                                                    isMe 
                                                                        ? 'bg-primary text-white rounded-br-sm' 
                                                                        : 'bg-gray-100 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                                                                }`}
                                                            >
                                                                <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed tracking-wide">
                                                                    {msg.content}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-1 mt-1.5 px-1">
                                                                <span className="text-[11px] font-medium text-gray-400 tracking-wider uppercase">
                                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                                {isMe && !msg.id.startsWith('temp-') && (
                                                                    msg.isRead ? <CheckCheck className="w-3.5 h-3.5 text-primary" /> : <Check className="w-3.5 h-3.5 text-gray-400" />
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    )}
                                    <div ref={messagesEndRef} className="h-1 shrink-0" />
                                </div>
                            </div>

                            {/* Input Form */}
                            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
                                <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-end gap-3">
                                    <textarea
                                        placeholder="Type a message..."
                                        value={inputValue}
                                        onChange={handleTyping}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e);
                                            }
                                        }}
                                        className="flex-1 px-4 py-3 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none min-h-[50px] max-h-[150px]"
                                        rows={1}
                                    />
                                    <Button type="submit" disabled={!inputValue.trim()} className="shrink-0 rounded-xl px-5 h-[50px]">
                                        <Send className="w-5 h-5 md:mr-2" />
                                        <span className="hidden md:inline">Send</span>
                                    </Button>
                                </form>
                            </div>
                        </>
                    )}
                </div>

            </Card>

        </div>
    );
}
