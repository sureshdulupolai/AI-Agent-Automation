import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import DashboardPage from './pages/DashboardPage';
import BotDetailsPage from './pages/BotDetailsPage';
import InboxPage from './pages/InboxPage';
import WhatsAppPage from './pages/WhatsAppPage';
import WebsiteChannelPage from './pages/WebsiteChannelPage';
import LeadsPage from './pages/LeadsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DemoSitePage from './pages/DemoSitePage';
import DeploymentGuidePage from './pages/DeploymentGuidePage';
import EmbedSnippetModal from './components/bots/EmbedSnippetModal';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedBotId, setSelectedBotId] = useState(null);
  const [bots, setBots] = useState([]);
  const [embedModalBot, setEmbedModalBot] = useState(null);

  // Set pristine light theme as permanent standard
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

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

  const handleOpenEmbed = (bot) => {
    if (bot) setSelectedBotId(bot.id);
    setCurrentPage('website-channel');
  };

  return (
    <AuthProvider>
      <div style={{
        height: '100vh',
        maxHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--bg-page)'
      }}>
        {/* Sleek Compact Navbar */}
        <Navbar 
          onNavigate={(page) => setCurrentPage(page)} 
          currentPage={currentPage}
        />

        {/* Full-Height Body Container (100vh - 50px Navbar) */}
        <div style={{
          height: 'calc(100vh - 50px)',
          display: 'flex',
          flex: 1,
          overflow: 'hidden'
        }}>
          {/* Sidebar */}
          {currentPage !== 'demo-site' && (
            <Sidebar
              currentPage={currentPage}
              onNavigate={(page) => setCurrentPage(page)}
            />
          )}

          {/* Main Scrollable Viewport */}
          <main style={{
            flex: 1,
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            backgroundColor: 'var(--bg-page)',
            position: 'relative'
          }}>
            {currentPage === 'dashboard' && (
              <DashboardPage
                onSelectBot={handleSelectBotStudio}
                onOpenWhatsApp={handleOpenWhatsApp}
                onOpenEmbed={handleOpenEmbed}
              />
            )}

            {currentPage === 'bot-details' && (
              <BotDetailsPage
                botId={selectedBotId || bots[0]?.id}
                onBack={() => setCurrentPage('dashboard')}
                onOpenWhatsApp={handleOpenWhatsApp}
                onOpenEmbed={handleOpenEmbed}
              />
            )}

            {currentPage === 'website-channel' && (
              <WebsiteChannelPage
                bots={bots}
              />
            )}

            {currentPage === 'inbox' && (
              <InboxPage />
            )}

            {currentPage === 'whatsapp' && (
              <WhatsAppPage
                bots={bots}
                initialBotId={selectedBotId}
                onNavigate={(page) => setCurrentPage(page)}
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

        {/* 1-Click Embed Snippet Modal */}
        {embedModalBot && (
          <EmbedSnippetModal
            bot={embedModalBot}
            onClose={() => setEmbedModalBot(null)}
          />
        )}
      </div>
    </AuthProvider>
  );
}
