import React, { useState, useRef, useEffect } from 'react';
import { connectLiveSession } from '../services/gemini';

export const VoiceLive: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const disconnectRef = useRef<(() => Promise<void>) | null>(null);

  const toggleConnection = async () => {
    if (connected) {
      if (disconnectRef.current) await disconnectRef.current();
      setConnected(false);
    } else {
      try {
        const session = await connectLiveSession(
          (audioBuffer) => {
             // Visualizer removed for performance/no-animation requirement
          },
          () => setConnected(false)
        );
        disconnectRef.current = session.disconnect;
        setConnected(true);
      } catch (e) {
        alert("Microphone access required for Live API.");
      }
    }
  };

  useEffect(() => {
    return () => {
       if (disconnectRef.current) disconnectRef.current();
    }
  }, []);

  return (
    <div className="flex flex-col h-full items-center justify-center">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-medic-neonPurple mb-2">Live Doctor</h1>
        <p className="text-gray-400">Real-time voice conversation</p>
      </div>

      <div className="relative w-[300px] h-[300px] flex items-center justify-center mb-12">
        <button
          onClick={toggleConnection}
          className={`w-32 h-32 rounded-full border-4 flex items-center justify-center text-4xl ${
            connected 
              ? 'bg-medic-neonPurple border-white text-white' 
              : 'bg-transparent border-medic-neonPurple text-medic-neonPurple'
          }`}
        >
          {connected ? '⬛' : '🎙️'}
        </button>
      </div>

      <div className="text-center">
        <div className={`text-lg font-bold mb-2 ${connected ? 'text-medic-neonGreen' : 'text-gray-500'}`}>
            {connected ? "● LIVE SESSION ACTIVE" : "● DISCONNECTED"}
        </div>
        <p className="text-sm text-gray-500 max-w-xs mx-auto">
            {connected 
            ? "Speak naturally. Tap the square to end." 
            : "Tap the microphone to start."}
        </p>
      </div>
    </div>
  );
};