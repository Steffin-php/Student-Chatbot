
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
  Bot
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
    
    // Get latest history from sessions state inside the update
    // Note: Since sessions state update might not be synchronous, we find the session
    // in the previous state.
    setSessions(prev => {
      const sess = prev.find(s => s.id === sessionId);
      const history = sess?.messages.slice(0, -1) || [];
      
      // We can't await inside setSessions, so we handle the side-effect outside
      return prev;
    });

    try {
      // Find the specific session for history
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
      // Immediately start the conversation for specific modes
      handleSendMessage(undefined, initialMode, newId);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent, modeOverride?: StudyMode, sessionIdOverride?: string) => {
    if (e) e.preventDefault();
    
    const prompt = input.trim();
    const targetMode = modeOverride || studyMode || 'General';
    const targetSessionId = sessionIdOverride || activeSessionId;

    // Default message when just a button is clicked
    const finalPrompt = prompt || `I want to start a new ${targetMode} session. Please introduce yourself as my ${targetMode} tutor.`;

    if (!finalPrompt && !modeOverride) return;

    let currentSessionId = targetSessionId;
    
    // If no session exists, create one
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

    // Add user message to session
    setSessions(prev => prev.map(s => {
      if (s.id === currentSessionId) {
        const newTitle = s.messages.length === 0 ? (prompt.slice(0, 30) || `${targetMode} Session`) : s.title;
        return { ...s, title: newTitle, messages: [...s.messages, newUserMessage] };
      }
      return s;
    }));

    setInput('');
    if (modeOverride) setStudyMode(modeOverride);
    
    // Trigger AI
    await triggerAIResponse(currentSessionId!, finalPrompt, targetMode);
  };

  const handleModeClick = (mode: StudyMode) => {
    createNewChat(mode);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-black">
      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:relative z-50 w-72 h-full bg-[#0a0a0a] border-r border-white/5 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-4">
          <button 
            onClick={() => createNewChat()}
            className="flex items-center gap-3 w-full p-4 mb-6 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-sm font-medium"
          >
            <Plus size={18} />
            New Chat
          </button>

          <div className="flex-1 overflow-y-auto space-y-2 mb-4 pr-1">
            <h3 className="text-[10px] uppercase tracking-widest text-white/30 font-bold px-2 mb-2">History</h3>
            {sessions.map(s => (
              <button
                key={s.id}
                onClick={() => {
                  setActiveSessionId(s.id);
                  setSidebarOpen(false);
                  // Try to infer mode from title or keep current
                }}
                className={`w-full text-left p-3 rounded-xl text-sm transition-all truncate ${
                  activeSessionId === s.id ? 'bg-white/10 text-white font-medium' : 'text-white/50 hover:bg-white/[0.03] hover:text-white'
                }`}
              >
                {s.title}
              </button>
            ))}
            {sessions.length === 0 && (
              <div className="text-xs text-white/20 px-2 py-4 italic">No previous sessions</div>
            )}
          </div>

          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center gap-3 p-2 mb-2">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/50">
                <UserIcon size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-[10px] text-white/30 truncate">{user.email}</p>
              </div>
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-3 w-full p-3 rounded-xl text-white/50 hover:text-white hover:bg-red-500/10 transition-all text-xs"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-white/5 lg:px-8 bg-black/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <button 
              className="lg:hidden p-2 text-white/50 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-bold tracking-tight">Student Chatbot</h2>
          </div>
          {studyMode && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] uppercase tracking-wider font-bold text-white/60">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              {studyMode} Mode
            </div>
          )}
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-8 lg:px-12">
          {!activeSessionId || activeSession?.messages.length === 0 ? (
            <div className="max-w-3xl mx-auto mt-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="inline-block p-4 bg-white/5 rounded-3xl mb-6 border border-white/10">
                <GraduationCap size={48} />
              </div>
              <h1 className="text-4xl font-bold mb-4">What's our study goal today?</h1>
              <p className="text-white/40 mb-12 max-w-lg mx-auto leading-relaxed">
                Select a category to start a guided learning session tailored to your needs.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <ModeButton 
                  icon={<BookText size={20} />} 
                  label="Notes" 
                  onClick={() => handleModeClick('Notes')} 
                />
                <ModeButton 
                  icon={<ClipboardCheck size={20} />} 
                  label="Assignment" 
                  onClick={() => handleModeClick('Assignment')} 
                />
                <ModeButton 
                  icon={<Cpu size={20} />} 
                  label="Project" 
                  onClick={() => handleModeClick('Project')} 
                />
                <ModeButton 
                  icon={<Search size={20} />} 
                  label="Research" 
                  onClick={() => handleModeClick('Research')} 
                />
                <ModeButton 
                  icon={<GraduationCap size={20} />} 
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
                    w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center
                    ${msg.role === 'user' ? 'bg-white/10 text-white' : 'bg-white text-black'}
                  `}>
                    {msg.role === 'user' ? <UserIcon size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={`
                    max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed
                    ${msg.role === 'user' ? 'bg-white/5 text-white/90' : 'text-white/80'}
                  `}>
                    <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-white text-black flex-shrink-0 flex items-center justify-center animate-pulse">
                    <Bot size={16} />
                  </div>
                  <div className="flex gap-1 items-center px-4 py-3 bg-white/5 rounded-2xl">
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-150"></span>
                    <span className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce delay-300"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/95 to-transparent pt-12">
          <form 
            onSubmit={(e) => handleSendMessage(e)}
            className="max-w-4xl mx-auto relative group"
          >
            <input 
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={studyMode ? `Ask me about your ${studyMode.toLowerCase()}...` : "Message Student Chatbot..."}
              className="w-full bg-[#111] border border-white/10 rounded-3xl py-4 pl-6 pr-14 focus:outline-none focus:border-white/30 transition-all text-sm placeholder:text-white/20"
              disabled={isLoading}
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim()}
              className={`
                absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl flex items-center justify-center transition-all
                ${input.trim() ? 'bg-white text-black' : 'bg-white/5 text-white/20 cursor-not-allowed'}
              `}
            >
              <Send size={18} />
            </button>
          </form>
          <p className="text-[10px] text-center text-white/20 mt-4 uppercase tracking-widest font-bold">
            Built for deep learning • Always step-by-step
          </p>
        </div>
      </main>
    </div>
  );
};

const ModeButton: React.FC<{ icon: React.ReactNode, label: string, onClick: () => void }> = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-3 p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all group"
  >
    <div className="text-white/50 group-hover:text-white transition-colors">
      {icon}
    </div>
    <span className="text-xs font-semibold">{label}</span>
  </button>
);

export default ChatInterface;
