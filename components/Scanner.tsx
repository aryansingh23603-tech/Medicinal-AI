import React, { useState, useRef } from 'react';
import { enhanceAndAnalyzeImage } from '../services/gemini';
import { MedicineAnalysis } from '../types';

export const Scanner: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string | null>(null); // 'enhancing', 'analyzing'
  const [result, setResult] = useState<MedicineAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResult(null);
    setError(null);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const base64Data = base64.split(',')[1];
      setImage(base64);
      
      try {
        // Step 1: Nano Banana Enhancement (Visual + Logic)
        setLoadingStep('enhancing');
        await new Promise(resolve => setTimeout(resolve, 1500)); // Minimum visual time for "Enhancing"
        
        // Step 2: Deep Analysis
        setLoadingStep('analyzing');
        const analysis = await enhanceAndAnalyzeImage(base64Data);
        setResult(analysis);
      } catch (err: any) {
        setError(err.message || "Scan failed. Please try again.");
      } finally {
        setLoadingStep(null);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full">
      <header className="mb-6">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-medic-neonBlue to-white">
          Scan Medicine
        </h1>
        <p className="text-gray-400 text-sm mt-1">Nano-Banana Enhanced • Gemini Pro Analysis</p>
      </header>

      {!image && !result && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-700 rounded-3xl bg-medic-card/30 backdrop-blur-sm">
           <div className="w-24 h-24 rounded-full bg-medic-neonBlue/10 flex items-center justify-center mb-6 animate-pulse">
             <span className="text-4xl">💊</span>
           </div>
           <p className="text-center text-gray-300 mb-8 max-w-xs">
             Point camera at a pill bottle, strip, or box. Ensure good lighting.
           </p>
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="px-8 py-4 bg-medic-neonBlue text-black font-bold rounded-full shadow-[0_0_20px_rgba(0,243,255,0.3)] hover:scale-105 transition-transform"
           >
             Start Scan
           </button>
           <input 
             ref={fileInputRef}
             type="file" 
             accept="image/*" 
             capture="environment"
             className="hidden"
             onChange={handleFileChange}
           />
        </div>
      )}

      {image && loadingStep && (
        <div className="flex-1 flex flex-col items-center justify-center relative rounded-3xl overflow-hidden">
          <img src={image} alt="Scanning" className="absolute inset-0 w-full h-full object-cover opacity-40 blur-sm" />
          <div className="z-10 flex flex-col items-center">
            <div className="w-20 h-20 border-4 border-medic-neonBlue border-t-transparent rounded-full animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-white tracking-widest uppercase animate-pulse">
              {loadingStep === 'enhancing' ? 'Enhancing...' : 'Analyzing...'}
            </h2>
            <p className="text-medic-neonBlue text-sm mt-2 font-mono">
              {loadingStep === 'enhancing' ? 'Applying Nano-Banana Filter' : 'Querying Medical Database'}
            </p>
          </div>
          {/* Scanning Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-medic-neonBlue shadow-[0_0_30px_#00f3ff] animate-[scan_2s_ease-in-out_infinite]" />
        </div>
      )}

      {result && (
        <div className="flex-1 overflow-y-auto pb-24 animate-fade-in">
          <div className="glass-card p-6 rounded-3xl neon-border mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white">{result.name}</h2>
                <p className="text-medic-neonBlue font-mono text-sm">{result.genericName}</p>
              </div>
              <span className="px-3 py-1 bg-medic-neonGreen/20 text-medic-neonGreen text-xs rounded-full border border-medic-neonGreen/30">
                VERIFIED
              </span>
            </div>
            
            <div className="space-y-4">
              <div className="p-3 bg-white/5 rounded-xl">
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Purpose</p>
                <p className="text-sm">{result.purpose}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                 <div className="p-3 bg-white/5 rounded-xl">
                   <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Dosage</p>
                   <p className="text-sm">{result.dosage}</p>
                 </div>
                 <div className="p-3 bg-white/5 rounded-xl">
                   <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Manufacturer</p>
                   <p className="text-sm truncate">{result.manufacturer || 'Unknown'}</p>
                 </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Warnings ⚠️</p>
                <ul className="text-sm space-y-2">
                  {result.warnings.map((w, i) => (
                    <li key={i} className="flex items-start text-red-200 bg-red-900/20 p-2 rounded">
                      <span className="mr-2">•</span>{w}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <button 
            onClick={() => { setImage(null); setResult(null); }}
            className="w-full py-3 border border-white/20 rounded-xl text-gray-300 hover:bg-white/5"
          >
            Scan Another
          </button>
        </div>
      )}
      
      {error && (
        <div className="flex-1 flex flex-col items-center justify-center">
            <p className="text-red-400 mb-4 text-center">{error}</p>
            <button 
             onClick={() => { setImage(null); setError(null); }}
             className="px-6 py-2 bg-white/10 rounded-full"
           >
             Try Again
           </button>
        </div>
      )}
      
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-fade-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};