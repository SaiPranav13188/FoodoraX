'use client';

import { useState, useCallback } from 'react';
import { Search, Mic, MicOff } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface VoiceSearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export function VoiceSearchBar({
  onSearch,
  placeholder = 'Search dishes, cuisines, or restaurants...',
}: VoiceSearchBarProps) {
  const [query, setQuery] = useState('');

  const handleSpeechResult = useCallback((transcript: string) => {
    setQuery(transcript);
    if (onSearch) {
      onSearch(transcript);
    }
  }, [onSearch]);

  const { isListening, isSupported, toggleListening } =
    useSpeechRecognition(handleSpeechResult);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
        <Search className="w-5 h-5" />
      </div>

      {/* Input Field */}
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder={
          isListening ? 'Listening... Speak now' : placeholder
        }
        className={`w-full pl-11 pr-12 py-3 bg-gray-900/80 border rounded-full text-white placeholder-gray-400 focus:outline-none transition-all duration-200 ${
          isListening
            ? 'border-red-500 ring-2 ring-red-500/30'
            : 'border-gray-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
        }`}
      />

      {/* Microphone Icon Button */}
      {isSupported && (
        <button
          type="button"
          onClick={toggleListening}
          aria-label={isListening ? 'Stop listening' : 'Start voice search'}
          className="absolute inset-y-0 right-0 pr-3.5 flex items-center justify-center cursor-pointer"
        >
          <div
            className={`p-2 rounded-full transition-all duration-300 ${
              isListening
                ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/50'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
            }`}
          >
            {isListening ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </div>
        </button>
      )}
    </div>
  );
}