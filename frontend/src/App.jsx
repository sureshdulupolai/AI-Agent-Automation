import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import DashboardPage from './pages/DashboardPage';
import BotDetailsPage from './pages/BotDetailsPage';
import InboxPage from './pages/InboxPage';
import WhatsAppPage from './pages/WhatsAppPage';
import WebsiteChannelPage from './pages/WebsiteChannelPage';
import LeadsPage from './pages/LeadsPage';
import ListsSegmentsPage from './pages/ListsSegmentsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import DemoSitePage from './pages/DemoSitePage';
import DeploymentGuidePage from './pages/DeploymentGuidePage';
import JourneyTemplatesPage from './pages/journeys/JourneyTemplatesPage';
import MyJourneysPage from './pages/journeys/MyJourneysPage';
import JourneyStudioPage from './pages/journeys/JourneyStudioPage';
import JourneyDetailsPage from './pages/journeys/JourneyDetailsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import EmbedSnippetModal from './components/bots/EmbedSnippetModal';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  const location = useLocation();
  const [bots, setBots] = useState([]);
  const [embedModalBot, setEmbedModalBot] = useState(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
      }
    } catch (err) {
      console.error('Failed to load bots:', err);
    }
  };

  useEffect(() => {
    loadBots();
  }, []);

  // Full-screen canvas for Demo Site and Journey Studio matching Chatzy
  const isFullScreenCanvas = location.pathname.startsWith('/demo') || location.pathname.startsWith('/journeys/journey-studio');

  return (
    <AuthProvider>
      <div style={{
        height: '100vh',
        maxHeight: '100vh',
        width: '100vw',
        overflow: 'hidden',
        display: 'flex',
        backgroundColor: 'var(--bg-page)'
      }}>
        {/* Full-Height Modern Sidebar Navigation matching Chatzy */}
        {!isFullScreenCanvas && (
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        )}

        {/* Main Scrollable Viewport with Real React Router Navigation */}
        <main style={{
          flex: 1,
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          backgroundColor: 'var(--bg-page)',
          position: 'relative'
        }}>
          <Routes>
            {/* Dashboard / AI Bots Studio */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/bots" element={<DashboardPage />} />
            
            {/* Bot Details Studio */}
            <Route path="/bots/:botId" element={<BotDetailsPage bots={bots} />} />

            {/* Journeys Automation (Chatzy Identical) */}
            <Route path="/journeys/templates" element={<JourneyTemplatesPage />} />
            <Route path="/journeys/create" element={<Navigate to="/journeys/templates" replace />} />
            <Route path="/journeys" element={<MyJourneysPage />} />
            <Route path="/journeys/:journeyId" element={<JourneyDetailsPage />} />
            <Route path="/journeys/journey-studio/:journeyId" element={<JourneyStudioPage bots={bots} />} />

            {/* Channels & Integrations */}
            <Route path="/channels/website" element={<WebsiteChannelPage bots={bots} />} />
            <Route path="/channels/whatsapp" element={<WhatsAppPage bots={bots} />} />
            <Route path="/integrations" element={<IntegrationsPage />} />

            {/* Conversations Inbox */}
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/conversations" element={<Navigate to="/inbox" replace />} />

            {/* Audience CRM (Chatzy Identical) */}
            <Route path="/contacts" element={<LeadsPage bots={bots} />} />
            <Route path="/leads" element={<Navigate to="/contacts" replace />} />
            <Route path="/lists-and-segments" element={<ListsSegmentsPage />} />
            <Route path="/audience" element={<Navigate to="/contacts" replace />} />

            {/* Analytics & Logs */}
            <Route path="/analytics" element={<AnalyticsPage bots={bots} />} />

            {/* Tools & Deploy */}
            <Route path="/demo" element={<DemoSitePage bots={bots} />} />
            <Route path="/deployment" element={<DeploymentGuidePage />} />

            {/* 404 Catch-All Redirect */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

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
