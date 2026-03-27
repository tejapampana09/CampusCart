import React from 'react';
import { Link } from 'react-router-dom';
import { Item } from '../types';
import { MapPin, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ItemCardProps {
  item: Item;
}

const ItemCard: React.FC<ItemCardProps> = ({ item }) => {
  return (
    <Link to={`/item/${item.itemId}`} className="glass-card overflow-hidden block group">
      <div className="aspect-square relative overflow-hidden">
        <img 
          src={item.imageURL} 
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 right-2 glass px-2 py-1 rounded-lg text-xs font-bold text-white">
          ₹{item.pricePerDay}/day
        </div>
        {item.status === 'rented' && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
              Rented
            </span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-100 truncate mb-1 group-hover:text-purple-400 transition-colors">
          {item.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
          <span className="bg-white/5 px-2 py-0.5 rounded-md">{item.category}</span>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold">
              {item.ownerName[0]}
            </div>
            <span className="text-xs text-slate-300 truncate max-w-[80px]">{item.ownerName}</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <Clock size={10} />
            <span>{formatDistanceToNow(item.createdAt?.toDate() || new Date())} ago</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ItemCard;
