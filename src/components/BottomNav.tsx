import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, MessageSquare, User } from 'lucide-react';
import { cn } from '../lib/utils';

const BottomNav = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/home' },
    { icon: Search, label: 'Explore', path: '/explore' },
    { icon: PlusSquare, label: 'Add', path: '/add' },
    { icon: MessageSquare, label: 'Chat', path: '/chats' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-dark border-t border-white/10 px-4 py-2 flex justify-around items-center z-50 md:hidden">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex flex-col items-center gap-1 p-2 transition-all",
              isActive ? "text-purple-400 scale-110" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <Icon size={24} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
