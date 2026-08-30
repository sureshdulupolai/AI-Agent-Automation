import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Bot, 
  Inbox, 
  MessageSquare, 
  Users, 
  BarChart3, 
  Globe, 
  CloudLightning, 
  Sparkles, 
  CreditCard, 
  UserPlus, 
  HelpCircle, 
  ChevronsUpDown, 
  Check, 
  User, 
  LogOut, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Radio,
  ChevronsLeft,
  ChevronsRight,
  GitBranch,
  Search
} from 'lucide-react';
import { getInitialColor, getInitialLetter } from '../../utils/avatarUtils';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isCollapsed, onToggleCollapse }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userName = user?.full_name || 'Suresh Polai';
  const userInitial = getInitialLetter(userName);
  const avatarBg = getInitialColor(userName);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showTeamSubmenu, setShowTeamSubmenu] = useState(false);
  const [isJourneysOpen, setIsJourneysOpen] = useState(true);
  const profileMenuRef = useRef(null);

  // Close profile dropdown when clicked outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
        setShowTeamSubmenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isItemActive = (path, matches = []) => {
    const pathname = location.pathname;
    if (matches.length > 0) {
      return matches.some(m => pathname === m || (m !== '/' && pathname.startsWith(m)));
    }
    return pathname === path;
  };

  return (
    <aside style={{
      width: isCollapsed ? '68px' : '230px',
      height: '100vh',
      flexShrink: 0,
      borderRight: '1px solid var(--border-subtle)',
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: isCollapsed ? '16px 8px' : '16px 12px',
      boxSizing: 'border-box',
      position: 'relative',
      zIndex: 50,
      transition: 'width 0.2s ease',
      userSelect: 'none'
    }}>
      {/* Top Header: Brand Logo + Collapse Icon */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          paddingBottom: '16px',
          marginBottom: '10px',
          borderBottom: '1px solid var(--border-subtle)'
        }}>
          {!isCollapsed ? (
            <>
              <div 
                onClick={() => navigate('/dashboard')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)'
                }}>
                  <Bot size={16} color="#ffffff" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0f172a', letterSpacing: '-0.02em' }}>
                    OmniBot
                  </span>
                  <span style={{
                    fontSize: '9.5px',
                    fontWeight: 700,
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    color: 'var(--primary)',
                    padding: '1px 5px',
                    borderRadius: '4px'
                  }}>
                    AI
                  </span>
                </div>
              </div>

              {/* Inside Header Collapse Button when expanded (Solid Brand Color Fill, Stable Fixed Size) */}
              {onToggleCollapse && (
                <button
                  onClick={onToggleCollapse}
                  style={{
                    background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                    padding: '5px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.25)',
                    opacity: 0.95
                  }}
                  title="Collapse sidebar"
                >
                  <ChevronsLeft size={14} color="#ffffff" />
                </button>
              )}
            </>
          ) : (
            <div 
              onClick={() => navigate('/dashboard')}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.2)'
              }}
              title="OmniBot AI"
            >
              <Bot size={18} color="#ffffff" />
            </div>
          )}
        </div>

        {/* Floating Expand Button on Outside Border when Collapsed (Solid Brand Color Fill, Stable Fixed Size) */}
        {isCollapsed && onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            style={{
              position: 'absolute',
              top: '20px',
              right: '-12px',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5, #0891b2)',
              border: '2px solid #ffffff',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(79, 70, 229, 0.4)',
              cursor: 'pointer',
              zIndex: 100
            }}
            title="Expand sidebar"
          >
            <ChevronsRight size={13} color="#ffffff" />
          </button>
        )}

        {/* Navigation List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
          {/* Core Platform Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {/* AI Bots Studio */}
            <button
              onClick={() => navigate('/dashboard')}
              title={isCollapsed ? 'AI Bots Studio' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '10px',
                padding: isCollapsed ? '10px 0' : '8px 10px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isItemActive('/dashboard', ['/', '/dashboard', '/bots']) ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                color: isItemActive('/dashboard', ['/', '/dashboard', '/bots']) ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isItemActive('/dashboard', ['/', '/dashboard', '/bots']) ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <Bot size={16} color={isItemActive('/dashboard', ['/', '/dashboard', '/bots']) ? 'var(--primary)' : 'currentColor'} />
              {!isCollapsed && <span>AI Bots Studio</span>}
            </button>

            {/* Conversations */}
            <button
              onClick={() => navigate('/inbox')}
              title={isCollapsed ? 'Conversations' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '10px',
                padding: isCollapsed ? '10px 0' : '8px 10px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isItemActive('/inbox', ['/inbox', '/conversations']) ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                color: isItemActive('/inbox', ['/inbox', '/conversations']) ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isItemActive('/inbox', ['/inbox', '/conversations']) ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <Inbox size={16} color={isItemActive('/inbox', ['/inbox', '/conversations']) ? 'var(--primary)' : 'currentColor'} />
              {!isCollapsed && <span>Conversations</span>}
            </button>

            {/* Leads CRM */}
            <button
              onClick={() => navigate('/leads')}
              title={isCollapsed ? 'Leads CRM' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '10px',
                padding: isCollapsed ? '10px 0' : '8px 10px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isItemActive('/leads', ['/leads', '/audience']) ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                color: isItemActive('/leads', ['/leads', '/audience']) ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isItemActive('/leads', ['/leads', '/audience']) ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <Users size={16} color={isItemActive('/leads', ['/leads', '/audience']) ? 'var(--primary)' : 'currentColor'} />
              {!isCollapsed && <span>Leads CRM</span>}
            </button>

            {/* Analytics & Logs */}
            <button
              onClick={() => navigate('/analytics')}
              title={isCollapsed ? 'Analytics & Logs' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '10px',
                padding: isCollapsed ? '10px 0' : '8px 10px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isItemActive('/analytics', ['/analytics']) ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                color: isItemActive('/analytics', ['/analytics']) ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isItemActive('/analytics', ['/analytics']) ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <BarChart3 size={16} color={isItemActive('/analytics', ['/analytics']) ? 'var(--primary)' : 'currentColor'} />
              {!isCollapsed && <span>Analytics &amp; Logs</span>}
            </button>
          </div>

          {/* JOURNEYS SECTION matching Chatzy Image 1 */}
          <div>
            {!isCollapsed ? (
              <div
                onClick={() => setIsJourneysOpen(!isJourneysOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: location.pathname.startsWith('/journeys') ? 'var(--primary)' : 'var(--text-primary)',
                  fontWeight: 700,
                  fontSize: '13px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <GitBranch size={16} />
                  <span>Journeys</span>
                </div>
                {isJourneysOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </div>
            ) : (
              <button
                onClick={() => navigate('/journeys/templates')}
                title="Journeys"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '10px 0',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: location.pathname.startsWith('/journeys') ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                  color: location.pathname.startsWith('/journeys') ? 'var(--primary)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                <GitBranch size={16} />
              </button>
            )}

            {/* Journeys Sub-items */}
            {!isCollapsed && isJourneysOpen && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                paddingLeft: '28px',
                marginTop: '4px',
                borderLeft: '1.5px solid var(--border-subtle)',
                marginLeft: '18px'
              }}>
                <button
                  onClick={() => navigate('/journeys/templates')}
                  style={{
                    display: 'block',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: isItemActive('/journeys/templates', ['/journeys/templates', '/journeys/create']) ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                    color: isItemActive('/journeys/templates', ['/journeys/templates', '/journeys/create']) ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: isItemActive('/journeys/templates', ['/journeys/templates', '/journeys/create']) ? 700 : 500,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  Create Journey
                </button>

                <button
                  onClick={() => navigate('/journeys')}
                  style={{
                    display: 'block',
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: location.pathname === '/journeys' ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                    color: location.pathname === '/journeys' ? 'var(--primary)' : 'var(--text-secondary)',
                    fontWeight: location.pathname === '/journeys' ? 700 : 500,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%'
                  }}
                >
                  My Journeys
                </button>
              </div>
            )}
          </div>

          {/* CHANNELS SECTION */}
          <div>
            {!isCollapsed && (
              <div style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '4px 8px 6px 8px'
              }}>
                Channels
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                onClick={() => navigate('/channels/website')}
                title={isCollapsed ? 'Website Widget' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: '10px',
                  padding: isCollapsed ? '10px 0' : '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isItemActive('/channels/website') ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                  color: isItemActive('/channels/website') ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: isItemActive('/channels/website') ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <Globe size={16} color={isItemActive('/channels/website') ? 'var(--primary)' : 'currentColor'} />
                {!isCollapsed && <span>Website Widget</span>}
              </button>

              <button
                onClick={() => navigate('/channels/whatsapp')}
                title={isCollapsed ? 'WhatsApp Testing' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: '10px',
                  padding: isCollapsed ? '10px 0' : '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isItemActive('/channels/whatsapp') ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                  color: isItemActive('/channels/whatsapp') ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: isItemActive('/channels/whatsapp') ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <MessageSquare size={16} color={isItemActive('/channels/whatsapp') ? 'var(--primary)' : 'currentColor'} />
                {!isCollapsed && <span>WhatsApp Testing</span>}
              </button>
            </div>
          </div>

          {/* TOOLS & DEPLOY */}
          <div>
            {!isCollapsed && (
              <div style={{
                fontSize: '10px',
                fontWeight: 700,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                padding: '4px 8px 6px 8px'
              }}>
                Tools &amp; Deploy
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                onClick={() => navigate('/demo')}
                title={isCollapsed ? 'Client Demo Site' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: '10px',
                  padding: isCollapsed ? '10px 0' : '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isItemActive('/demo') ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                  color: isItemActive('/demo') ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: isItemActive('/demo') ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <Radio size={16} color={isItemActive('/demo') ? 'var(--primary)' : 'currentColor'} />
                {!isCollapsed && <span>Client Demo Site</span>}
              </button>

              <button
                onClick={() => navigate('/deployment')}
                title={isCollapsed ? 'Cloud Deployment' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: '10px',
                  padding: isCollapsed ? '10px 0' : '8px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: isItemActive('/deployment') ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                  color: isItemActive('/deployment') ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: isItemActive('/deployment') ? 700 : 500,
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <CloudLightning size={16} color={isItemActive('/deployment') ? 'var(--primary)' : 'currentColor'} />
                {!isCollapsed && <span>Cloud Deployment</span>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Area: Special Action + Utilities + Workspace Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
        {/* Special "Ask OmniBot AI" Button matching Chatzy Image 1 */}
        {!isCollapsed ? (
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '9px 12px',
              borderRadius: '8px',
              border: '1.5px solid rgba(79, 70, 229, 0.4)',
              background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.06), rgba(8, 145, 178, 0.06))',
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(79, 70, 229, 0.08)',
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={15} color="var(--primary)" />
            <span>Ask OmniBot AI</span>
          </button>
        ) : (
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '10px 0',
              borderRadius: '8px',
              border: '1px solid rgba(79, 70, 229, 0.3)',
              backgroundColor: 'rgba(79, 70, 229, 0.06)',
              cursor: 'pointer'
            }}
            title="Ask OmniBot AI"
          >
            <Sparkles size={16} color="var(--primary)" />
          </button>
        )}

        {/* Secondary Navigation Links */}
        {!isCollapsed && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <button
              onClick={() => navigate('/deployment')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                padding: '6px 8px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '12.5px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <CreditCard size={14} />
              <span>Billing &amp; Usage</span>
            </button>

            <button
              onClick={() => alert('Invite link copied: https://omnibot.io/invite/suresh')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '9px',
                padding: '6px 8px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-secondary)',
                fontSize: '12.5px',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <UserPlus size={14} />
              <span>Invite team members</span>
            </button>
          </div>
        )}

        {/* Workspace / User Profile Bar (Matching Chatzy Image 2 Popover) */}
        <div ref={profileMenuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: isCollapsed ? 'center' : 'space-between',
              padding: '7px 8px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: showProfileMenu ? 'var(--bg-subtle)' : '#ffffff',
              cursor: 'pointer',
              transition: 'background 0.12s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: avatarBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '11px',
                flexShrink: 0
              }}>
                {userInitial}
              </div>

              {!isCollapsed && (
                <span style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {userName}
                </span>
              )}
            </div>

            {!isCollapsed && <ChevronsUpDown size={14} color="var(--text-muted)" />}
          </button>

          {/* Profile Dropdown Menu matching Chatzy Image 2 */}
          {showProfileMenu && (
            <div className="animate-fade-in" style={{
              position: 'absolute',
              bottom: '44px',
              left: isCollapsed ? '60px' : '0',
              width: '210px',
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
              padding: '6px',
              zIndex: 100
            }}>
              {/* Switch team */}
              <div 
                style={{ position: 'relative' }}
                onMouseEnter={() => setShowTeamSubmenu(true)}
                onMouseLeave={() => setShowTeamSubmenu(false)}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  backgroundColor: showTeamSubmenu ? 'var(--bg-subtle)' : 'transparent'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={14} color="var(--primary)" />
                    <span>Switch team to</span>
                  </div>
                  <ChevronRight size={13} color="var(--text-muted)" />
                </div>

                {/* Team Submenu matching Chatzy Image 2 */}
                {showTeamSubmenu && (
                  <div style={{
                    position: 'absolute',
                    left: '100%',
                    bottom: 0,
                    width: '180px',
                    backgroundColor: '#ffffff',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.08)',
                    padding: '6px',
                    marginLeft: '4px'
                  }}>
                    <div style={{ position: 'relative', marginBottom: '6px' }}>
                      <input
                        type="text"
                        placeholder="Search teams"
                        style={{
                          width: '100%',
                          fontSize: '11.5px',
                          padding: '5px 8px',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '5px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '7px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(79, 70, 229, 0.1)',
                      color: 'var(--primary)',
                      fontWeight: 700,
                      fontSize: '12px'
                    }}>
                      <span>My Team</span>
                      <Check size={13} />
                    </div>
                  </div>
                )}
              </div>

              {/* Profile */}
              <div 
                onClick={() => {
                  setShowProfileMenu(false);
                  alert(`Logged in as ${userName} (Pro Plan)`);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <User size={14} color="var(--text-secondary)" />
                <span>Profile</span>
              </div>

              {/* Logout */}
              <div 
                onClick={() => {
                  setShowProfileMenu(false);
                  alert('Session active (Suresh Polai)');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  fontSize: '12.5px',
                  color: '#ef4444',
                  cursor: 'pointer',
                  borderTop: '1px solid var(--border-subtle)',
                  marginTop: '4px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.06)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <LogOut size={14} />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
