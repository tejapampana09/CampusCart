import React, { useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot, orderBy } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Chat } from '../types';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Search } from 'lucide-react';

const ChatList = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', user.uid),
      orderBy('lastMessageTimestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const chatsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        chatId: doc.id
      })) as Chat[];
      setChats(chatsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  if (!user) return null;

  return (
    <div className="pb-24 pt-6 px-4 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-display font-bold">Messages</h1>
        <p className="text-sm text-slate-400">Negotiate and close deals</p>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text" 
          placeholder="Search chats..."
          className="w-full glass rounded-xl py-3 pl-12 pr-4 focus:ring-2 ring-purple-500/50 outline-none transition-all"
        />
      </div>

      <div className="space-y-3">
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="h-20 glass rounded-2xl animate-pulse"></div>)
        ) : chats.length > 0 ? (
          chats.map((chat) => (
            <Link 
              key={chat.chatId} 
              to={`/chat/${chat.chatId}`}
              className="glass-card p-4 flex items-center gap-4 group"
            >
              <div className="relative">
                <img 
                  src={chat.itemImage} 
                  alt={chat.itemTitle} 
                  className="w-14 h-14 rounded-xl object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold border-2 border-slate-900">
                  {chat.itemTitle[0]}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-slate-100 truncate group-hover:text-purple-400 transition-colors">
                    {chat.itemTitle}
                  </h3>
                  <span className="text-[10px] text-slate-500 whitespace-nowrap">
                    {chat.lastMessageTimestamp?.toDate() ? formatDistanceToNow(chat.lastMessageTimestamp.toDate()) + ' ago' : ''}
                  </span>
                </div>
                <p className="text-sm text-slate-400 truncate">
                  {chat.lastMessage || 'Start a conversation...'}
                </p>
              </div>
            </Link>
          ))
        ) : (
          <div className="py-20 text-center glass rounded-3xl">
            <div className="w-16 h-16 glass rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
              <MessageSquare size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-300">No messages yet</h3>
            <p className="text-slate-500 text-sm">Start a chat from an item page</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;
