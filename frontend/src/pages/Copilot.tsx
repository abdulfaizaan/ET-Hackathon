import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, CheckCircle2, Info, AlertCircle, FileText, Activity, Network, Mic, AudioWaveform } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { Message, Citation } from '../types';
import { cn } from '../lib/utils';

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'msg-sys-1',
    role: 'assistant',
    content: 'ForgeMind industrial copilot online. Connected to factory knowledge graph. What equipment are you troubleshooting?',
    timestamp: new Date()
  }
];

export default function Copilot() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [noiseFilterEnabled, setNoiseFilterEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognition.start();
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Mock API response simulating RAG
    setTimeout(() => {
      const response: Message = generateMockResponse(userMessage.content);
      setMessages(prev => [...prev, response]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto border-x border-slate-200 bg-slate-50 shadow-sm relative">
      <div className="p-4 md:p-6 border-b border-slate-200 bg-white flex justify-between items-center z-10 sticky top-0">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-600"></div>
            Expert Knowledge Copilot
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 ml-4">Field Technician Interface • GraphRAG Enabled</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setNoiseFilterEnabled(!noiseFilterEnabled)}
            className={cn("flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded transition-colors border",
              noiseFilterEnabled ? "text-amber-700 bg-amber-50 border-amber-200" : "text-slate-500 bg-slate-50 border-slate-200"
            )}
            title="Toggle Edge AI Acoustic Noise Filter"
          >
            <AudioWaveform className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{noiseFilterEnabled ? 'Noise Filter: ON' : 'Noise Filter: OFF'}</span>
          </button>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-green-700 bg-green-50 border border-green-200 px-2 py-1 flex-row rounded">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Context Loaded</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        <AnimatePresence>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white border border-slate-200 shadow-sm text-slate-900 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse delay-75" />
                <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse delay-150" />
                <span className="text-xs font-bold ml-2 text-slate-500 uppercase tracking-widest">Querying Knowledge Graph...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="e.g., Why is pump P-201 vibrating?"
            className="w-full bg-slate-100 border border-slate-200 text-slate-900 rounded-full pl-5 pr-12 py-3.5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans placeholder-slate-400 shadow-sm"
          />
          <button
            type="button"
            onClick={handleVoiceInput}
            className={cn(
              "absolute right-12 p-2 rounded-full transition-colors flex items-center justify-center shadow-sm",
              isListening ? "bg-red-500 text-white animate-pulse" : "bg-slate-200 hover:bg-slate-300 text-slate-700"
            )}
            title="Voice Input"
          >
            <Mic className="w-4 h-4" />
          </button>
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 text-white rounded-full transition-colors flex items-center justify-center shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-center text-[10px] text-slate-500 mt-2 font-medium">
          Responses generated from ingested factory documents and P&IDs. Verify with physical instruments.
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("flex w-full gap-3 md:gap-4", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0 mt-1 shadow-sm">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div className={cn(
        "flex flex-col max-w-[85%] md:max-w-[75%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className={cn(
          "px-4 py-3 rounded-2xl shadow-sm text-[15px]",
          isUser 
            ? "bg-slate-900 text-white rounded-tr-sm font-medium shadow-md" 
            : "bg-blue-50 text-slate-900 rounded-tl-sm border border-blue-100"
        )}>
          {isUser ? (
            <p className="leading-relaxed">{message.content}</p>
          ) : (
            <div className="markdown-body">
              <Markdown>{message.content}</Markdown>
            </div>
          )}
        </div>

        {/* Citations & Meta */}
        {!isUser && message.citations && message.citations.length > 0 && (
          <div className="mt-2 flex flex-col gap-2 w-full">
            <div className="text-[10px] uppercase font-bold text-slate-500 flex justify-between items-center px-1 tracking-wider">
              <span>Sources context retrieved:</span>
              {message.confidenceScore && (
                <span className={cn(
                  "px-1.5 py-0.5 rounded font-mono text-[10px] border",
                  message.confidenceScore > 0.8 ? "text-green-700 bg-green-50 border-green-200" : "text-amber-700 bg-amber-50 border-amber-200"
                )}>
                  {Math.round(message.confidenceScore * 100)}% Match
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {message.citations.map((cit, idx) => (
                <div key={idx} className="bg-white border border-slate-200 shadow-sm rounded-lg p-2 text-xs w-full sm:w-auto sm:max-w-[280px] hover:bg-slate-50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-1.5 mb-1 font-bold text-blue-700 text-[10px] uppercase tracking-wider">
                    {cit.type === 'manual' && <FileText className="w-3.5 h-3.5" />}
                    {cit.type === 'work_order' && <Activity className="w-3.5 h-3.5" />}
                    {cit.type === 'regulation' && <AlertCircle className="w-3.5 h-3.5" />}
                    {cit.type === 'pid' && <Network className="w-3.5 h-3.5" />}
                    <span className="truncate">{cit.source}</span>
                  </div>
                  <p className="text-slate-600 italic line-clamp-2 leading-relaxed text-[11px]">"{cit.snippet}"</p>
                  {cit.imageUrl && (
                    <div className="mt-2 relative rounded overflow-hidden border border-slate-200">
                      <img src={cit.imageUrl} alt="Citation Context" className="w-full h-auto block" />
                      {cit.boundingBox && (
                        <div 
                          className="absolute border-2 border-red-500 bg-red-500/20 shadow-[0_0_8px_rgba(239,68,68,0.8)] pointer-events-none"
                          style={{
                            left: `${cit.boundingBox.x}%`,
                            top: `${cit.boundingBox.y}%`,
                            width: `${cit.boundingBox.width}%`,
                            height: `${cit.boundingBox.height}%`
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-4 h-4 text-slate-500" />
        </div>
      )}
    </motion.div>
  );
}

// Mock AI Logic tailored for the industrial Hackathon MVP
function generateMockResponse(query: string): Message {
  const content = query.toLowerCase();
  
  if (content.includes('upstream isolation valve') && content.includes('p-201')) {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'I have analyzed the P&ID blueprint for the cooling system. The upstream isolation valve for Pump P-201 is **Valve V-105**.\n\n*Safety Warning: Close V-105 fully and apply Lockout/Tagout before commencing any maintenance on P-201.*',
      confidenceScore: 0.98,
      timestamp: new Date(),
      citations: [
        { 
          id: '1', 
          source: 'Cooling Sys P&ID (PID-1020)', 
          type: 'pid', 
          snippet: 'V-105 provides primary isolation upstream of P-201 suction.',
          imageUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=600&auto=format&fit=crop',
          boundingBox: { x: 25, y: 40, width: 8, height: 12 } // Grounding coordinates provided by vision parser
        }
      ]
    };
  }
  
  if (content.includes('p-201') || content.includes('vibrat')) {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: 'Based on the context retrieved from the Knowledge Graph, **Pump P-201** has a history of high vibration connected to cavitation. \n\n1. Check the suction line strainer shown in `PID-1020` for blockages. \n2. Review `OEM Manual P-Series` Section 4.1 regarding NPSH limits.\n\n*Safety Warning: Ensure lockout/tagout procedures (ISO-9001) are followed before inspecting the impeller housing.*',
      confidenceScore: 0.92,
      timestamp: new Date(),
      citations: [
        { id: '1', source: 'OEM Manual P-Series', type: 'manual', snippet: 'Vibration near the impeller housing frequently indicates cavitation. Verify NPSHA.' },
        { 
          id: '2', 
          source: 'Cooling Sys P&ID', 
          type: 'pid', 
          snippet: 'Strainer tagged S-103 located preceding suction inlet of P-201.',
          imageUrl: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?q=80&w=600&auto=format&fit=crop',
          boundingBox: { x: 45, y: 30, width: 10, height: 10 }
        },
        { id: '3', source: 'Work Order #8834', type: 'work_order', snippet: 'Reported vibration; found minor cavitation wear on impeller.' }
      ]
    };
  }

  return {
    id: Date.now().toString(),
    role: 'assistant',
    content: "I've searched the current knowledge graph, but I need a specific equipment tag (e.g., P-201) and issue to provide targeted troubleshooting steps or diagrams.",
    timestamp: new Date()
  };
}
