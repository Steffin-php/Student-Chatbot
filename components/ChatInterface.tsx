
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
    const finalPrompt = prompt || `Let's start our ${mode.toLowerCase()} session.`;

    if (!prompt && !modeOverride) return;

    let sessionId = activeSessionId;
    let newHistory: Message[] = activeSession?.messages ? [...activeSession.messages] : [];

    // Create session if it doesn't exist
    if (!sessionId) {
      sessionId = Date.now().toString();
      const newSession: ChatSession = {
        id: sessionId,
        title: prompt.slice(0, 30) || `${mode} Session`,
        messages: [],
        createdAt: Date.now()
      };
      setSessions(prev => [newSession, ...prev]);
      setActiveSessionId(sessionId);
    }

    const userMsg: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: finalPrompt,
      timestamp: Date.now()
    };

    // Update UI immediately
    const updatedHistory = [...newHistory, userMsg];
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: updatedHistory } : s));
    setInput('');
    setIsLoading(true);

    try {
      const aiContent = await generateStudyResponse(finalPrompt, newHistory, mode);
      
      const botMsg: Message = {
        id: Date.now().toString() + '-bot',
        role: 'model',
        content: aiContent,
        timestamp: Date.now()
      };
      setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: [...updatedHistory, botMsg] } : s));
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const startMode = (mode: StudyMode) => {
    setStudyMode(mode);
    const newId = Date.now().toString();
    const newSess: ChatSession = {
      id: newId,
      title: `${mode} Session`,
      messages: [],
      createdAt: Date.now()
    };
    setSessions(prev => [newSess, ...prev]);
    setActiveSessionId(newId);
    setSidebarOpen(false);
    
    // Small delay to ensure state propagates before initial prompt
    setTimeout(() => handleSendMessage(undefined, mode), 50);
  };

  return (
    <div className="flex h-screen bg-transparent text-white overflow-hidden relative">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`fixed lg:relative z-50 w-72 h-full black-glass border-r border-white/10 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full p-5">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-xl font-bold flex items-center gap-2"><GraduationCap size={24}/> Student Bot</h1>
            <button className="lg:hidden p-2" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
          </div>
          
          <button 
            onClick={() => { setActiveSessionId(null); setStudyMode(null); setSidebarOpen(false); }} 
            className="flex items-center gap-3 w-full p-4 mb-8 rounded-2xl bg-white text-black font-bold hover:scale-[1.02] transition-all shadow-xl"
          >
            <Plus size={18} /> New Chat
          </button>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            <h3 className="text-[10px] uppercase text-white/30 font-bold px-3 mb-2 tracking-widest">History</h3>
            {sessions.length === 0 && <p className="px-3 text-xs text-white/20">No recent chats</p>}
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
            <div className="flex items-center gap-3 p-4 mb-3 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center font-bold">{user.name[0].toUpperCase()}</div>
              <div className="truncate flex-1 text-sm font-bold">{user.name}</div>
            </div>
            <button onClick={onLogout} className="flex items-center gap-3 w-full p-4 text-white/40 hover:text-white transition-all text-sm font-bold rounded-xl hover:bg-red-500/10"><LogOut size={18} /> Logout</button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full relative">
        <header className="flex items-center justify-between p-5 border-b border-white/10 black-glass z-10">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-all" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="font-bold flex items-center gap-2 text-lg">
              {studyMode ? (
                <span className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                   {studyMode} Mode
                </span>
              ) : 'Personal Tutor'}
            </h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-12">
          {!activeSessionId ? (
            <div className="max-w-3xl mx-auto mt-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="inline-block p-10 black-glass rounded-[2.5rem] mb-12 border-white/20 shadow-2xl">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">Hello, {user.name}!</h1>
                <p className="text-white/60 mb-12 text-lg font-medium">What shall we master together today?</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {[
                    { m: 'Notes', i: <BookText />, c: 'bg-blue-600' },
                    { m: 'Assignment', i: <ClipboardCheck />, c: 'bg-purple-600' },
                    { m: 'Project', i: <Cpu />, c: 'bg-emerald-600' },
                    { m: 'Research', i: <Search />, c: 'bg-amber-600' },
                    { m: 'Study', i: <GraduationCap />, c: 'bg-rose-600' }
                  ].map(({m, i, c}) => (
                    <button 
                      key={m} 
                      onClick={() => startMode(m as StudyMode)} 
                      className="flex flex-col items-center gap-4 p-6 rounded-[1.5rem] border border-white/10 bg-white/5 hover:bg-white/10 hover:scale-105 transition-all group shadow-lg"
                    >
                      <div className={`${c} p-4 rounded-2xl text-white shadow-xl group-hover:rotate-6 transition-transform`}>{i}</div>
                      <span className="text-[11px] font-bold uppercase tracking-widest text-white/80 group-hover:text-white">{m}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-8 pb-32">
              {activeSession?.messages.map((msg) => (
                <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse animate-in slide-in-from-right-4' : 'animate-in slide-in-from-left-4'}`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${msg.role === 'user' ? 'bg-white text-black' : 'black-glass border-white/10 text-white'}`}>
                    {msg.role === 'user' ? <UserIcon size={20}/> : <Bot size={20}/>}
                  </div>
                  <div className={`p-5 rounded-2xl text-[15px] leading-relaxed max-w-[85%] shadow-xl border ${msg.role === 'user' ? 'chat-bubble-user text-white font-medium' : 'chat-bubble-bot text-white/90'}`}>
                    <div className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 items-center text-white/40 text-xs font-bold ml-14 animate-pulse">
                  <Sparkles size={14} className="text-yellow-400 mr-2" />
                  ANALYZING CONCEPTS...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-6 bg-gradient-to-t from-black/60 to-transparent">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative group">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder={studyMode ? `Ask about ${studyMode.toLowerCase()}...` : "Type a question or select a mode..."}
              className="w-full black-glass border border-white/20 rounded-2xl py-5 pl-7 pr-16 focus:outline-none focus:border-white/50 focus:bg-black transition-all text-white font-medium text-lg placeholder:text-white/20 shadow-2xl"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-3.5 rounded-xl transition-all shadow-xl ${input.trim() ? 'bg-white text-black hover:scale-105 active:scale-95' : 'bg-white/5 text-white/10 cursor-not-allowed'}`}
            >
              <Send size={24} />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ChatInterface;
