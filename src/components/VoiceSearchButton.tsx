import React, { useState } from 'react';
import { Mic, MicOff, Volume2, X } from 'lucide-react';
import { useSpeechToText } from '../hooks/useSpeechToText';

interface VoiceSearchButtonProps {
  onSearchQueryChange: (query: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

export const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({
  onSearchQueryChange,
  placeholder = 'Listening for job search keywords...',
  className = '',
  id = 'voice-search-mic-btn',
}) => {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  const {
    isListening,
    transcript,
    error,
    isSupported,
    toggleListening,
    stopListening,
  } = useSpeechToText({
    onTranscriptChange: (text) => {
      if (text.trim()) {
        onSearchQueryChange(text);
      }
    },
  });

  const handleMicClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowTooltip(true);
    toggleListening();
  };

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        id={id}
        onClick={handleMicClick}
        title={
          isListening
            ? 'Listening... Click to stop voice input'
            : 'Click to search jobs hands-free with Voice-to-Text'
        }
        className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
          isListening
            ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400 shadow-lg shadow-rose-500/30'
            : error
            ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30'
            : 'text-emerald-200 hover:text-white hover:bg-white/10'
        } ${className}`}
        aria-label="Voice Search Microphone Input"
      >
        {isListening ? (
          <Mic className="w-4 h-4 text-white animate-bounce" />
        ) : !isSupported ? (
          <MicOff className="w-4 h-4 text-slate-400" />
        ) : (
          <Mic className="w-4 h-4 text-amber-300" />
        )}
      </button>

      {/* Floating Listening & Transcript Feedback Popover */}
      {(isListening || error || (showTooltip && transcript)) && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 p-3 bg-slate-900 border border-emerald-500/50 rounded-xl shadow-2xl text-white text-xs animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-700/60 mb-2">
            <div className="flex items-center gap-1.5 font-extrabold text-amber-300">
              <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>Voice Hands-Free Search</span>
            </div>
            <button
              onClick={() => {
                stopListening();
                setShowTooltip(false);
              }}
              className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {isListening && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-[11px]">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                Listening... Speak your target role or skill
              </div>
              <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-slate-200 italic font-medium min-h-[36px] flex items-center">
                {transcript || placeholder}
              </div>
            </div>
          )}

          {error && (
            <div className="p-2 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-200 text-[11px]">
              {error}
            </div>
          )}

          {!isListening && transcript && !error && (
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400">Search text recognized:</span>
              <p className="font-bold text-amber-200">{transcript}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
