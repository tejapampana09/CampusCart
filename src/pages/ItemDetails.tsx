import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, doc, getDoc, collection, addDoc, query, where, getDocs, serverTimestamp, setDoc } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Item, User, Chat } from '../types';
import { ArrowLeft, MessageSquare, ShieldCheck, User as UserIcon, Calendar, Info, Share2, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const ItemDetails = () => {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItem = async () => {
      if (!itemId) return;
      const itemDoc = await getDoc(doc(db, 'items', itemId));
      if (itemDoc.exists()) {
        const itemData = itemDoc.data() as Item;
        setItem({ ...itemData, itemId: itemDoc.id });
        
        const ownerDoc = await getDoc(doc(db, 'users', itemData.ownerId));
        if (ownerDoc.exists()) {
          setOwner(ownerDoc.data() as User);
        }
      }
      setLoading(false);
    };

    fetchItem();
  }, [itemId]);

  const handleStartChat = async () => {
    if (!user || !item) {
      navigate('/auth');
      return;
    }

    if (user.uid === item.ownerId) {
      alert("You cannot chat with yourself about your own item.");
      return;
    }

    // Check if chat already exists
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef, 
      where('participants', 'array-contains', user.uid),
      where('itemId', '==', item.itemId)
    );
    
    const querySnapshot = await getDocs(q);
    let existingChat: Chat | null = null;
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Chat;
      if (data.participants.includes(item.ownerId)) {
        existingChat = { ...data, chatId: doc.id };
      }
    });

    if (existingChat) {
      navigate(`/chat/${(existingChat as Chat).chatId}`);
    } else {
      const chatRef = doc(collection(db, 'chats'));
      const chatId = chatRef.id;

      const newChat: Chat = {
        chatId,
        participants: [user.uid, item.ownerId],
        itemId: item.itemId,
        itemTitle: item.title,
        itemImage: item.imageURL,
        lastMessage: '',
        lastMessageTimestamp: serverTimestamp(),
      };
      await setDoc(chatRef, newChat);
      navigate(`/chat/${chatId}`);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!item) return <div className="min-h-screen flex items-center justify-center">Item not found</div>;

  return (
    <div className="pb-24">
      <div className="relative h-[40vh] md:h-[60vh]">
        <img 
          src={item.imageURL} 
          alt={item.title} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 glass rounded-full flex items-center justify-center text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex gap-2">
            <button className="w-10 h-10 glass rounded-full flex items-center justify-center text-white">
              <Heart size={20} />
            </button>
            <button className="w-10 h-10 glass rounded-full flex items-center justify-center text-white">
              <Share2 size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-dark p-8 rounded-3xl"
        >
          <div className="flex justify-between items-start mb-4">
            <div>
              <span className="bg-purple-500/20 text-purple-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 inline-block">
                {item.category}
              </span>
              <h1 className="text-3xl font-display font-bold text-white mb-1">{item.title}</h1>
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <ShieldCheck size={16} className="text-green-400" />
                <span>Verified Listing</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-purple-400">₹{item.pricePerDay}</div>
              <div className="text-xs text-slate-500">per day</div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 glass rounded-2xl mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold">
              {owner?.name?.[0] || item.ownerName[0]}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-100">{owner?.name || item.ownerName}</h3>
              <p className="text-xs text-slate-400">Student • 4.8 ★ (24 reviews)</p>
            </div>
            <button className="text-purple-400 text-sm font-bold hover:underline">View Profile</button>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                <Info size={16} /> Description
              </h4>
              <p className="text-slate-400 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="glass p-4 rounded-xl">
                <h5 className="text-[10px] uppercase font-bold text-slate-500 mb-1">Availability</h5>
                <p className="text-sm font-medium text-slate-200 flex items-center gap-2">
                  <Calendar size={14} className="text-purple-400" />
                  {item.status === 'available' ? 'Available Now' : 'Currently Rented'}
                </p>
              </div>
              <div className="glass p-4 rounded-xl">
                <h5 className="text-[10px] uppercase font-bold text-slate-500 mb-1">Condition</h5>
                <p className="text-sm font-medium text-slate-200">Excellent</p>
              </div>
            </div>
          </div>

          <button 
            onClick={handleStartChat}
            disabled={item.status === 'rented'}
            className="w-full btn-primary py-4 flex items-center justify-center gap-3 text-lg"
          >
            <MessageSquare size={24} />
            {item.status === 'rented' ? 'Currently Unavailable' : 'Chat / Rent Now'}
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default ItemDetails;
