import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Plus, 
  Users, 
  MessageSquare, 
  Sparkles, 
  Zap, 
  Layers, 
  RefreshCw,
  Search
} from 'lucide-react';
import BotCard from '../components/bots/BotCard';
import BotBuilderModal from '../components/bots/BotBuilderModal';
import EmbedSnippetModal from '../components/bots/EmbedSnippetModal';

export default function DashboardPage({ onSelectBot, onOpenWhatsApp }) {
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
    <div style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Top Banner / Welcome */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#ffffff', marginBottom: '6px' }}>
            AI Chatbot Studio & Hub
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
            Build, train, and deploy autonomous multi-tenant AI agents across websites & WhatsApp.
          </p>
        </div>

        <button
          onClick={() => setIsBuilderOpen(true)}
          className="btn-primary"
          style={{ padding: '12px 24px', fontSize: '15px' }}
        >
          <Plus size={18} />
          <span>Create New AI Bot</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '20px',
        marginBottom: '36px'
      }}>
        {/* Metric 1 */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Active AI Bots</span>
            <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <Bot size={20} color="#818cf8" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
            {bots.length}
          </div>
          <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 600 }}>Unlimited Free Tier</span>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Captured Leads</span>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <Users size={20} color="#34d399" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
            {leads.length}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Auto-extracted via AI Brain</span>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>WhatsApp Automation</span>
            <div style={{ background: 'rgba(56, 189, 248, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <MessageSquare size={20} color="#38bdf8" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
            {activeWhatsAppCount} / {bots.length}
          </div>
          <span style={{ fontSize: '12px', color: activeWhatsAppCount > 0 ? '#34d399' : '#fbbf24', fontWeight: 600 }}>
            {activeWhatsAppCount > 0 ? 'Baileys QR Engine Linked' : 'Ready to Connect'}
          </span>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Infrastructure Cost</span>
            <div style={{ background: 'rgba(236, 72, 153, 0.15)', padding: '8px', borderRadius: '10px' }}>
              <Zap size={20} color="#f472b6" />
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: '#34d399', marginBottom: '4px' }}>
            ₹0 / mo
          </div>
          <span style={{ fontSize: '12px', color: '#38bdf8' }}>Google Gemini + Supabase Free</span>
        </div>
      </div>

      {/* Bots Grid Section */}
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ fontSize: '20px', color: '#ffffff' }}>Your AI Chatbots</h2>
          <span className="badge badge-purple">{bots.length} Active</span>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={16} color="var(--text-dark)" style={{ position: 'absolute', left: '12px', top: '12px' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '36px', width: '100%', fontSize: '13px' }}
            placeholder="Search bots..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      {filteredBots.length === 0 ? (
        <div className="glass-panel" style={{ padding: '48px', textAlign: 'center' }}>
          <Bot size={48} color="#6366f1" style={{ margin: '0 auto 16px' }} />
          <h3 style={{ fontSize: '18px', color: '#ffffff', marginBottom: '8px' }}>No Chatbots Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '20px' }}>
            Create your first AI bot to get an embeddable widget & connect WhatsApp automation.
          </p>
          <button onClick={() => setIsBuilderOpen(true)} className="btn-primary">
            <Plus size={16} />
            <span>Create AI Bot Now</span>
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
          gap: '24px'
        }}>
          {filteredBots.map((bot) => (
            <BotCard
              key={bot.id}
              bot={bot}
              onSelectStudio={onSelectBot}
              onOpenEmbed={(b) => setSelectedEmbedBot(b)}
              onOpenWhatsApp={onOpenWhatsApp}
              onDelete={handleDeleteBot}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {isBuilderOpen && (
        <BotBuilderModal
          onClose={() => setIsBuilderOpen(false)}
          onCreated={handleBotCreated}
        />
      )}

      {selectedEmbedBot && (
        <EmbedSnippetModal
          bot={selectedEmbedBot}
          onClose={() => setSelectedEmbedBot(null)}
        />
      )}
    </div>
  );
}
