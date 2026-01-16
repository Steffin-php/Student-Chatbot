import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthPage from './components/AuthPage';
import ChatInterface from './components/ChatInterface';
import { User, ChatSession } from './types';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'landing' | 'auth' | 'chat'>('landing');
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [sessions, setSessions] = useState<ChatSession[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('student_chatbot_user');
    const savedSessions = localStorage.getItem('student_chatbot_sessions');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentPage('chat');
    }
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('student_chatbot_user', JSON.stringify(userData));
    setCurrentPage('chat');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('student_chatbot_user');
    setCurrentPage('landing');
  };

  const navigateToAuth = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setCurrentPage('auth');
  };

  const handleTryForFree = () => {
    const guestUser: User = {
      id: 'guest-' + Date.now(),
      name: 'Guest Learner',
      email: 'guest@example.com',
      role: 'guest'
    };
    handleLogin(guestUser);
  };

  return (
    <div className="min-h-screen bg-transparent">
      {currentPage === 'landing' && (
        <LandingPage 
          onNavigateAuth={navigateToAuth} 
          onTryForFree={handleTryForFree} 
        />
      )}
      
      {currentPage === 'auth' && (
        <AuthPage 
          initialMode={authMode} 
          onSuccess={handleLogin} 
          onBack={() => setCurrentPage('landing')} 
        />
      )}
      
      {currentPage === 'chat' && user && (
        <ChatInterface 
          user={user} 
          onLogout={handleLogout}
          sessions={sessions}
          setSessions={(s) => {
            setSessions(s);
            localStorage.setItem('student_chatbot_sessions', JSON.stringify(s));
          }}
        />
      )}
    </div>
  );
};

export default App;
