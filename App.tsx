import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Scanner } from './components/Scanner';
import { ChatInterface } from './components/ChatInterface';
import { MapFinder } from './components/MapFinder';
import { VoiceLive } from './components/VoiceLive';
import { AppRoute } from './types';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(AppRoute.HOME);

  const renderContent = () => {
    switch (currentRoute) {
      case AppRoute.HOME:
        return <Dashboard onNavigate={setCurrentRoute} />;
      case AppRoute.SCAN:
        return <Scanner />;
      case AppRoute.CHAT:
        return <ChatInterface />;
      case AppRoute.MAP:
        return <MapFinder />;
      case AppRoute.LIVE:
        return <VoiceLive />;
      default:
        return <Dashboard onNavigate={setCurrentRoute} />;
    }
  };

  return (
    <Layout currentRoute={currentRoute} onNavigate={setCurrentRoute}>
      {renderContent()}
    </Layout>
  );
}