import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, doc, getDoc, collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, where, setDoc } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Chat, Message, Deal } from '../types';
import { ArrowLeft, Send, MapPin, Calendar, Check, X, DollarSign, Info } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [chat, setChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showDealModal, setShowDealModal] = useState(false);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  
  // Deal form state
  const [dealPrice, setDealPrice] = useState('');
  const [dealDuration, setDealDuration] = useState('1');
  const [dealLocation, setDealLocation] = useState('');

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) return;

    const chatUnsubscribe = onSnapshot(doc(db, 'chats', chatId), (doc) => {
      if (doc.exists()) {
        setChat({ ...doc.data(), chatId: doc.id } as Chat);
      }
    });

    const messagesQuery = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const messagesUnsubscribe = onSnapshot(messagesQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        ...doc.data(),
        messageId: doc.id
      })) as Message[];
      setMessages(msgs);
    });

    const dealsQuery = query(
      collection(db, 'deals'),
      where('itemId', '==', chat?.itemId || ''),
      where('status', 'in', ['pending', 'accepted'])
    );
    // Note: This is a simplified deal check. In real app, you'd filter by participants too.

    return () => {
      chatUnsubscribe();
      messagesUnsubscribe();
    };
  }, [chatId, chat?.itemId]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim() || !chatId || !user) return;

    const msg = newMessage;
    setNewMessage('');

    const messageRef = doc(collection(db, 'chats', chatId, 'messages'));
    const messageId = messageRef.id;

    await setDoc(messageRef, {
      messageId,
      senderId: user.uid,
      text: msg,
      timestamp: serverTimestamp(),
    });

    await updateDoc(doc(db, 'chats', chatId), {
      lastMessage: msg,
      lastMessageTimestamp: serverTimestamp(),
    });
  };

  const handleProposeDeal = async () => {
    if (!user || !chat || !dealPrice || !dealDuration || !dealLocation) return;

    const dealRef = doc(collection(db, 'deals'));
    const dealId = dealRef.id;

    const newDeal: Deal = {
      dealId,
      itemId: chat.itemId,
      buyerId: user.uid === chat.participants[0] ? chat.participants[0] : chat.participants[1],
      sellerId: user.uid === chat.participants[0] ? chat.participants[1] : chat.participants[0],
      price: Number(dealPrice),
      duration: Number(dealDuration),
      pickupLocation: dealLocation,
      status: 'pending',
      createdAt: serverTimestamp(),
    };

    await setDoc(dealRef, newDeal);
    
    // Send a system message about the deal
    const systemMsgRef = doc(collection(db, 'chats', chatId!, 'messages'));
    await setDoc(systemMsgRef, {
      messageId: systemMsgRef.id,
      senderId: 'system',
      text: `💰 DEAL PROPOSED: ₹${dealPrice} for ${dealDuration} days at ${dealLocation}`,
      timestamp: serverTimestamp(),
    });

    setShowDealModal(false);
  };

  if (!user) return null;

  return (
    <div className="h-screen flex flex-col bg-slate-950">
      {/* Header */}
      <header className="glass-dark p-4 flex items-center gap-4 z-10">
        <button onClick={() => navigate(-1)} className="text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <img 
            src={chat?.itemImage} 
            alt={chat?.itemTitle} 
            className="w-10 h-10 rounded-lg object-cover"
            referrerPolicy="no-referrer"
          />
          <div>
            <h2 className="font-bold text-sm text-white truncate max-w-[150px]">{chat?.itemTitle}</h2>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Chatting with Owner</p>
          </div>
        </div>
        <button 
          onClick={() => setShowDealModal(true)}
          className="btn-primary py-2 px-4 text-xs"
        >
          Propose Deal
        </button>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === user.uid;
          const isSystem = msg.senderId === 'system';

          if (isSystem) {
            return (
              <div key={msg.messageId} className="flex justify-center my-4">
                <div className="glass px-4 py-2 rounded-full text-[10px] font-bold text-purple-300 uppercase tracking-widest border-purple-500/30">
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <div 
              key={msg.messageId} 
              className={cn(
                "flex flex-col max-w-[80%]",
                isMe ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div className={cn(
                "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                isMe ? "bg-purple-600 text-white rounded-tr-none" : "glass text-slate-100 rounded-tl-none"
              )}>
                {msg.text}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">
                {msg.timestamp?.toDate() ? format(msg.timestamp.toDate(), 'HH:mm') : ''}
              </span>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 glass-dark border-t border-white/10 flex gap-3">
        <input 
          type="text" 
          placeholder="Type a message..."
          className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-sm focus:border-purple-500 outline-none transition-all"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button 
          type="submit"
          className="w-12 h-12 btn-primary rounded-2xl flex items-center justify-center p-0"
        >
          <Send size={20} />
        </button>
      </form>

      {/* Deal Modal */}
      <AnimatePresence>
        {showDealModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDealModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm glass-dark p-8 rounded-3xl"
            >
              <h3 className="text-2xl font-display font-bold mb-6 flex items-center gap-2">
                <DollarSign className="text-purple-400" /> Propose a Deal
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Agreed Price (₹)</label>
                  <input 
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-purple-500 outline-none"
                    placeholder="e.g. 500"
                    value={dealPrice}
                    onChange={(e) => setDealPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Duration (Days)</label>
                  <input 
                    type="number" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-purple-500 outline-none"
                    placeholder="e.g. 3"
                    value={dealDuration}
                    onChange={(e) => setDealDuration(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Pickup Location</label>
                  <input 
                    type="text" 
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:border-purple-500 outline-none"
                    placeholder="e.g. Library Entrance"
                    value={dealLocation}
                    onChange={(e) => setDealLocation(e.target.value)}
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    onClick={() => setShowDealModal(false)}
                    className="flex-1 btn-secondary py-3"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleProposeDeal}
                    className="flex-1 btn-primary py-3"
                  >
                    Send Proposal
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatPage;
