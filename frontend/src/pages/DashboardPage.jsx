import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Plus, 
  Users, 
  MessageSquare, 
  Zap, 
  RefreshCw,
  Search,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import BotCard from '../components/bots/BotCard';
import BotBuilderModal from '../components/bots/BotBuilderModal';
import EmbedSnippetModal from '../components/bots/EmbedSnippetModal';

export default function DashboardPage({ onSelectBot, onOpenWhatsApp, onOpenEmbed }) {
  const navigate = useNavigate();
  const [bots, setBots] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [selectedEmbedBot, setSelectedEmbedBot] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [botsRes, leadsRes] = await Promise.all([
        fetch('/api/bots'),
        fetch('/api/leads')
      ]);

      const botsData = await botsRes.json();
      const leadsData = await leadsRes.json();

      if (botsData.bots) setBots(botsData.bots);
      if (leadsData.leads) setLeads(leadsData.leads);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteBot = async (botId) => {
    if (!window.confirm('Are you sure you want to delete this chatbot?')) return;
    try {
      await fetch(`/api/bots/${botId}`, { method: 'DELETE' });
      setBots(bots.filter(b => b.id !== botId));
    } catch (err) {
      alert('Failed to delete bot');
    }
  };

  const handleBotCreated = (newBot) => {
    setBots([newBot, ...bots]);
    setIsBuilderOpen(false);
  };

  const filteredBots = bots.filter(b => 
    b.bot_name.toLowerCase().includes(search.toLowerCase()) ||
    (b.business_knowledge && b.business_knowledge.toLowerCase().includes(search.toLowerCase()))
  );

  const activeWhatsAppCount = bots.filter(b => b.whatsapp_status === 'connected').length;

  return (
    <div style={{ padding: '28px 36px', width: '100%', boxSizing: 'border-box' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Chatbot Studio
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Manage and train autonomous AI customer agents across websites and WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setIsBuilderOpen(true)}
          className="btn-primary"
          style={{ padding: '9px 18px', fontSize: '13.5px' }}
        >
          <Plus size={16} />
          <span>New Chatbot</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
      }}>
        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Active Chatbots</span>
            <Bot size={16} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
            {bots.length}
          </div>
          <span style={{ fontSize: '11.5px', color: '#059669', fontWeight: 600 }}>Active</span>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Captured Leads</span>
            <Users size={16} color="#059669" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
            {leads.length}
          </div>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Auto-extracted</span>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>WhatsApp Channels</span>
            <MessageSquare size={16} color="#0891b2" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '2px' }}>
            {activeWhatsAppCount} / {bots.length}
          </div>
          <span style={{ fontSize: '11.5px', color: activeWhatsAppCount > 0 ? '#059669' : '#d97706', fontWeight: 600 }}>
            {activeWhatsAppCount > 0 ? 'Connected' : 'Available'}
          </span>
        </div>

        <div className="glass-panel" style={{ padding: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>Infrastructure Cost</span>
            <Zap size={16} color="#059669" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginBottom: '2px' }}>
            ₹0.00
          </div>
          <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Free Tier</span>
        </div>
      </div>

      {/* Bots Grid Section */}
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)' }}>Chatbots</h2>

        {/* Search */}
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '11px', top: '10px' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '32px', width: '100%', fontSize: '12.5px', padding: '7px 10px 7px 32px' }}
            placeholder="Search chatbots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid of Bot Cards */}
      {loading ? (
        <div style={{ padding: '50px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 10px auto' }} />
          <p style={{ fontSize: '13px' }}>Loading chatbots...</p>
        </div>
      ) : filteredBots.length === 0 ? (
        <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <Bot size={36} color="var(--primary)" style={{ margin: '0 auto 12px auto', opacity: 0.6 }} />
          <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', marginBottom: '6px' }}>No Chatbots Found</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px', maxWidth: '360px', margin: '0 auto 16px auto' }}>
            Create your first AI customer agent to get started.
          </p>
          <button onClick={() => setIsBuilderOpen(true)} className="btn-primary" style={{ padding: '8px 16px' }}>
            <Plus size={15} /> New Chatbot
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '18px'
        }}>
          {filteredBots.map((bot) => (
            <BotCard
              key={bot.id}
              bot={bot}
              onSelect={() => onSelectBot ? onSelectBot(bot) : navigate(`/bots/${bot.id}`)}
              onOpenWhatsApp={() => onOpenWhatsApp ? onOpenWhatsApp(bot) : navigate(`/channels/whatsapp?botId=${bot.id}`)}
              onOpenEmbed={() => onOpenEmbed ? onOpenEmbed(bot) : navigate(`/channels/website?botId=${bot.id}`)}
              onDelete={() => handleDeleteBot(bot.id)}
            />
          ))}
        </div>
      )}

      {/* Create Bot Modal */}
      {isBuilderOpen && (
        <BotBuilderModal
          onClose={() => setIsBuilderOpen(false)}
          onCreated={handleBotCreated}
        />
      )}

      {/* Embed Code Modal */}
      {selectedEmbedBot && (
        <EmbedSnippetModal
          bot={selectedEmbedBot}
          onClose={() => setSelectedEmbedBot(null)}
        />
      )}
    </div>
  );
}
