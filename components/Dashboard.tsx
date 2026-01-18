import React from 'react';
import { AppRoute } from '../types';

export const Dashboard: React.FC<{ onNavigate: (r: AppRoute) => void }> = ({ onNavigate }) => {
  return (
    <div className="space-y-6">
      <header className="pt-4">
        <h1 className="text-4xl font-bold text-white mb-1">Medicinal AI</h1>
        <p className="text-medic-neonBlue tracking-widest text-xs uppercase font-bold">Premium Health Intelligence</p>
      </header>

      {/* Main Action Card */}
      <div 
        onClick={() => onNavigate(AppRoute.SCAN)}
        className="glass-card p-6 rounded-3xl relative overflow-hidden cursor-pointer border-medic-neonBlue/50"
      >
        <div className="absolute right-0 top-0 w-32 h-32 bg-medic-neonBlue/20 rounded-full" />
        <h2 className="text-2xl font-bold text-white mb-2 relative z-10">Scan Medicine</h2>
        <p className="text-gray-300 text-sm mb-4 max-w-[200px] relative z-10">
          Identify pills, bottles, and prescriptions instantly with Nano Banana AI.
        </p>
        <div className="flex items-center text-medic-neonBlue font-bold text-sm relative z-10">
          <span>START SCAN</span>
          <span className="ml-2">→</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div 
            onClick={() => onNavigate(AppRoute.CHAT)}
            className="glass-card p-5 rounded-3xl cursor-pointer"
        >
            <span className="text-3xl mb-3 block">💬</span>
            <h3 className="font-bold text-white">Dr. Chat</h3>
            <p className="text-xs text-gray-400 mt-1">Ask questions</p>
        </div>
        <div 
            onClick={() => onNavigate(AppRoute.MAP)}
            className="glass-card p-5 rounded-3xl cursor-pointer"
        >
            <span className="text-3xl mb-3 block">🏥</span>
            <h3 className="font-bold text-white">Find Care</h3>
            <p className="text-xs text-gray-400 mt-1">Nearby clinics</p>
        </div>
      </div>

      <div>
        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-3">Recent Alerts</h3>
        <div className="glass-card p-4 rounded-2xl border-l-4 border-yellow-500 mb-3">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-white">Ibuprofen</h4>
            <span className="text-[10px] text-gray-500">2h ago</span>
          </div>
          <p className="text-xs text-yellow-200 mt-1">⚠️ Avoid taking on an empty stomach.</p>
        </div>
        <div className="glass-card p-4 rounded-2xl border-l-4 border-medic-neonBlue">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-white">Amoxicillin</h4>
            <span className="text-[10px] text-gray-500">Yesterday</span>
          </div>
          <p className="text-xs text-gray-300 mt-1">Complete the full course as prescribed.</p>
        </div>
      </div>
    </div>
  );
};