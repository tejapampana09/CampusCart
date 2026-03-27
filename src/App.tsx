import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Home from './pages/Home';
import ItemDetails from './pages/ItemDetails';
import Chat from './pages/Chat';
import ChatList from './pages/ChatList';
import AddItem from './pages/AddItem';
import Profile from './pages/Profile';
import BottomNav from './components/BottomNav';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { firebaseUser, loading } = useAuth();
  if (loading) return null;
  if (!firebaseUser) return <Navigate to="/auth" />;
  return <>{children}</>;
};

const AppContent = () => {
  const { firebaseUser } = useAuth();

  return (
    <Router>
      <Navbar />
      <main className="md:pt-20">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={firebaseUser ? <Navigate to="/home" /> : <Auth />} />
          <Route path="/home" element={<Home />} />
          <Route path="/explore" element={<Home />} />
          <Route path="/item/:itemId" element={<ItemDetails />} />
          
          <Route path="/chat/:chatId" element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } />
          
          <Route path="/chats" element={
            <ProtectedRoute>
              <ChatList />
            </ProtectedRoute>
          } />
          
          <Route path="/add" element={
            <ProtectedRoute>
              <AddItem />
            </ProtectedRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      {firebaseUser && <BottomNav />}
    </Router>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
