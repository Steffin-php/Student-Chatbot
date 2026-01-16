
import React, { useState } from 'react';
import { ArrowLeft, Mail, Lock, User as UserIcon, CheckCircle, ChevronRight, Hash } from 'lucide-react';
import { User } from '../types';

interface AuthPageProps {
  initialMode: 'login' | 'signup';
  onSuccess: (user: User) => void;
  onBack: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ initialMode, onSuccess, onBack }) => {
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot' | 'verify'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    if (mode === 'login') {
      if (email && password) {
        onSuccess({ id: 'u1', name: email.split('@')[0], email, role: 'student' });
      } else {
        setMessage({ type: 'error', text: 'Please fill in your email and password.' });
      }
    } else if (mode === 'signup') {
      if (!name || !email || !password || !confirmPassword) {
        setMessage({ type: 'error', text: 'All fields are required for sign up.' });
      } else if (password !== confirmPassword) {
        setMessage({ type: 'error', text: 'Passwords do not match.' });
      } else {
        onSuccess({ id: 'u2', name, email, role: 'student' });
      }
    } else if (mode === 'forgot') {
      if (email) {
        setMessage({ type: 'success', text: 'Reset code sent to your Gmail!' });
        setTimeout(() => setMode('verify'), 1000);
      } else {
        setMessage({ type: 'error', text: 'Please enter your email to get a code.' });
      }
    } else if (mode === 'verify') {
      if (code.length === 6) {
        setMessage({ type: 'success', text: 'Code verified! Please set a new password.' });
        setTimeout(() => setMode('login'), 2000);
      } else {
        setMessage({ type: 'error', text: 'Invalid 6-digit code.' });
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-md mx-auto justify-center">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors w-fit"
      >
        <ArrowLeft size={18} />
        Back
      </button>

      <div className="mb-10">
        <h2 className="text-3xl font-bold mb-2">
          {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Forgot Password' : 'Verify Code'}
        </h2>
        <p className="text-white/50">
          {mode === 'login' ? 'Sign in to access your study notes and history.' : 
           mode === 'signup' ? 'Start your journey with your personal AI tutor.' : 
           mode === 'forgot' ? 'We will send a security code to your Gmail.' :
           'Enter the 6-digit code sent to your inbox.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/40 uppercase tracking-wider ml-1">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Student Name"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-white/30 transition-all"
                required
              />
            </div>
          </div>
        )}

        {(mode !== 'verify') && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/40 uppercase tracking-wider ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gmail.com"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-white/30 transition-all"
                required
              />
            </div>
          </div>
        )}

        {mode === 'verify' && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/40 uppercase tracking-wider ml-1">6-Digit Code</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                type="text" 
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-white/30 transition-all text-center tracking-widest text-lg font-bold"
                required
              />
            </div>
          </div>
        )}

        {(mode === 'login' || mode === 'signup') && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/40 uppercase tracking-wider ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-white/30 transition-all"
                required
              />
            </div>
          </div>
        )}

        {mode === 'signup' && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-white/40 uppercase tracking-wider ml-1">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-white/30 transition-all"
                required
              />
            </div>
          </div>
        )}

        {message && (
          <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            {message.type === 'success' && <CheckCircle size={18} />}
            <span className="text-sm font-medium">{message.text}</span>
          </div>
        )}

        <button 
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 mt-4"
        >
          {isSubmitting ? 'Processing...' : 
            mode === 'login' ? 'Sign In' : 
            mode === 'signup' ? 'Create Account' : 
            mode === 'forgot' ? 'Get Code' : 'Verify'}
          {!isSubmitting && <ChevronRight size={20} />}
        </button>
      </form>

      <div className="mt-8 flex flex-col gap-4 items-center text-sm">
        {mode === 'login' && (
          <button 
            onClick={() => setMode('forgot')}
            className="text-white/40 hover:text-white transition-colors"
          >
            Forgot password?
          </button>
        )}

        <div className="text-white/40">
          {mode === 'login' ? (
            <>Don't have an account? <button onClick={() => setMode('signup')} className="text-white font-medium ml-1">Sign Up</button></>
          ) : (
            <>Already have an account? <button onClick={() => setMode('login')} className="text-white font-medium ml-1">Login</button></>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
