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
    className={`flex flex-col items-center justify-center w-full h-full ${
      active ? 'text-medic-neonBlue' : 'text-gray-500'
    }`}
  >
    <span className="text-xl mb-1">{icon}</span>
    <span className="text-[10px] font-medium tracking-wider">{label}</span>
    {active && (
      <div className="absolute top-0 w-8 h-1 bg-medic-neonBlue rounded-full" />
    )}
  </button>
);

export const Layout: React.FC<LayoutProps> = ({ currentRoute, onNavigate, children }) => {
  return (
    <div className="min-h-screen bg-medic-black text-slate-200 font-sans overflow-hidden flex flex-col relative">
      
      {/* Background - Static Colors instead of Blurs for performance */}
      <div className="fixed top-0 left-0 w-full h-32 bg-gradient-to-b from-medic-neonBlue/5 to-transparent pointer-events-none" />
      
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
            className="w-16 h-16 rounded-full bg-medic-neonBlue flex items-center justify-center text-black text-2xl border-4 border-medic-black"
          >
            📸
          </button>
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