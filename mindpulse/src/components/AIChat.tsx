import React, { useState, useRef, useEffect } from 'react';
import { getChatResponse } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { Send, Bot, User as UserIcon, Loader2, AlertTriangle } from 'lucide-react';

const AIChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi, I'm your MindPulse assistant. I'm here to listen if you're feeling overwhelmed, stressed, or just need to chat. How are you feeling right now?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    // Update UI immediately with user message
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Pass the updated history including the new user message
      // Note: geminiService will handle filtering out the initial 'model' welcome message
      // to ensure the API call is valid.
      const historyToAnalyze = [...messages, userMsg].map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      // We don't send the userMsg *text* as the second arg if we include it in history. 
      // The service expects history (context) and the NEW message.
      // Actually, standard practice is: History = Past messages. New Message = Current input.
      const historyContext = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await getChatResponse(historyContext, userMsg.text);

      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText || "I'm listening. Could you tell me more?",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      let errorMessage = "I'm having trouble connecting right now. Please try again later.";
      
      if (err.message === "MISSING_API_KEY") {
        errorMessage = "SYSTEM ERROR: API Key missing in server/.env file. The backend cannot call Gemini.";
      } else if (err.message) {
        errorMessage = `Connection Error: ${err.message}`;
      }

      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: errorMessage,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
      <div className="bg-indigo-600 p-4 text-white flex items-center gap-3">
        <div className="p-2 bg-indigo-500 rounded-full">
             <Bot className="w-5 h-5" />
        </div>
        <div>
            <h3 className="font-semibold">Support Assistant</h3>
            <p className="text-xs text-indigo-200">AI-Powered • Confidential</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-gray-200' : 'bg-indigo-100'}`}>
                    {msg.role === 'user' ? <UserIcon className="w-4 h-4 text-gray-600"/> : <Bot className="w-4 h-4 text-indigo-600"/>}
                </div>
                <div
                    className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                        ? 'bg-gray-900 text-white rounded-tr-none'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                    } ${msg.text.includes("Error") ? 'border-red-200 bg-red-50 text-red-600' : ''}`}
                >
                    {msg.text.includes("Error") && <AlertTriangle className="w-4 h-4 inline mr-1 mb-0.5" />}
                    {msg.text}
                </div>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex w-full justify-start">
              <div className="flex max-w-[80%] gap-2">
                 <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-indigo-100">
                    <Bot className="w-4 h-4 text-indigo-600"/>
                </div>
                <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-gray-100 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isTyping ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
};

export default AIChat;
