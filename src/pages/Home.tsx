import React, { useState, useEffect } from 'react';
import { db, collection, query, orderBy, onSnapshot, where } from '../firebase';
import { Item, CATEGORIES, Category } from '../types';
import ItemCard from '../components/ItemCard';
import { Search, Filter, SlidersHorizontal, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Home = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'All'>('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'items'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        itemId: doc.id
      })) as Item[];
      setItems(itemsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="pb-24 pt-6 px-4 max-w-7xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">CampusCart</h1>
          <p className="text-sm text-slate-400">Find what you need today</p>
        </div>
        <button className="w-10 h-10 glass rounded-full flex items-center justify-center text-slate-300 relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></span>
        </button>
      </header>

      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input 
          type="text" 
          placeholder="Search for calculators, books, bikes..."
          className="w-full glass-dark rounded-2xl py-4 pl-12 pr-4 focus:ring-2 ring-purple-500/50 outline-none transition-all"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar mb-6">
        <button 
          onClick={() => setSelectedCategory('All')}
          className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            selectedCategory === 'All' 
            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
            : 'glass text-slate-400 hover:text-slate-200'
          }`}
        >
          All Items
        </button>
        {CATEGORIES.map((cat) => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              selectedCategory === cat 
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30' 
              : 'glass text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="glass-card aspect-[4/5] animate-pulse"></div>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <motion.div 
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <motion.div
                  key={item.itemId}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <ItemCard item={item} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center">
                <div className="w-20 h-20 glass rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                  <Search size={40} />
                </div>
                <h3 className="text-xl font-bold text-slate-300">No items found</h3>
                <p className="text-slate-500">Try adjusting your search or category filters</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default Home;
