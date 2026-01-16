
import React from 'react';
import { GraduationCap, ChevronRight, Sparkles } from 'lucide-react';

interface LandingPageProps {
  onNavigateAuth: (mode: 'login' | 'signup') => void;
  onTryForFree: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateAuth, onTryForFree }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="black-glass p-12 rounded-[2.5rem] shadow-2xl max-w-3xl w-full border border-white/20">
        <div className="mb-8 inline-flex p-5 bg-white rounded-2xl text-black shadow-lg">
          <GraduationCap size={48} />
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-white">
          Student Chatbot
        </h1>
        
        <p className="text-lg md:text-xl text-white/70 mb-12 leading-relaxed font-medium">
          The ultimate personal tutor for notes, assignments, research, and deep study.
          Unlock your full academic potential today.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
          <button 
            onClick={() => onNavigateAuth('login')}
            className="flex-1 px-8 py-5 bg-white text-black font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xl"
          >
            Login
            <ChevronRight size={18} />
          </button>
          
          <button 
            onClick={() => onNavigateAuth('signup')}
            className="flex-1 px-8 py-5 bg-black/40 border border-white/20 text-white font-bold rounded-2xl hover:bg-black/60 transition-all shadow-xl"
          >
            Sign Up
          </button>
        </div>
        
        <button 
          onClick={onTryForFree}
          className="mt-10 text-white/50 hover:text-white transition-colors text-sm font-bold flex items-center justify-center gap-2 mx-auto"
        >
          <Sparkles size={14} className="text-yellow-400" />
          Try for Free
        </button>
      </div>
    </div>
  );
};

export default LandingPage;
