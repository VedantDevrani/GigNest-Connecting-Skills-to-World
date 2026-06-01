'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import {
    MessageSquare,
    Send,
    User,
    Check,
    CheckCheck,
    Briefcase,
    ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import io, { Socket } from 'socket.io-client';

interface OtherParty {
    id: string;
    name: string;
    avatarUrl?: string | null;
}

interface LastMessage {
    content: string;
    createdAt: string;
    isFromMe: boolean;
}

interface Conversation {
    id: string;
    contractId: string;
    jobTitle: string;
    contractStatus: string;
    otherParty: OtherParty;
    lastMessage: LastMessage | null;
    unreadCount: number;
    updatedAt: string;
}

interface MessageSender {
    id: string;
    name: string;
    avatarUrl?: string | null;
}

interface Message {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    isRead: boolean;
    createdAt: string;
    sender: MessageSender;
}


export function ChatInterface({ role }: { role: 'CLIENT' | 'FREELANCER' }) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [loadingConversations, setLoadingConversations] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isOnline, setIsOnline] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const activeConversationRef = useRef<Conversation | null>(null);

    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    // ── Helpers ──────────────────────────────────────────────────────────────

    const scrollToBottom = useCallback(() => {
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }, []);

    // ── Fetch Conversations ───────────────────────────────────────────────────

    const fetchConversations = useCallback(async () => {
        try {
            const res = await fetch('/api/chat/conversations', { cache: 'no-store' });
            if (res.ok) {
                const data = await res.json();
                setConversations(data.conversations || []);
                setCurrentUserId(data.currentUserId || '');
            }
        } catch (err) {
            console.error('[Chat] Failed to fetch conversations:', err);
        } finally {
            setLoadingConversations(false);
        }
    }, []);

    useEffect(() => {
        fetchConversations();
        
        // Background polling for unread notifications (runs even when no chat is active)
        const pollInterval = setInterval(() => {
            fetchConversations();
        }, 3000);
        
        return () => clearInterval(pollInterval);
    }, [fetchConversations]);

    // ── Socket Initialization ─────────────────────────────────────────────────

    useEffect(() => {
        if (!currentUserId) return;

        let sock: Socket;
        let isMounted = true;

        const initSocket = async () => {
            // Ensure the Socket.IO endpoint is awake
            await fetch('/api/socket/io').catch(() => {});
            if (!isMounted) return;

            sock = io({
                path: '/api/socket/io',
                addTrailingSlash: false,
                withCredentials: true,
            });

            sock.on('connect', () => {
                if (activeConversationRef.current) {
                    sock.emit('joinConversation', activeConversationRef.current.id);
                }
            });

            sock.on('connect_error', (err) => {
                console.error('[Socket] Connect error:', err.message);
            });

            sock.on('receiveMessage', (message: Message) => {
                setMessages(prev => {
                    if (prev.find(m => m.id === message.id)) return prev;
                    return [...prev, message];
                });
                scrollToBottom();

                // Update the conversation's last message in sidebar
                setConversations(prev =>
                    prev.map(c =>
                        c.id === message.conversationId
                            ? {
                                  ...c,
                                  lastMessage: {
                                      content: message.content,
                                      createdAt: message.createdAt,
                                      isFromMe: message.senderId === currentUserId,
                                  },
                                  unreadCount:
                                      message.senderId !== currentUserId
                                          ? c.unreadCount + 1
                                          : c.unreadCount,
                              }
                            : c
                    )
                );
            });

            sock.on('messagesRead', ({ conversationId }: { conversationId: string }) => {
                if (activeConversationRef.current?.id === conversationId) {
                    setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
                }
            });
            sock.on('userOnline', ({ userId }: { userId: string }) => {
                if (activeConversationRef.current?.otherParty?.id === userId) {
                    setIsOnline(true);
                }
            });
            
            sock.on('userOffline', ({ userId }: { userId: string }) => {
                if (activeConversationRef.current?.otherParty?.id === userId) {
                    setIsOnline(false);
                }
            });
            sock.on('error', ({ message: errMsg }: { message: string }) => {
                console.error('[Socket] Server error:', errMsg);
            });

            if (isMounted) setSocket(sock);
            else sock.disconnect();
        };

        initSocket();

        return () => {
            isMounted = false;
            if (sock) sock.disconnect();
        };
    }, [currentUserId, scrollToBottom]);

    // ── Join Conversation Room When Active Changes ────────────────────────────

    useEffect(() => {
        if (!socket || !activeConversation) return;

        socket.emit('joinConversation', activeConversation.id);
        
        // Check online status of the other party
        socket.emit('checkStatus', { userId: activeConversation.otherParty.id });
        setIsOnline(false); // Reset until we get a response

        // Reset unread count for active conversation
        setConversations(prev =>
            prev.map(c =>
                c.id === activeConversation.id ? { ...c, unreadCount: 0 } : c
            )
        );
    }, [socket, activeConversation]);

    // ── Fetch Messages When Active Conversation Changes ───────────────────────

    useEffect(() => {
        if (!activeConversation) return;

        const fetchMessages = async (isInitial = true) => {
            if (isInitial) setLoadingMessages(true);
            try {
                const res = await fetch(
                    `/api/chat/conversations/${activeConversation.id}/messages`,
                    {
                        cache: 'no-store',
                        headers: {
                            'Cache-Control': 'no-cache, no-store, must-revalidate',
                            Pragma: 'no-cache',
                        },
                    }
                );

                if (res.status === 403) {
                    setMessages([]);
                    return;
                }

                if (res.ok) {
                    const data = await res.json();
                    
                    setMessages(prev => {
                        // Prevent UI jumping if messages haven't changed
                        if (!isInitial && data.messages && prev.length === data.messages.length) {
                            const lastPrev = prev[prev.length - 1];
                            const lastNew = data.messages[data.messages.length - 1];
                            if (lastPrev?.isRead === lastNew?.isRead) return prev;
                        }
                        
                        // Prevent old incoming data from overwriting our new optimistic local message
                        if (!isInitial && data.messages && data.messages.length < prev.length) {
                            return prev;
                        }
                        
                        return data.messages || [];
                    });
                    
                    if (isInitial) scrollToBottom();
                    else setTimeout(scrollToBottom, 50);

                    // Mark this conversation as read in sidebar
                    setConversations(prev =>
                        prev.map(c =>
                            c.id === activeConversation.id ? { ...c, unreadCount: 0 } : c
                        )
                    );
                }
            } catch (err) {
                console.error('[Chat] Failed to fetch messages:', err);
            } finally {
                if (isInitial) setLoadingMessages(false);
            }
        };

        fetchMessages(true);

        // HTTP Polling fallback in case Socket.IO is blocked by Turbopack
        const pollInterval = setInterval(() => {
            fetchMessages(false); // Update current chat
        }, 2500);

        return () => clearInterval(pollInterval);
    }, [activeConversation, scrollToBottom]);

    // ── Send Message ──────────────────────────────────────────────────────────

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || !activeConversation) return;

        const content = inputValue.trim();
        setInputValue('');

        // Force HTTP POST for reliability in Turbopack dev environment
        try {
            const res = await fetch(
                `/api/chat/conversations/${activeConversation.id}/messages`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content }),
                }
            );
            if (res.ok) {
                const data = await res.json();
                
                // Optimistically add to UI if it's not already there
                setMessages(prev => {
                    if (prev.find(m => m.id === data.message.id)) return prev;
                    return [...prev, data.message];
                });
                
                scrollToBottom();
                
                // Update sidebar last message immediately
                setConversations(prev =>
                    prev.map(c =>
                        c.id === activeConversation.id
                            ? {
                                  ...c,
                                  lastMessage: {
                                      content: data.message.content,
                                      createdAt: data.message.createdAt,
                                      isFromMe: true,
                                  },
                              }
                            : c
                    )
                );
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to send message');
            }
        } catch (err) {
            console.error('[Chat] HTTP send failed:', err);
        }
    };

    // ── Format Time ──────────────────────────────────────────────────────────

    const formatTime = (iso: string) =>
        new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        const today = new Date();
        if (d.toDateString() === today.toDateString()) return formatTime(iso);
        return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="fade-in h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] flex flex-col pt-0 md:pt-1">
            <h1 className="text-lg font-bold font-poppins text-gray-900 dark:text-white mb-3 hidden md:block">
                Contract-based Conversations
            </h1>

            <Card className="flex-1 bg-white dark:bg-gray-900 shadow-sm border-gray-100 dark:border-gray-800 flex overflow-hidden rounded-none md:rounded-xl border-x-0 md:border-x">

                {/* ── Left Pane — Conversation Sidebar ────────────────────── */}
                <div className={`${activeConversation ? 'hidden md:flex' : 'flex'} w-full md:w-[300px] lg:w-1/3 md:border-r border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex-col shrink-0 transition-all`}>
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 shrink-0 hidden md:block">
                        <div className="text-sm font-bold text-gray-400 uppercase tracking-wider">
                            Active Contracts
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        {loadingConversations ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader size="md" variant="spinner" />
                            </div>
                        ) : conversations.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 text-center opacity-50 h-full">
                                <Briefcase className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500 font-medium">
                                    No active contracts yet
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                    Chats appear automatically when a contract starts
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col w-full">
                                {conversations.map(conv => {
                                    const isActive = activeConversation?.id === conv.id;
                                    return (
                                        <button
                                            key={conv.id}
                                            onClick={() => {
                                                if (isActive) {
                                                    setActiveConversation(null);
                                                    setMessages([]);
                                                } else {
                                                    setActiveConversation(conv);
                                                    setMessages([]);
                                                }
                                            }}
                                            className={`w-full text-left p-3 md:p-4 border-b border-gray-100 dark:border-gray-800/50 hover:bg-white dark:hover:bg-gray-800 transition-colors ${
                                                isActive
                                                    ? 'bg-white dark:bg-gray-800 border-l-4 border-l-primary'
                                                    : ''
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                {/* Avatar */}
                                                <div className="relative shrink-0">
                                                    {conv.otherParty?.avatarUrl ? (
                                                        <img src={conv.otherParty.avatarUrl} alt={conv.otherParty.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                                                            {conv.otherParty?.name?.charAt(0)?.toUpperCase() ?? '?'}
                                                        </div>
                                                    )}
                                                    {conv.unreadCount > 0 && (
                                                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                                            {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Contact Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-baseline justify-between gap-2">
                                                        <h4 className={`font-bold truncate ${conv.unreadCount > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-200'}`}>
                                                            {conv.otherParty?.name ?? 'Unknown User'}
                                                        </h4>
                                                        {conv.lastMessage && (
                                                            <span className="text-[10px] text-gray-400 shrink-0">
                                                                {formatDate(conv.lastMessage.createdAt)}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-gray-400 truncate font-medium">
                                                        {conv.jobTitle}
                                                    </p>
                                                    {conv.lastMessage && (
                                                        <p className={`text-xs truncate mt-0.5 ${conv.unreadCount > 0 ? 'text-gray-700 dark:text-gray-300 font-medium' : 'text-gray-400'}`}>
                                                            {conv.lastMessage.isFromMe ? 'You: ' : ''}
                                                            {conv.lastMessage.content}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Right Pane — Chat Window ─────────────────────────────── */}
                <div className={`${!activeConversation ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-white dark:bg-[#0c1017] min-w-0`}>
                    {!activeConversation ? (
                        <div className="flex-1 flex items-center justify-center p-8">
                            <div className="text-center opacity-50 max-w-xs">
                                <MessageSquare className="w-14 h-14 text-gray-300 dark:text-gray-600 mb-4 mx-auto" />
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-400 font-poppins mb-2">
                                    Your Conversations
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Select a conversation to view messages. Chats are automatically created for your active contracts.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Chat Header */}
                            <div className="px-3 md:px-5 py-3 md:py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3 bg-white dark:bg-gray-900 shrink-0">
                                <button
                                    onClick={() => setActiveConversation(null)}
                                    className="md:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                {activeConversation.otherParty?.avatarUrl ? (
                                    <img src={activeConversation.otherParty.avatarUrl} alt={activeConversation.otherParty.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                                        {activeConversation.otherParty?.name?.charAt(0)?.toUpperCase() ?? '?'}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <Link
                                        href={`/profile/${activeConversation.otherParty.id}`}
                                        className="hover:underline"
                                    >
                                        <h3 className="font-bold text-gray-900 dark:text-white truncate">
                                            {activeConversation.otherParty?.name ?? 'Unknown User'}
                                        </h3>
                                    </Link>
                                    <p className={`text-xs font-medium tracking-wide ${isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                                        {isOnline
                                            ? 'Online'
                                            : `${activeConversation.jobTitle} • ${activeConversation.contractStatus}`}
                                    </p>
                                </div>
                                <div className="hidden sm:flex items-center gap-2 text-xs bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-3 py-1 rounded-full font-medium border border-green-200 dark:border-green-800">
                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
                                    Active Contract
                                </div>
                            </div>

                            {/* Messages Area */}
                            <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col">
                                <div className="mt-auto space-y-1 max-w-3xl w-full mx-auto flex flex-col w-full">
                                    {loadingMessages ? (
                                        <div className="flex justify-center py-10">
                                            <Loader size="md" variant="spinner" />
                                        </div>
                                    ) : messages.length === 0 ? (
                                        <div className="text-center opacity-50 py-10">
                                            <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-sm font-medium text-gray-500">
                                                No messages yet — say hello!
                                            </p>
                                        </div>
                                    ) : (
                                        <AnimatePresence initial={false}>
                                            {messages.map((msg) => {
                                                const isMe = msg.senderId === currentUserId;
                                                return (
                                                    <motion.div
                                                        key={msg.id}
                                                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        transition={{ duration: 0.18 }}
                                                        className={`flex w-full mt-3 ${isMe ? 'justify-end' : 'justify-start'}`}
                                                    >
                                                        {!isMe && (
                                                            msg.sender.avatarUrl ? (
                                                                <img src={msg.sender.avatarUrl} alt={msg.sender.name} className="w-7 h-7 rounded-full object-cover shrink-0 mr-2 mt-1 shadow-sm" />
                                                            ) : (
                                                                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0 mr-2 mt-1">
                                                                    {msg.sender.name.charAt(0).toUpperCase()}
                                                                </div>
                                                            )
                                                        )}

                                                        <div className={`max-w-[80%] md:max-w-[65%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                                            <div
                                                                className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                                                                    isMe
                                                                        ? 'bg-primary text-white rounded-br-sm'
                                                                        : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                                                                }`}
                                                            >
                                                                <p className="whitespace-pre-wrap break-words text-[14.5px] leading-relaxed">
                                                                    {msg.content}
                                                                </p>
                                                            </div>

                                                            <div className="flex items-center gap-1 mt-1 px-1">
                                                                <span className="text-[11px] text-gray-400 font-medium">
                                                                    {formatTime(msg.createdAt)}
                                                                </span>
                                                                {isMe && (
                                                                    msg.isRead
                                                                        ? <CheckCheck className="w-3.5 h-3.5 text-primary" />
                                                                        : <Check className="w-3.5 h-3.5 text-gray-400" />
                                                                )}
                                                            </div>
                                                        </div>

                                                        {isMe && (
                                                            msg.sender.avatarUrl ? (
                                                                <img src={msg.sender.avatarUrl} alt={msg.sender.name} className="w-7 h-7 rounded-full object-cover shrink-0 ml-2 mt-1 shadow-sm" />
                                                            ) : (
                                                                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs shrink-0 ml-2 mt-1 shadow-sm">
                                                                    {msg.sender.name.charAt(0).toUpperCase()}
                                                                </div>
                                                            )
                                                        )}
                                                    </motion.div>
                                                );
                                            })}
                                        </AnimatePresence>
                                    )}

                                    <div ref={messagesEndRef} className="h-1 shrink-0" />
                                </div>
                            </div>

                            {/* Input Area */}
                            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
                                <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex items-end gap-3">
                                    <textarea
                                        id="chat-message-input"
                                        placeholder="Type a message..."
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSendMessage(e as any);
                                            }
                                        }}
                                        className="flex-1 px-4 py-3 bg-gray-50 dark:bg-[#111827] border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none min-h-[50px] max-h-[150px] text-sm"
                                        rows={1}
                                    />
                                    <Button
                                        type="submit"
                                        id="chat-send-button"
                                        disabled={!inputValue.trim()}
                                        className="shrink-0 rounded-xl px-5 h-[50px]"
                                    >
                                        <Send className="w-4 h-4 md:mr-2" />
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
