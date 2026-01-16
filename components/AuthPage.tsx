
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
        setMessage({ type: 'error', text: 'All fields are required.' });
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
        setMessage({ type: 'success', text: 'Verified! Please set a new password.' });
        setTimeout(() => setMode('login'), 2000);
      } else {
        setMessage({ type: 'error', text: 'Invalid 6-digit code.' });
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col p-6 items-center justify-center">
      <div className="black-glass p-8 md:p-10 rounded-[2rem] w-full max-w-md shadow-2xl border border-white/20">
        <button 
          onClick={onBack}
          className="mb-8 flex items-center gap-2 text-white/50 hover:text-white transition-colors w-fit font-semibold"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Reset Password' : 'Verify Code'}
          </h2>
          <p className="text-white/50 font-medium">
            {mode === 'login' ? 'Continue your learning journey.' : 
             mode === 'signup' ? 'Join thousands of students learning faster.' : 
             mode === 'forgot' ? 'Enter your email for a security code.' :
             'Check your Gmail for the 6-digit code.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full Name"
                className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all text-white font-medium"
                required
              />
            </div>
          )}

          {(mode !== 'verify') && (
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Gmail Address"
                className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all text-white font-medium"
                required
              />
            </div>
          )}

          {mode === 'verify' && (
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                type="text" 
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                placeholder="000 000"
                className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-white/40 transition-all text-center tracking-[0.5em] text-xl font-bold text-white"
                required
              />
            </div>
          )}

          {(mode === 'login' || mode === 'signup') && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all text-white font-medium"
                required
              />
            </div>
          )}

          {mode === 'signup' && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
              <input 
                type="password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="w-full bg-white/10 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-white/40 focus:bg-white/15 transition-all text-white font-medium"
                required
              />
            </div>
          )}

          {message && (
            <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/20 text-red-400 border border-red-500/20'}`}>
              {message.type === 'success' && <CheckCircle size={18} />}
              <span className="text-sm font-bold">{message.text}</span>
            </div>
          )}

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-white text-black font-bold py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 shadow-xl"
          >
            {isSubmitting ? 'One moment...' : 
              mode === 'login' ? 'Sign In' : 
              mode === 'signup' ? 'Create Account' : 
              mode === 'forgot' ? 'Get Code' : 'Verify'}
            {!isSubmitting && <ChevronRight size={20} />}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-4 items-center text-sm font-medium">
          {mode === 'login' && (
            <button 
              onClick={() => setMode('forgot')}
              className="text-white/40 hover:text-white transition-colors"
            >
              Forgot your password?
            </button>
          )}

          <div className="text-white/40">
            {mode === 'login' ? (
              <>New here? <button onClick={() => setMode('signup')} className="text-white font-bold underline ml-1">Create account</button></>
            ) : (
              <>Already have an account? <button onClick={() => setMode('login')} className="text-white font-bold underline ml-1">Login</button></>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
