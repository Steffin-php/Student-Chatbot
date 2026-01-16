
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
      title: initialMode ? `${initialMode} Session` : 'New Chat',
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
    const finalPrompt = prompt || `Start my ${targetMode} session.`;

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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative z-50 w-72 h-full bg-white/5 backdrop-blur-3xl border-r border-white/10 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-4">
          <button 
            onClick={() => createNewChat()}
            className="flex items-center gap-3 w-full p-4 mb-6 rounded-2xl bg-white text-blue-900 shadow-2xl hover:bg-white/90 transition-all text-sm font-bold"
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
                    ? 'bg-white/20 border-white/30 text-white font-medium' 
                    : 'text-white/60 border-transparent hover:bg-white/10'
                }`}
              >
                {s.title}
              </button>
            ))}
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
            <button onClick={onLogout} className="flex items-center gap-3 w-full p-3 text-white/60 hover:text-white text-xs">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden bg-transparent">
        <header className="flex items-center justify-between p-4 border-b border-white/10 lg:px-8 bg-white/10 backdrop-blur-xl z-10 shadow-xl">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 text-white/70" onClick={() => setSidebarOpen(true)}><Menu size={24} /></button>
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <GraduationCap className="text-white" size={24} />
              Student Chatbot
            </h2>
          </div>
          {studyMode && (
            <div className="px-3 py-1 rounded-full bg-white/20 border border-white/30 text-[10px] font-bold text-white uppercase">
              {studyMode} Mode
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-8 lg:px-12">
          {!activeSessionId || activeSession?.messages.length === 0 ? (
            <div className="max-w-3xl mx-auto mt-12 text-center">
              <div className="inline-block p-6 bg-white/15 backdrop-blur-2xl rounded-3xl mb-8 border border-white/30 shadow-2xl">
                <Sparkles size={48} className="text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-xl">Let's Study!</h1>
              <p className="text-white/80 mb-12 max-w-lg mx-auto">Choose a mode or start typing below.</p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {['Notes', 'Assignment', 'Project', 'Research', 'Study'].map(m => (
                  <ModeButton 
                    key={m} 
                    icon={m === 'Notes' ? <BookText /> : m === 'Assignment' ? <ClipboardCheck /> : m === 'Project' ? <Cpu /> : m === 'Research' ? <Search /> : <GraduationCap />} 
                    label={m} 
                    onClick={() => handleModeClick(m as StudyMode)} 
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8 pb-32">
              {activeSession?.messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${msg.role === 'user' ? 'bg-blue-600' : 'bg-white text-blue-800'}`}>
                    {msg.role === 'user' ? <UserIcon size={20} /> : <Bot size={20} />}
                  </div>
                  <div className={`max-w-[85%] rounded-2xl p-5 text-sm shadow-xl border ${msg.role === 'user' ? 'bg-blue-800/40 border-white/10' : 'bg-white/10 border-white/20 backdrop-blur-2xl'}`}>
                    <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap font-medium">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white text-blue-800 flex items-center justify-center animate-pulse"><Bot size={20} /></div>
                  <div className="px-6 py-4 bg-white/10 rounded-2xl backdrop-blur-xl border border-white/20">
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce inline-block mx-0.5"></span>
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce inline-block mx-0.5" style={{animationDelay: '0.2s'}}></span>
                    <span className="w-2 h-2 bg-white rounded-full animate-bounce inline-block mx-0.5" style={{animationDelay: '0.4s'}}></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/40 to-transparent pt-12">
          <form onSubmit={(e) => handleSendMessage(e)} className="max-w-4xl mx-auto relative">
            <input 
              type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Type a topic or question..."
              className="w-full bg-white/20 border border-white/30 rounded-2xl py-5 pl-7 pr-16 focus:outline-none focus:border-white/60 transition-all text-white"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()} className={`absolute right-2.5 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl flex items-center justify-center ${input.trim() ? 'bg-white text-blue-700' : 'bg-white/10 text-white/30'}`}>
              <Send size={20} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

const ModeButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-4 p-5 rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 transition-all backdrop-blur-2xl">
    <div className="text-white/60">{icon}</div>
    <span className="text-xs font-bold text-white/80">{label}</span>
  </button>
);

export default ChatIn
