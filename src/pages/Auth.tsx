import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, googleProvider, signInWithPopup } from '../firebase';
import { motion } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Chrome } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/home');
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md glass-dark p-8 rounded-3xl"
      >
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-bold mb-2">
            {isLogin ? 'Welcome Back' : 'Join CampusCart'}
          </h2>
          <p className="text-slate-400">
            {isLogin ? 'Login to continue your journey' : 'Create an account to start trading'}
          </p>
        </div>

        <div className="space-y-4">
          <button 
            onClick={handleGoogleLogin}
            className="w-full btn-secondary flex items-center justify-center gap-3 py-3"
          >
            <Chrome size={20} className="text-blue-400" />
            Continue with Google
          </button>

          <div className="flex items-center gap-4 my-6">
            <div className="h-[1px] flex-1 bg-white/10"></div>
            <span className="text-xs text-slate-500 uppercase font-bold tracking-widest">or</span>
            <div className="h-[1px] flex-1 bg-white/10"></div>
          </div>

          {!isLogin && (
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
              <input 
                type="text" 
                placeholder="Full Name"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-purple-500 outline-none transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="email" 
              placeholder="Email Address"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-purple-500 outline-none transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
            <input 
              type="password" 
              placeholder="Password"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 focus:border-purple-500 outline-none transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="w-full btn-primary flex items-center justify-center gap-2 py-3 mt-4">
            {isLogin ? 'Login' : 'Sign Up'} <ArrowRight size={20} />
          </button>
        </div>

        <div className="mt-8 text-center text-sm">
          <span className="text-slate-400">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-400 font-bold hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Login'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
