import React, { useState } from 'react';
import { Bot, Send, Sparkles, RefreshCw, Copy, Check, MessageSquare, DollarSign, Zap, Globe, Shield } from 'lucide-react';
import { UserProfile } from '../types';

interface AICareerMentorViewProps {
  userProfile: UserProfile;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: string;
}

export const AICareerMentorView: React.FC<AICareerMentorViewProps> = ({ userProfile }) => {
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'mentor',
      text: `Hello ${userProfile.name || 'there'}! I am your **AI Career Mentor**, specialized in 2026 global remote career progression, USD salary negotiation, future-proof upskilling, and fractional roles.\n\nHow can I help accelerate your remote career today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim() || isSending) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customPrompt) setInputMessage('');
    setIsSending(true);

    try {
      const response = await fetch('/api/gemini/career-mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: textToSend,
          chatHistory: messages.slice(-6).map((m) => ({ role: m.sender, content: m.text })),
        }),
      });

      const data = await response.json();
      if (data.success && data.reply) {
        const mentorMsg: ChatMessage = {
          id: `m-${Date.now()}`,
          sender: 'mentor',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, mentorMsg]);
      }
    } catch (err) {
      console.error('Failed to contact career mentor', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-[#064E3B] dark:bg-emerald-950 text-white rounded-2xl p-6 border border-[#064E3B] shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBBF24]/20 text-[#FBBF24] text-xs font-bold mb-2 border border-[#FBBF24]/40">
              <Bot className="w-3.5 h-3.5 text-amber-300" />
              2026 Executive Career Coach
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              AI Career Mentor Chatbot
            </h2>
            <p className="text-xs text-emerald-100 mt-1 max-w-xl">
              Get word-for-word negotiation scripts, fractional role guidance, global salary benchmarks, and 2026 AI upskilling strategies.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action Presets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => handleSendMessage('Give me a word-for-word salary negotiation script for a global remote developer role.')}
          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-amber-400 dark:hover:border-amber-400 text-left transition-all group shadow-xs"
        >
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs mb-1">
            <DollarSign className="w-4 h-4" />
            Salary Negotiation Scripts
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200">
            Word-for-word templates for base salary vs total compensation trade-offs.
          </p>
        </button>

        <button
          onClick={() => handleSendMessage('What are the top future-proof technical & AI skills needed for 2026 remote roles?')}
          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-amber-400 dark:hover:border-amber-400 text-left transition-all group shadow-xs"
        >
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-xs mb-1">
            <Zap className="w-4 h-4" />
            2026 AI Upskilling Roadmap
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200">
            Learn high-yield digital proficiencies & Gemini AI integration.
          </p>
        </button>

        <button
          onClick={() => handleSendMessage('Explain how to land high-paying fractional remote roles and navigate cross-border compliance.')}
          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-amber-400 dark:hover:border-amber-400 text-left transition-all group shadow-xs"
        >
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs mb-1">
            <Globe className="w-4 h-4" />
            Fractional & Borderless Roles
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200">
            Strategies for multi-client contracts, Deel, and global payouts.
          </p>
        </button>

        <button
          onClick={() => handleSendMessage('How can I demonstrate senior async leadership across distributed cross-functional teams?')}
          className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-amber-400 dark:hover:border-amber-400 text-left transition-all group shadow-xs"
        >
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs mb-1">
            <Shield className="w-4 h-4" />
            Async Leadership Mastery
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200">
            RFC writing, cross-timezone hand-offs, and zero-meeting productivity.
          </p>
        </button>
      </div>

      {/* Main Chat Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col h-[520px]">
        {/* Chat Stream Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
              AI Career Mentor Online
            </span>
          </div>
          <span className="text-[10px] font-bold text-emerald-800 dark:text-amber-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full">
            2026 Strategy Engine
          </span>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-amber-400 text-emerald-950'
                    : 'bg-[#064E3B] text-amber-300'
                }`}
              >
                {msg.sender === 'user' ? 'YOU' : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`rounded-2xl p-4 text-xs space-y-2 relative group shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-amber-400 text-emerald-950 font-medium'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>

                <div className="flex items-center justify-between pt-1 text-[10px] opacity-75">
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'mentor' && (
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition-all"
                      title="Copy advice"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex gap-3 items-center text-xs text-slate-500 dark:text-slate-400 italic">
              <RefreshCw className="w-4 h-4 animate-spin text-amber-500" />
              AI Career Mentor is analyzing strategy...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-b-2xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask your AI Career Mentor about salary scripts, global offers, upskilling..."
              className="flex-1 px-4 py-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              type="submit"
              disabled={isSending || !inputMessage.trim()}
              className="px-5 py-3 bg-[#064E3B] hover:bg-emerald-900 text-amber-300 font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
            >
              <Send className="w-4 h-4 text-amber-400" />
              Ask Coach
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
