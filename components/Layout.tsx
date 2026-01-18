import React from 'react';
import { AppRoute } from '../types';

interface LayoutProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  children: React.ReactNode;
}

const NavButton: React.FC<{ 
  active: boolean; 
  onClick: () => void; 
  icon: string; 
  label: string 
}> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${
      active ? 'text-medic-neonBlue scale-110' : 'text-gray-500 hover:text-gray-300'
    }`}
  >
    <span className="text-xl mb-1">{icon}</span>
    <span className="text-[10px] font-medium tracking-wider">{label}</span>
    {active && (
      <div className="absolute top-0 w-8 h-1 bg-medic-neonBlue blur-[4px] rounded-full" />
    )}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ currentRoute, onNavigate, children }) => {
  return (
    <div className="min-h-screen bg-medic-black text-slate-200 font-sans selection:bg-medic-neonBlue selection:text-black overflow-hidden flex flex-col relative">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-medic-neonBlue opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-medic-neonPurple opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 relative z-10 px-4 pt-6 max-w-2xl mx-auto w-full">
        {children}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-md h-20 glass-card rounded-2xl flex justify-around items-center px-2 z-50 neon-border">
        <NavButton 
          active={currentRoute === AppRoute.HOME} 
          onClick={() => onNavigate(AppRoute.HOME)} 
          icon="⚡" 
          label="DASH" 
        />
        <NavButton 
          active={currentRoute === AppRoute.MAP} 
          onClick={() => onNavigate(AppRoute.MAP)} 
          icon="🗺️" 
          label="FIND" 
        />
        
        {/* Central Scan Button */}
        <div className="relative -top-6">
          <button 
            onClick={() => onNavigate(AppRoute.SCAN)}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-medic-neonBlue to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(0,243,255,0.4)] hover:scale-105 transition-transform active:scale-95 text-black text-2xl"
          >
            📸
          </button>
          <div className="absolute inset-0 rounded-full animate-pulse-fast border border-medic-neonBlue opacity-50 pointer-events-none" />
        </div>

        <NavButton 
          active={currentRoute === AppRoute.CHAT} 
          onClick={() => onNavigate(AppRoute.CHAT)} 
          icon="💬" 
          label="ASK" 
        />
        <NavButton 
          active={currentRoute === AppRoute.LIVE} 
          onClick={() => onNavigate(AppRoute.LIVE)} 
          icon="🎙️" 
          label="LIVE" 
        />
      </div>
    </div>
  );
};