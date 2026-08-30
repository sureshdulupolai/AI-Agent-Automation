import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Search, 
  Filter, 
  Bot, 
  MessageSquare, 
  Mail, 
  ArrowRight, 
  Lock, 
  Plus, 
  Edit3, 
  Layout, 
  GitBranch, 
  UserPlus 
} from 'lucide-react';
import { JOURNEY_TEMPLATES } from '../../data/journeyTemplates';
import NameJourneyModal from '../../components/journeys/NameJourneyModal';

// Helper component to render the sequence of icons at the top of each template card
const SequenceBadge = ({ sequence = [] }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'whatsapp':
        return (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#10b981'
          }}>
            <MessageSquare size={16} />
          </div>
        );
      case 'instagram':
        return (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'rgba(225, 29, 72, 0.08)',
            border: '1px solid rgba(225, 29, 72, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#e11d48'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
          </div>
        );
      case 'agent':
        return (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
            border: '1px solid rgba(79, 70, 229, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <Bot size={16} />
          </div>
        );
      case 'message':
        return (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'rgba(8, 145, 178, 0.08)',
            border: '1px solid rgba(8, 145, 178, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#0891b2'
          }}>
            <Mail size={16} />
          </div>
        );
      case 'flow':
        return (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'rgba(124, 58, 237, 0.08)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#7c3aed'
          }}>
            <GitBranch size={16} />
          </div>
        );
      case 'lead':
        return (
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
            border: '1px solid rgba(79, 70, 229, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--primary)'
          }}>
            <UserPlus size={16} />
          </div>
        );
      default:
        return <Bot size={16} />;
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
      {sequence.map((item, idx) => (
        <React.Fragment key={idx}>
          {getIcon(item)}
          {idx === 0 && sequence.length > 1 && (
            <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>→</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default function JourneyTemplatesPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);

  const featuredTemplates = JOURNEY_TEMPLATES.filter(t => 
    t.category === 'featured' && 
    (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     t.bullets.some(b => b.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const allTemplates = JOURNEY_TEMPLATES.filter(t => 
    t.category === 'all' && 
    (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     t.bullets.some(b => b.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const handleCardClick = (template) => {
    setSelectedTemplate(template);
    setIsNameModalOpen(true);
  };

  const handleCreateFromScratch = () => {
    setSelectedTemplate({
      title: 'Custom Journey',
      defaultNodes: [
        {
          id: 'node-1',
          type: 'assign_agent',
          title: 'Assign to AI Agent',
          bot_id: '',
          bot_name: 'Select Bot',
          is_configured: false
        }
      ]
    });
    setIsNameModalOpen(true);
  };

  const handleConfirmCreate = async (journeyName, template) => {
    try {
      const res = await fetch('/api/journeys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: journeyName,
          template_id: template?.id || 'custom',
          trigger: template?.defaultTrigger,
          nodes: template?.defaultNodes
        })
      });

      const data = await res.json();
      if (data.success && data.journey) {
        setIsNameModalOpen(false);
        navigate(`/journeys/journey-studio/${data.journey.id}`);
      }
    } catch (err) {
      alert('Failed to create journey: ' + err.message);
    }
  };

  return (
    <div style={{ padding: '24px 36px', maxWidth: '1280px', margin: '0 auto', position: 'relative' }}>
      {/* Top Header matching Chatzy Image 1 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Create Journey
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => window.scrollTo({ top: 300, behavior: 'smooth' })}
            style={{
              backgroundColor: '#4f46e5',
              border: 'none',
              color: '#ffffff',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)'
            }}
          >
            <Layout size={15} />
            <span>Create using Template</span>
          </button>

          <button
            onClick={handleCreateFromScratch}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              cursor: 'pointer'
            }}
          >
            <Edit3 size={14} />
            <span>Start from Scratch</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar matching Chatzy Image 1 */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '28px' }}>
        <div style={{
          flex: 1,
          position: 'relative',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)'
        }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '11px' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates"
            style={{
              width: '100%',
              border: 'none',
              background: 'transparent',
              padding: '9px 12px 9px 38px',
              fontSize: '13px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button style={{
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer'
        }}>
          <Filter size={14} />
          <span>Filter</span>
        </button>
      </div>

      {/* FEATURED TEMPLATES (3) */}
      <div style={{ marginBottom: '36px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11.5px',
          fontWeight: 800,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '16px'
        }}>
          <span>FEATURED</span>
          <span style={{
            fontSize: '10.5px',
            backgroundColor: 'var(--bg-subtle)',
            padding: '1px 6px',
            borderRadius: '10px'
          }}>
            {featuredTemplates.length}
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)', marginLeft: '6px' }} />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {featuredTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleCardClick(template)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1.5px solid var(--border-subtle)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(79, 70, 229, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                <SequenceBadge sequence={template.flowSequence} />

                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                  {template.title}
                </h3>

                <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {template.bullets.map((b, bIdx) => (
                    <li key={bIdx} style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {template.badge && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '20px',
                  paddingTop: '14px',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--text-muted)' }}>
                    <Lock size={13} />
                    <span>{template.badge}</span>
                  </div>
                  <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
                    {template.badgeAction}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ALL TEMPLATES (4) */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '11.5px',
          fontWeight: 800,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          marginBottom: '16px'
        }}>
          <span>ALL TEMPLATES</span>
          <span style={{
            fontSize: '10.5px',
            backgroundColor: 'var(--bg-subtle)',
            padding: '1px 6px',
            borderRadius: '10px'
          }}>
            {allTemplates.length}
          </span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-subtle)', marginLeft: '6px' }} />
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {allTemplates.map((template) => (
            <div
              key={template.id}
              onClick={() => handleCardClick(template)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                border: '1.5px solid var(--border-subtle)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                transition: 'all 0.18s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary)';
                e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(79, 70, 229, 0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.02)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div>
                <SequenceBadge sequence={template.flowSequence} />

                <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
                  {template.title}
                </h3>

                <ul style={{ paddingLeft: '18px', margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {template.bullets.map((b, bIdx) => (
                    <li key={bIdx} style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Name Your Journey Modal matching Chatzy Image 2 */}
      {isNameModalOpen && selectedTemplate && (
        <NameJourneyModal
          template={selectedTemplate}
          onClose={() => setIsNameModalOpen(false)}
          onCreate={handleConfirmCreate}
        />
      )}
    </div>
  );
}
