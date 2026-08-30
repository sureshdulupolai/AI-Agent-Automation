import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import DashboardPage from './pages/DashboardPage';
import BotDetailsPage from './pages/BotDetailsPage';
import WhatsAppPage from './pages/WhatsAppPage';
import LeadsPage from './pages/LeadsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DemoSitePage from './pages/DemoSitePage';
import DeploymentGuidePage from './pages/DeploymentGuidePage';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedBotId, setSelectedBotId] = useState(null);
  const [bots, setBots] = useState([]);

  // Fetch all bots for global state
  const loadBots = async () => {
    try {
      const res = await fetch('/api/bots');
      const data = await res.json();
      if (data.bots) {
        setBots(data.bots);
        if (!selectedBotId && data.bots.length > 0) {
          setSelectedBotId(data.bots[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load bots:', err);
    }
  };

  useEffect(() => {
    loadBots();
  }, []);

  const handleSelectBotStudio = (bot) => {
    setSelectedBotId(bot.id);
    setCurrentPage('bot-details');
  };

  const handleOpenWhatsApp = (bot) => {
    if (bot) setSelectedBotId(bot.id);
    setCurrentPage('whatsapp');
  };

  return (
    <AuthProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-main)' }}>
        {/* Navbar */}
        <Navbar 
          onNavigate={(page) => setCurrentPage(page)} 
          currentPage={currentPage}
        />

        {/* Body layout */}
        <div style={{ display: 'flex', flex: 1 }}>
          {/* Hide Sidebar only on fullscreen Demo Site page */}
          {currentPage !== 'demo-site' && (
            <Sidebar
              currentPage={currentPage}
              onNavigate={(page) => setCurrentPage(page)}
            />
          )}

          {/* Main Content Area */}
          <main style={{ flex: 1, overflowY: 'auto' }}>
            {currentPage === 'dashboard' && (
              <DashboardPage
                onSelectBot={handleSelectBotStudio}
                onOpenWhatsApp={handleOpenWhatsApp}
              />
            )}

            {currentPage === 'bot-details' && (
              <BotDetailsPage
                botId={selectedBotId || bots[0]?.id}
                onBack={() => setCurrentPage('dashboard')}
                onOpenWhatsApp={handleOpenWhatsApp}
              />
            )}

            {currentPage === 'whatsapp' && (
              <WhatsAppPage
                bots={bots}
                initialBotId={selectedBotId}
              />
            )}

            {currentPage === 'leads' && (
              <LeadsPage
                bots={bots}
              />
            )}

            {currentPage === 'analytics' && (
              <AnalyticsPage
                bots={bots}
              />
            )}

            {currentPage === 'demo-site' && (
              <DemoSitePage
                bots={bots}
              />
            )}

            {currentPage === 'deployment' && (
              <DeploymentGuidePage />
            )}
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
