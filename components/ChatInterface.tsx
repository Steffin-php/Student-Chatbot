
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Plus, Menu, LogOut, BookText, 
  ClipboardCheck, Cpu, Search, GraduationCap, 
  User as UserIcon, Bot, Sparkles, X
} from 'lucide-react';
import { User, ChatSession, Message, StudyMode } from '../types';
import { generateStudyResponse } from '../geminiService';

interface ChatInterfaceProps {
  user: User;
  onLogout: () => void;
  sessions: ChatSession[];
  setSessions: (sessions: ChatSession[] | ((prev: ChatSession[]) => ChatSession[])) => void;
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

  const handleSendMessage = async (e?: React.FormEvent, modeOverride?: StudyMode) => {
    if (e) e.preventDefault();
    const prompt = input.trim();
    const mode = modeOverride || studyMode || 'General';
    const finalPrompt = prompt || `Let's start a ${mode} session.`;

    if (!prompt && !modeOverride) return;

    let sessionId = activeSessionId;
    if (!sessionId) {
      const newId = Date.now().toString();
      const newSession: ChatSession = {
        id: newId,
        title: prompt.slice(0, 30) || `${mode} Session`,
        messages: [],
        createdAt: Date.now()
      };
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(newId);
      sessionId = newId;
    }

    const userMsg: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: finalPrompt,
      timestamp: Date.now()
    };

    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: [...s.messages, userMsg] } : s));
    setInput('');
    setIsLoading(true);

    try {
      const currentSess = sessions.find(s => s.id === sessionId);
      const history = currentSess?.messages || [];
      const aiContent = await generateStudyResponse(finalPrompt, history, mode);
      
      const botMsg: Message = {
        id: Date.now().toString() + '-bot',
        role: 'model',
        content: aiContent,
        timestamp: Date.now()
      };
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: [...s.messages, botMsg] } : s));
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const startMode = (mode: StudyMode) => {
    setStudyMode(mode);
    const newId = Date.now().toString();
    const newSess: ChatSession = {
      id: newId,
      title: `${mode} Chat`,
      messages: [],
      createdAt: Date.now()
    };
    setSessions(prev => [newSess, ...prev]);
    setActiveSessionId(newId);
    handleSendMessage(undefined, mode);
  };

  return (
    <div className="flex h-screen bg-transparent text-white overflow-hidden relative">
      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:relative z-50 w-72 h-full black-glass border-r border-white/10 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full p-5">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold flex items-center gap-2"><GraduationCap size={24}/> Tutor AI</h1>
            <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
          </div>
          
          <button 
            onClick={() => { setActiveSessionId(null); setStudyMode(null); setSidebarOpen(false); }} 
            className="flex items-center gap-3 w-full p-4 mb-8 rounded-2xl bg-white text-black font-bold hover:bg-white/90 transition-all shadow-xl"
          >
            <Plus size={18} /> New Chat
          </button>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            <h3 className="text-[10px] uppercase text-white/30 font-bold px-3 mb-2 tracking-widest">Chat History</h3>
            {sessions.map(s => (
              <button 
                key={s.id} 
                onClick={() => { setActiveSessionId(s.id); setSidebarOpen(false); }} 
                className={`w-full text-left p-4 rounded-2xl text-sm truncate transition-all border ${activeSessionId === s.id ? 'bg-white/10 border-white/20 text-white font-bold' : 'border-transparent text-white/50 hover:bg-white/5'}`}
              >
                {s.title}
              </button>
            ))}
          </div>

          <div className="pt-6 mt-4 border-t border-white/10">
            <div className="flex items-center gap-3 p-4 mb-3 rounded-2xl bg-white/5 border border-white/5">
              <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold text-lg">{user.name[0].toUpperCase()}</div>
              <div className="truncate flex-1">
                <div className="text-sm font-bold truncate">{user.name}</div>
                <div className="text-[10px] text-white/40 truncate uppercase font-bold tracking-tighter">Student Account</div>
              </div>
            </div>
            <button onClick={onLogout} className="flex items-center gap-3 w-full p-4 text-white/40 hover:text-white transition-all text-sm font-bold rounded-xl hover:bg-red-500/10"><LogOut size={18} /> Logout</button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        <header className="flex items-center justify-between p-5 border-b border-white/10 black-glass z-10">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-all" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="font-bold flex items-center gap-2 text-lg">
              {studyMode ? (
                <span className="flex items-center gap-2">
                  {studyMode === 'Notes' && <BookText size={20}/>}
                  {studyMode === 'Assignment' && <ClipboardCheck size={20}/>}
                  {studyMode === 'Project' && <Cpu size={20}/>}
                  {studyMode === 'Research' && <Search size={20}/>}
                  {studyMode === 'Study' && <GraduationCap size={20}/>}
                  {studyMode} Mode
                </span>
              ) : 'Start Tutoring'}
            </h2>
          </div>
          {studyMode && (
            <div className="hidden sm:block px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-[10px] font-bold tracking-widest uppercase text-emerald-400 animate-pulse">
              Active Session
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-12">
          {!activeSessionId ? (
            <div className="max-w-3xl mx-auto mt-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-block p-8 black-glass rounded-[2rem] mb-12 border-white/20 shadow-2xl">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">How can I help you, {user.name}?</h1>
                <p className="text-white/60 mb-12 text-lg font-medium">I'm your personal tutor, ready to tackle any subject together.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {[
                    { m: 'Notes', i: <BookText />, c: 'bg-blue-500' },
                    { m: 'Assignment', i: <ClipboardCheck />, c: 'bg-purple-500' },
                    { m: 'Project', i: <Cpu />, c: 'bg-emerald-500' },
                    { m: 'Research', i: <Search />, c: 'bg-yellow-500' },
                    { m: 'Study', i: <GraduationCap />, c: 'bg-rose-500' }
                  ].map(({m, i, c}) => (
                    <button 
                      key={m} 
                      onClick={() => startMode(m as StudyMode)} 
                      className="flex flex-col items-center gap-4 p-6 rounded-[1.5rem] border border-white/10 bg-white/5 hover:bg-white/10 hover:scale-105 transition-all group"
                    >
                      <div className={`${c} p-4 rounded-2xl text-white shadow-xl group-hover:rotate-12 transition-transform`}>{i}</div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-white/70 group-hover:text-white">{m}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8 pb-32">
              {activeSession?.messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse animate-in slide-in-from-right-4' : 'animate-in slide-in-from-left-4'} duration-300`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-white text-black' : 'black-glass border-white/20 text-white'}`}>
                    {msg.role === 'user' ? <UserIcon size={20}/> : <Bot size={20}/>}
                  </div>
                  <div className={`p-5 rounded-2xl text-sm leading-relaxed max-w-[85%] shadow-xl border ${msg.role === 'user' ? 'bg-white/10 border-white/10 font-medium' : 'black-glass'}`}>
                    <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 items-center text-white/40 text-xs font-bold ml-14 animate-pulse">
                  <Sparkles size={14} className="text-yellow-400" />
                  STUDENT BOT IS ANALYZING...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-6 bg-gradient-to-t from-black/50 to-transparent">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative group">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder={studyMode ? `Ask about your ${studyMode.toLowerCase()}...` : "Type a question or select a mode..."}
              className="w-full black-glass border border-white/20 rounded-2xl py-5 pl-7 pr-16 focus:outline-none focus:border-white/40 focus:bg-black/80 transition-all text-white font-medium text-lg placeholder:text-white/30 shadow-2xl"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-4 rounded-xl transition-all shadow-xl ${input.trim() ? 'bg-white text-black hover:scale-110 active:scale-95' : 'bg-white/5 text-white/10'}`}
            >
              <Send size={24} />
            </button>
          </form>
          <div className="text-center mt-4 text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">
            Vibrant Study Engine v2.0 • AI-Powered Tutoring
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatInterface;
