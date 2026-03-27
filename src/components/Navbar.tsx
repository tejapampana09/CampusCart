import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, MessageSquare, User as UserIcon, PlusCircle, Search } from 'lucide-react';
import { cn } from '../lib/utils';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { icon: Search, label: 'Marketplace', path: '/home' },
    { icon: PlusCircle, label: 'List Item', path: '/add' },
    { icon: MessageSquare, label: 'Messages', path: '/chats' },
  ];

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 glass-dark border-b border-white/10 px-8 py-4 justify-between items-center z-50">
      <Link to="/" className="text-2xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
        CampusCart
      </Link>

      <div className="flex items-center gap-8">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-all",
                isActive ? "text-purple-400" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <Link to="/profile" className="flex items-center gap-3 glass px-4 py-2 rounded-full hover:bg-white/10 transition-all">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold">
              {user.profilePic ? (
                <img src={user.profilePic} alt={user.name} className="w-full h-full rounded-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user.name[0]
              )}
            </div>
            <span className="text-sm font-medium text-slate-200">{user.name}</span>
          </Link>
        ) : (
          <Link to="/auth" className="btn-primary py-2 px-6 text-sm">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
