import React, { useState, useRef, useEffect } from 'react';
import { connectLiveSession } from '../services/gemini';

export const VoiceLive: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [volume, setVolume] = useState(0);
  const disconnectRef = useRef<(() => Promise<void>) | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const toggleConnection = async () => {
    if (connected) {
      if (disconnectRef.current) await disconnectRef.current();
      setConnected(false);
      setVolume(0);
    } else {
      try {
        const session = await connectLiveSession(
          (audioBuffer) => {
             // Simple visualizer logic based on buffer data
             const data = audioBuffer.getChannelData(0);
             let sum = 0;
             for(let i=0; i<data.length; i++) sum += Math.abs(data[i]);
             const avg = sum / data.length;
             setVolume(Math.min(avg * 5, 1)); // Amplify for visual
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

  // Visualizer Loop
  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, 300, 150);
      if (connected) {
          ctx.fillStyle = '#bc13fe'; // Neon Purple
          const height = 50 + (volume * 100);
          const width = 50 + (volume * 100);
          
          ctx.beginPath();
          ctx.arc(150, 75, width/2, 0, Math.PI * 2);
          ctx.fill();

          // Outer Glow
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#bc13fe';
      }
      animationRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animationRef.current);
  }, [connected, volume]);

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
        <canvas ref={canvasRef} width={300} height={150} className="absolute inset-0" />
        
        <button
          onClick={toggleConnection}
          className={`relative z-10 w-32 h-32 rounded-full border-4 transition-all duration-300 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(188,19,254,0.3)] ${
            connected 
              ? 'bg-medic-neonPurple border-white text-white scale-110' 
              : 'bg-transparent border-medic-neonPurple text-medic-neonPurple hover:bg-medic-neonPurple/10'
          }`}
        >
          {connected ? '⬛' : '🎙️'}
        </button>
      </div>

      <p className="text-sm text-gray-500 max-w-xs text-center">
        {connected 
          ? "Listening... Speak naturally." 
          : "Tap the microphone to start a secure voice session with AI."}
      </p>
    </div>
  );
};