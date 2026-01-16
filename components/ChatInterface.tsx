
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
    const finalPrompt = prompt || `I need help with a ${mode.toLowerCase()}.`;

    if (!prompt && !modeOverride) return;

    const userMsg: Message = {
      id: Date.now().toString() + '-user',
      role: 'user',
      content: finalPrompt,
      timestamp: Date.now()
    };

    let targetSessionId = activeSessionId;
    
    // Use functional update to ensure we have the absolute latest state
    setSessions(prev => {
      let existing = prev.find(s => s.id === targetSessionId);
      if (existing) {
        return prev.map(s => s.id === targetSessionId ? { ...s, messages: [...s.messages, userMsg] } : s);
      } else {
        const newId = Date.now().toString();
        targetSessionId = newId;
        const newSession: ChatSession = {
          id: newId,
          title: prompt.slice(0, 30) || `${mode} Session`,
          messages: [userMsg],
          createdAt: Date.now()
        };
        // Use a slight timeout to set ActiveId to avoid render cycles
        setTimeout(() => setActiveSessionId(newId), 0);
        return [newSession, ...prev];
      }
    });

    setInput('');
    setIsLoading(true);

    try {
      // Get the current conversation history for the AI
      const historyForAI = activeSession?.messages || [];
      const aiContent = await generateStudyResponse(finalPrompt, historyForAI, mode);
      
      const botMsg: Message = {
        id: (Date.now() + 1).toString() + '-bot',
        role: 'model',
        content: aiContent,
        timestamp: Date.now()
      };

      setSessions(prev => prev.map(s => s.id === targetSessionId ? { ...s, messages: [...s.messages, botMsg] } : s));
    } catch (err) {
      console.error("Chatbot response error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const startMode = (mode: StudyMode) => {
    setStudyMode(mode);
    setActiveSessionId(null); // Clear active session to trigger new creation logic
    setSidebarOpen(false);
    handleSendMessage(undefined, mode);
  };

  return (
    <div className="flex h-screen bg-transparent text-white overflow-hidden relative">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:relative z-50 w-72 h-full black-glass border-r border-white/10 transition-transform duration-300 ease-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="flex flex-col h-full p-5">
          <div className="flex items-center justify-between mb-8 px-2">
            <h1 className="text-xl font-bold flex items-center gap-2 tracking-tight">
              <div className="bg-white text-black p-1 rounded-lg"><GraduationCap size={20}/></div>
              Student Bot
            </h1>
            <button className="lg:hidden p-2 hover:bg-white/10 rounded-xl" onClick={() => setSidebarOpen(false)}><X size={20} /></button>
          </div>
          
          <button 
            onClick={() => { setActiveSessionId(null); setStudyMode(null); setSidebarOpen(false); }} 
            className="flex items-center gap-3 w-full p-4 mb-8 rounded-2xl bg-white text-black font-bold hover:bg-white/90 active:scale-95 transition-all shadow-xl"
          >
            <Plus size={18} /> New Session
          </button>

          <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
            <h3 className="text-[10px] uppercase text-white/40 font-black px-3 mb-3 tracking-[0.2em]">Recent History</h3>
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
                <div className="text-[10px] text-white/30 uppercase font-bold tracking-widest">Active</div>
              </div>
            </div>
            <button onClick={onLogout} className="flex items-center gap-3 w-full p-4 text-white/40 hover:text-white transition-all text-sm font-bold rounded-xl hover:bg-red-500/10"><LogOut size={18} /> Logout</button>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col h-full relative">
        <header className="flex items-center justify-between p-5 border-b border-white/10 black-glass z-10">
          <div className="flex items-center gap-4">
            <button className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-all" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="font-bold flex items-center gap-3 text-lg">
              {studyMode ? (
                <>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                  {studyMode} Assistant
                </>
              ) : 'Personal AI Tutor'}
            </h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-8 md:px-12">
          {!activeSessionId ? (
            <div className="max-w-4xl mx-auto mt-8 text-center animate-in fade-in slide-in-from-bottom-6 duration-700">
              <div className="inline-block p-10 black-glass rounded-[3rem] mb-12 border-white/20 shadow-2xl w-full">
                <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Hello, {user.name}!</h1>
                <p className="text-white/60 mb-12 text-xl font-medium max-w-2xl mx-auto">Choose a study mode below to start learning with your personal tutor.</p>
                
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
                      className="flex flex-col items-center gap-4 p-6 rounded-[2rem] border border-white/10 bg-white/5 hover:bg-white/10 hover:scale-105 active:scale-95 transition-all group shadow-lg"
                    >
                      <div className={`${c} p-4 rounded-2xl text-white shadow-2xl group-hover:rotate-6 transition-transform`}>{i}</div>
                      <span className="text-[11px] font-black uppercase tracking-[0.15em] text-white/70 group-hover:text-white">{m}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-10 pb-40">
              {activeSession?.messages.map((msg) => (
                <div key={msg.id} className={`flex gap-5 ${msg.role === 'user' ? 'flex-row-reverse animate-in slide-in-from-right-4' : 'animate-in slide-in-from-left-4'} duration-300`}>
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl ${msg.role === 'user' ? 'bg-white text-black' : 'black-glass border-white/20 text-white'}`}>
                    {msg.role === 'user' ? <UserIcon size={22}/> : <Bot size={22}/>}
                  </div>
                  <div className={`p-6 rounded-[2rem] text-[16px] leading-relaxed max-w-[85%] shadow-2xl border ${msg.role === 'user' ? 'chat-bubble-user font-semibold' : 'chat-bubble-bot'}`}>
                    <div className="whitespace-pre-wrap break-words">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4 items-center text-white/50 text-xs font-black ml-16 animate-pulse tracking-widest uppercase">
                  <Sparkles size={14} className="text-yellow-400" />
                  AI Tutor is thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent fixed bottom-0 left-0 right-0 lg:left-72">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative group">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              placeholder={studyMode ? `How can I help with your ${studyMode.toLowerCase()}?` : "Choose a mode or type a question..."}
              className="w-full black-glass border-2 border-white/10 rounded-[2rem] py-6 pl-8 pr-20 focus:outline-none focus:border-white/40 focus:bg-black transition-all text-white font-medium text-lg placeholder:text-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className={`absolute right-4 top-1/2 -translate-y-1/2 p-4 rounded-2xl transition-all shadow-2xl ${input.trim() ? 'bg-white text-black hover:scale-105 active:scale-95' : 'bg-white/5 text-white/10 cursor-not-allowed'}`}
            >
              <Send size={24} />
            </button>
          </form>
          <div className="text-center mt-4 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
            Digital Learning Engine • Gemini powered
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatInterface;
