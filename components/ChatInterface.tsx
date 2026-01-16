import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Plus, 
  Menu, 
  X, 
  LogOut, 
  BookText, 
  ClipboardCheck, 
  Cpu, 
  Search, 
  GraduationCap,
  ChevronRight,
  User as UserIcon,
  Bot,
  Sparkles
} from 'lucide-react';
import { User, ChatSession, Message, StudyMode } from '../types';
import { generateStudyResponse } from '../geminiService';

interface ChatInterfaceProps {
  user: User;
  onLogout: () => void;
  sessions: ChatSession[];
  setSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, onLogout, sessions, setSessions }) => {
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [studyMode, setStudyMode] = useState<StudyMode | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, isLoading]);

  const triggerAIResponse = async (sessionId: string, userPrompt: string, mode: StudyMode) => {
    setIsLoading(true);
    try {
      const currentSess = sessions.find(s => s.id === sessionId);
      const history = currentSess?.messages.slice(0, -1) || [];
      const aiContent = await generateStudyResponse(userPrompt, history, mode);
      
      const botMessage: Message = {
        id: Date.now().toString() + '-bot',
        role: 'model',
        content: aiContent,
        timestamp: Date.now()
      };

      setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          return { ...s, messages: [...s.messages, botMessage] };
        }
        return s;
      }));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const createNewChat = (initialMode: StudyMode | null = null) => {
    const newId = Date.now().toString();
    const newSession: ChatSession = {
      id: newId,
      title: initialMode ? `${initialMode} Session` : 'New Study Session',
      messages: [],
      createdAt: Date.now()
    };
    
    setSessions([newSession, ...sessions]);
    setActiveSessionId(newId);
    setStudyMode(initialMode);
    setSidebarOpen(false);

    if (initialMode) {
      handleSendMessage(undefined, initialMode, newId);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, modeOverride?: StudyMode, sessionIdOverride?: string) => {
    if (e) e.preventDefault();
    const prompt = input.trim();
    const targetMode = modeOverride || studyMode || 'General';
    const targetSessionId = sessionIdOverride || activeSessionId;
    const finalPrompt = prompt || `I want to start a new ${targetMode} session. Please introduce yourself as my ${targetMode} tutor.`;

    if (!finalPrompt && !modeOverride) return;

    let currentSessionId = targetSessionId;
    if (!currentSessionId) {
      const newId = Date.now().toString();
      const newSession: ChatSession = {
        id: newId,
        title: prompt.slice(0, 30) || `${targetMode} Session`,
        messages: [],
        createdAt: Date.now()
      };
      setSessions([newSession, ...sessions]);
      setActiveSessionId(newId);
      currentSessionId = newId;
    }

    const newUserMessage: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: finalPrompt,
      timestamp: Date.now()
    };

    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const newTitle = s.messages.length === 0 ? (prompt.slice(0, 30) || `${targetMode} Session`) : s.title;
        return { ...s, title: newTitle, messages: [...s.messages, newUserMessage] };
      }
      return s;
    }));

    setInput('');
    if (modeOverride) setStudyMode(modeOverride);
    await triggerAIResponse(currentSessionId!, finalPrompt, targetMode);
  };

  const handleModeClick = (mode: StudyMode) => {
    createNewChat(mode);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-transparent">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative z-50 w-72 h-full bg-slate-950/30 backdrop-blur-3xl border-r border-white/10 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-4">
          <button 
            onClick={() => createNewChat()}
            className="flex items-center gap-3 w-full p-4 mb-6 rounded-2xl bg-white text-blue-800 shadow-xl hover:bg-white/90 transition-all text-sm font-bold"
          >
            <Plus size={18} />
            New Chat
          </button>

          <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
            <h3 className="text-[10px] uppercase tracking-widest text-white/50 font-bold px-2 mb-2">History</h3>
            {sessions.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSessionId(s.id);
                  setSidebarOpen(false);
                }}
                className={`w-full text-left p-3 rounded-xl text-sm transition-all truncate border ${
                  activeSessionId === s.id 
                    ? 'bg-white/20 border-white/30 text-white font-medium shadow-lg' 
                    : 'text-white/60 border-transparent hover:bg-white/10 hover:text-white'
                }`}
              >
                {s.title}
              </button>
            ))}
            {sessions.length === 0 && (
              <div className="text-xs text-white/30 px-2 py-4 italic">No sessions yet</div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-3 mb-2 rounded-xl bg-white/10 border border-white/10">
              <div className="w-10 h-10 rounded-full bg-white text-blue-700 flex items-center justify-center font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-white">{user.name}</p>
                <p className="text-[10px] text-white/50 truncate">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 w-full p-3 rounded-xl text-white/60 hover:text-red-200 hover:bg-red-500/20 transition-all text-xs"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-transparent">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-white/10 lg:px-8 bg-white/10 backdrop-blur-xl z-10 shadow-lg">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 text-white/70 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <GraduationCap className="text-white" size={24} />
              Student <span className="opacity-90">Chatbot</span>
            </h2>
          </div>
          {studyMode && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 text-[10px] uppercase tracking-wider font-bold text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              {studyMode} Mode
            </div>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-8 lg:px-12">
          {!activeSessionId || activeSession?.messages.length === 0 ? (
            <div className="max-w-3xl mx-auto mt-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-block p-6 bg-white/15 backdrop-blur-2xl rounded-3xl mb-8 border border-white/30 shadow-2xl">
                <Sparkles size={48} className="text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-xl">Let's start learning!</h1>
              <p className="text-white/80 mb-12 max-w-lg mx-auto leading-relaxed font-medium">
                Choose a mode below or just type your question to begin.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <ModeButton 
                  icon={<BookText size={22} />} 
                  label="Notes" 
                  onClick={() => handleModeClick('Notes')} 
                />
                <ModeButton 
                  icon={<ClipboardCheck size={22} />} 
                  label="Assignment" 
                  onClick={() => handleModeClick('Assignment')} 
                />
                <ModeButton 
                  icon={<Cpu size={22} />} 
                  label="Project" 
                  onClick={() => handleModeClick('Project')} 
                />
                <ModeButton 
                  icon={<Search size={22} />} 
                  label="Research" 
                  onClick={() => handleModeClick('Research')} 
                />
                <ModeButton 
                  icon={<GraduationCap size={22} />} 
                  label="Study" 
                  onClick={() => handleModeClick('Study')} 
                />
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8 pb-32">
              {activeSession?.messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in duration-300`}>
                  <div className={`
                    w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center shadow-lg
                    ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-blue-800'}
                  `}>
                    {msg.role === 'user' ? <UserIcon size={20} /> : <Bot size={20} />}
                  </div>
                  <div className={`
                    max-w-[85%] rounded-2xl p-5 text-sm leading-relaxed shadow-xl border
                    ${msg.role === 'user' 
                      ? 'bg-blue-700/40 text-white border-white/20 backdrop-blur-md' 
                      : 'bg-white/15 text-white border-white/20 backdrop-blur-2xl'}
                  `}>
                    <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap font-medium">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white text-blue-800 flex-shrink-0 flex items-center justify-center animate-pulse">
                    <Bot size={20} />
                  </div>
                  <div className="flex gap-2 items-center px-6 py-4 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20">
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></span>
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce delay-300"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/20 to-transparent pt-12 backdrop-blur-sm">
          <form 
            onSubmit={(e) => handleSendMessage(e)}
            className="max-w-4xl mx-auto relative group"
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={studyMode ? `Ask me about your ${studyMode.toLowerCase()}...` : "Type a topic or question..."}
              className="w-full bg-white/20 border border-white/30 rounded-2xl py-5 pl-7 pr-16 focus:outline-none focus:border-white/60 transition-all text-base placeholder:text-white/60 backdrop-blur-2xl shadow-2xl text-white font-medium"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`
                absolute right-2.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl flex items-center justify-center transition-all
                ${input.trim() ? 'bg-white text-blue-700 shadow-xl hover:scale-105 active:scale-95' : 'bg-white/10 text-white/30 cursor-not-allowed'}
              `}
            >
              <Send size={20} />
            </button>
          </form>
          <p className="text-[11px] text-center text-white/50 mt-5 uppercase tracking-widest font-bold">
            Focused Study Mode • Vibrant Blue & Green Theme
          </p>
        </div>
      </main>
    </div>
  );
};

const ModeButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-4 p-5 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 hover:border-white/40 transition-all group backdrop-blur-2xl shadow-xl"
  >
    <div className="text-white/60 group-hover:text-white transition-colors group-hover:scale-110 duration-300">
      {icon}
    </div>
    <span className="text-xs font-bold text-white/80 group-hover:text-white tracking-wide">{label}</span>
  </button>
);

export default ChatInterface
