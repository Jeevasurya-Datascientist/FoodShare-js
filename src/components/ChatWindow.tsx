import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, getDoc } from 'firebase/firestore';
import { Chat, Message, User } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, X, MessageSquare, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface ChatWindowProps {
    otherUserId: string; // The user we are chatting with
    otherUserName?: string;
    donationId?: string; // Optional context
    trigger?: React.ReactNode; // Custom trigger button
}

const ChatWindow: React.FC<ChatWindowProps> = ({ otherUserId, otherUserName, donationId, trigger }) => {
    const { currentUser } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [chatId, setChatId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            console.log("ChatWindow Opened", { otherUserId, otherUserName, donationId, currentUser: currentUser?.uid });
            if (!otherUserId) {
                console.error("ChatWindow: otherUserId is missing!");
            }
        }
    }, [isOpen, otherUserId, otherUserName, donationId, currentUser]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Find or create chat
    useEffect(() => {
        if (!isOpen || !currentUser) return;

        const findChat = async () => {
            setLoading(true);
            // Simple logic: query chats where currentUser is participating
            // In a real app with many chats, this query needs composite index or better structure.
            // For MVP, filtering client-side for the specific otherUserId might be needed if composite index issues arise, 
            // but let's try a direct query approach if possible or just list all user's chats and find the one.

            const chatsRef = collection(db, 'chats');
            const q = query(chatsRef, where('participants', 'array-contains', currentUser.uid));

            const unsubscribe = onSnapshot(q, (snapshot) => {
                let foundChatId = null;
                snapshot.docs.forEach(doc => {
                    const data = doc.data() as Chat;
                    if (data.participants.includes(otherUserId)) {
                        // Check if donationId matches if provided (optional specificity)
                        if (donationId && data.donationId === donationId) {
                            foundChatId = doc.id;
                        } else if (!donationId && !data.donationId) {
                            // Generically chat with user
                            foundChatId = doc.id;
                        }
                        // Fallback: Just match participants for now to simplify
                        if (!foundChatId) foundChatId = doc.id;
                    }
                });

                if (foundChatId) {
                    setChatId(foundChatId);
                } else {
                    // No chat exists yet, we will create one on first message
                    setChatId(null);
                }
                setLoading(false);
            });

            return unsubscribe;
        };

        findChat();
    }, [isOpen, currentUser, otherUserId, donationId]);

    // Listen for messages
    useEffect(() => {
        if (!chatId) {
            setMessages([]);
            return;
        }

        const messagesRef = collection(db, `chats/${chatId}/messages`);
        const q = query(messagesRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() || new Date(),
            })) as Message[];
            setMessages(msgs);

            // Auto-scroll
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollIntoView({ behavior: 'smooth' });
                }
            }, 100);
        });

        return unsubscribe;
    }, [chatId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !currentUser) return;

        setSending(true);
        try {
            let currentChatId = chatId;

            // Create chat if doesn't exist
            if (!currentChatId) {
                const chatData: Omit<Chat, 'id'> = {
                    participants: [currentUser.uid, otherUserId],
                    lastMessage: newMessage,
                    lastMessageTime: new Date(), // serverTimestamp later
                    unreadCount: { [otherUserId]: 1, [currentUser.uid]: 0 },
                    ...(donationId ? { donationId } : {})
                };

                // This relies on the 'find' logic picking it up, 
                // strictly we should probably use addDoc and set state immediately to avoid race conditions
                const docRef = await addDoc(collection(db, 'chats'), {
                    ...chatData,
                    lastMessageTime: serverTimestamp()
                });
                currentChatId = docRef.id;
                setChatId(currentChatId);
            } else {
                // Update existing chat
                await updateDoc(doc(db, 'chats', currentChatId), {
                    lastMessage: newMessage,
                    lastMessageTime: serverTimestamp(),
                    [`unreadCount.${otherUserId}`]: 1 // increment ideally, but simple set for MVP
                });
            }

            // Add message
            await addDoc(collection(db, `chats/${currentChatId}/messages`), {
                chatId: currentChatId,
                senderId: currentUser.uid,
                text: newMessage,
                createdAt: serverTimestamp(),
                readBy: [currentUser.uid]
            });

            setNewMessage('');
        } catch (error) {
            console.error("Error sending message:", error);
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button variant="outline" size="sm" className="gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Chat
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[400px] h-[500px] flex flex-col p-0 gap-0 overflow-hidden">
                {/* Header */}
                <DialogHeader className="p-4 border-b bg-muted/30 flex flex-row items-center justify-between m-0 space-y-0">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border-2 border-background">
                            <AvatarFallback>{otherUserName ? otherUserName[0] : 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <DialogTitle className="text-sm font-semibold text-left">
                                {otherUserName || 'Chat'}
                            </DialogTitle>
                            <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1">
                                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                Online
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4 bg-background">
                    <div className="flex flex-col gap-4">
                        {loading && !chatId ? (
                            <div className="flex justify-center p-4"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
                        ) : messages.length === 0 ? (
                            <div className="text-center text-muted-foreground text-sm py-8">
                                No messages yet. Say hello! 👋
                            </div>
                        ) : (
                            messages.map((msg) => {
                                const isMe = msg.senderId === currentUser?.uid;
                                return (
                                    <div key={msg.id} className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                                        <div className={cn(
                                            "max-w-[80%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                                            isMe ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"
                                        )}>
                                            {msg.text}
                                            <div className={cn("text-[10px] mt-1 opacity-70", isMe ? "text-primary-foreground/80" : "text-muted-foreground")}>
                                                {formatDistanceToNow(msg.createdAt, { addSuffix: true })}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={scrollRef} />
                    </div>
                </ScrollArea>

                {/* Input */}
                <div className="p-3 border-t bg-muted/10">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            disabled={sending}
                            className="flex-1 rounded-full bg-background border-muted-foreground/20 focus-visible:ring-1"
                        />
                        <Button type="submit" size="icon" disabled={!newMessage.trim() || sending} className="rounded-full h-10 w-10 shrink-0 shadow-sm">
                            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-0.5" />}
                        </Button>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ChatWindow;
