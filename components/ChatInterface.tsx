import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessage } from '../services/gemini';
import { ChatMessage, GroundingChunk } from '../types';

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: 'Hello. I am your personal medical assistant. Ask me about symptoms, medicines, or interactions.', timestamp: Date.now() }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({ role: m.role, text: m.text }));
      const response = await sendChatMessage(history, userMsg.text);
      
      let text = response.text;
      
      // Append grounding sources if available
      if (response.chunks && response.chunks.length > 0) {
        const sources = response.chunks
          .filter(c => c.web)
          .map(c => `[${c.web?.title}](${c.web?.uri})`)
          .join('\n');
        if (sources) {
          text += `\n\n**Sources:**\n${sources}`;
        }
      }

      const modelMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: text,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (e) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
       <header className="mb-4">
        <h1 className="text-2xl font-bold text-medic-neonBlue">Dr. AI Chat</h1>
        <p className="text-xs text-gray-500">Powered by Gemini 3 Pro • Not a diagnosis</p>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-medic-neonBlue/10 border border-medic-neonBlue/30 text-white rounded-br-none' 
                : 'bg-white/5 border border-white/10 text-gray-200 rounded-bl-none'
            }`}>
              <div className="whitespace-pre-wrap">{msg.text}</div>
            </div>
          </div>
        ))}
        {loading && (
           <div className="flex justify-start">
             <div className="bg-white/5 p-4 rounded-2xl rounded-bl-none flex space-x-2 items-center">
               <div className="w-2 h-2 bg-medic-neonBlue rounded-full animate-bounce" />
               <div className="w-2 h-2 bg-medic-neonBlue rounded-full animate-bounce delay-75" />
               <div className="w-2 h-2 bg-medic-neonBlue rounded-full animate-bounce delay-150" />
             </div>
           </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="bg-medic-charcoal/80 backdrop-blur p-2 rounded-full border border-white/10 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a question..."
          className="flex-1 bg-transparent border-none outline-none px-4 text-white placeholder-gray-500"
        />
        <button 
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="w-10 h-10 rounded-full bg-medic-neonBlue text-black flex items-center justify-center disabled:opacity-50"
        >
          ➤
        </button>
      </div>
    </div>
  );
};