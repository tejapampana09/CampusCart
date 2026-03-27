import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Repeat, DollarSign, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-4xl mx-auto"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-sm font-medium text-purple-300 mb-8 border-purple-500/30">
          <Zap size={16} className="text-yellow-400" />
          <span>The Ultimate Campus Marketplace</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-display font-bold mb-6 tracking-tight leading-none">
          Rent Anything on <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500">
            Campus
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          CampusCart is the first student-only platform to rent, lend, or exchange items. Save money, earn extra, and build a sustainable community.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
          <Link to="/auth" className="btn-primary flex items-center justify-center gap-2 group">
            Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/home" className="btn-secondary flex items-center justify-center gap-2">
            Explore Marketplace
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {[
            { icon: ShoppingBag, title: 'Rent Items', desc: 'Need a calculator for a day? Rent it from a peer for a fraction of the cost.' },
            { icon: DollarSign, title: 'Earn Money', desc: 'Have items lying around? List them and earn passive income while helping others.' },
            { icon: Repeat, title: 'Exchange', desc: 'Exchange books or equipment temporarily with students in your department.' }
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-card p-6"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4">
                <feature.icon size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <footer className="mt-20 text-slate-500 text-sm flex items-center gap-4">
        <div className="flex items-center gap-1">
          <ShieldCheck size={16} />
          <span>Verified Students Only</span>
        </div>
        <div className="flex items-center gap-1">
          <Users size={16} />
          <span>1,000+ Active Users</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
