import React, { useState, useEffect } from 'react';
import { db, collection, query, where, onSnapshot, signOut, auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Item, Deal } from '../types';
import ItemCard from '../components/ItemCard';
import { Settings, LogOut, Package, Repeat, Star, Edit2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [activeTab, setActiveTab] = useState<'listings' | 'rentals'>('listings');

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'items'), where('ownerId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ ...doc.data(), itemId: doc.id })) as Item[];
      setMyItems(items);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="pb-24 pt-6 px-4 max-w-4xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-display font-bold">My Profile</h1>
        <div className="flex gap-2">
          <button className="w-10 h-10 glass rounded-full flex items-center justify-center text-slate-300">
            <Settings size={20} />
          </button>
          <button 
            onClick={handleLogout}
            className="w-10 h-10 glass rounded-full flex items-center justify-center text-red-400"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <div className="glass-dark p-8 rounded-3xl mb-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold border-4 border-white/10">
            {user.profilePic ? (
              <img src={user.profilePic} alt={user.name} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              user.name[0]
            )}
          </div>
          <button className="absolute bottom-0 right-0 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center border-2 border-slate-900 text-white">
            <Edit2 size={14} />
          </button>
        </div>
        <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
        <p className="text-slate-400 text-sm mb-4">{user.email}</p>
        <div className="flex justify-center gap-6">
          <div className="text-center">
            <div className="text-xl font-bold text-white">4.9</div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Rating</div>
          </div>
          <div className="w-[1px] h-8 bg-white/10 self-center"></div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">{myItems.length}</div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Listings</div>
          </div>
          <div className="w-[1px] h-8 bg-white/10 self-center"></div>
          <div className="text-center">
            <div className="text-xl font-bold text-white">12</div>
            <div className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Deals</div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('listings')}
          className={`flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'listings' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'glass text-slate-400'
          }`}
        >
          <Package size={18} /> My Listings
        </button>
        <button 
          onClick={() => setActiveTab('rentals')}
          className={`flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
            activeTab === 'rentals' ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' : 'glass text-slate-400'
          }`}
        >
          <Repeat size={18} /> Active Rentals
        </button>
      </div>

      {activeTab === 'listings' ? (
        <div className="grid grid-cols-2 gap-4">
          {myItems.length > 0 ? (
            myItems.map(item => <ItemCard key={item.itemId} item={item} />)
          ) : (
            <div className="col-span-full py-12 text-center glass rounded-3xl">
              <p className="text-slate-500">You haven't listed any items yet.</p>
              <button 
                onClick={() => navigate('/add')}
                className="text-purple-400 font-bold mt-2 hover:underline"
              >
                List your first item
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="glass p-6 rounded-3xl text-center">
            <p className="text-slate-500">No active rentals at the moment.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
