
import React from 'react';
import { BookOpen, Sparkles, GraduationCap, ChevronRight } from 'lucide-react';

interface LandingPageProps {
  onNavigateAuth: (mode: 'login' | 'signup') => void;
  onTryForFree: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateAuth, onTryForFree }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10">
        <GraduationCap size={48} className="text-white" />
      </div>
      
      <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
        Student <span className="text-white/60">Chatbot</span>
      </h1>
      
      <p className="text-lg md:text-xl text-white/50 max-w-2xl mb-12 leading-relaxed">
        Your personal AI tutor for notes, assignments, research, and deep concept understanding. 
        Learn faster, better, and more efficiently.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <button 
          onClick={() => onNavigateAuth('login')}
          className="flex-1 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-white/90 transition-all flex items-center justify-center gap-2 group"
        >
          Login
          <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
        </button>
        
        <button 
          onClick={() => onNavigateAuth('signup')}
          className="flex-1 px-8 py-4 bg-black border border-white/20 text-white font-semibold rounded-full hover:bg-white/10 transition-all"
        >
          Sign Up
        </button>
      </div>
      
      <button 
        onClick={onTryForFree}
        className="mt-8 text-white/40 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
      >
        <Sparkles size={14} />
        Or just try for free
      </button>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full text-left">
        <FeatureCard 
          icon={<BookOpen size={20} />}
          title="Concept Mastery"
          description="From basics to advanced. We explain everything like a patient tutor."
        />
        <FeatureCard 
          icon={<Sparkles size={20} />}
          title="Study Partner"
          description="Help with projects, assignments, and research across all subjects."
        />
        <FeatureCard 
          icon={<GraduationCap size={20} />}
          title="Summarized Learning"
          description="Every session ends with revision points to help you remember longer."
        />
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <div className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]">
    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-4 text-white">
      {icon}
    </div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <p className="text-white/40 leading-relaxed text-sm">{description}</p>
  </div>
);

export default LandingPage;
