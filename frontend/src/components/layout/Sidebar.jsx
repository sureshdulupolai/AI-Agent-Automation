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
  Search,
  Plug,
  Send
} from 'lucide-react';
import { getInitialColor, getInitialLetter } from '../../utils/avatarUtils';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar({ isCollapsed, onToggleCollapse, onOpenCopilot }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const userName = user?.full_name || 'Suresh Polai';
  const userInitial = getInitialLetter(userName);
  const avatarBg = getInitialColor(userName);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showTeamSubmenu, setShowTeamSubmenu] = useState(false);
  const [isJourneysOpen, setIsJourneysOpen] = useState(true);
  const [isAudienceOpen, setIsAudienceOpen] = useState(true);
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
                <img 
                  src="/novabyte_logo.jpg" 
                  alt="NovaByte AI" 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.3)'
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '15.5px', fontWeight: 900, fontFamily: 'var(--font-heading)', color: '#0f172a', letterSpacing: '-0.02em' }}>
                    NovaByte
                  </span>
                  <span style={{
                    fontSize: '9.5px',
                    fontWeight: 800,
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
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)'
              }}
              title="NovaByte AI Studio"
            >
              <img 
                src="/novabyte_logo.jpg" 
                alt="NovaByte AI" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
          {/* 1. Core Platform Hub */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {!isCollapsed && (
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px 4px 8px' }}>
                Core
              </div>
            )}

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

            {/* Audience CRM */}
            <div>
              {!isCollapsed ? (
                <div
                  onClick={() => setIsAudienceOpen(!isAudienceOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: (location.pathname.startsWith('/contacts') || location.pathname.startsWith('/leads') || location.pathname.startsWith('/lists-and-segments')) ? 'var(--primary)' : 'var(--text-secondary)',
                    backgroundColor: (location.pathname.startsWith('/contacts') || location.pathname.startsWith('/leads') || location.pathname.startsWith('/lists-and-segments')) ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                    fontWeight: (location.pathname.startsWith('/contacts') || location.pathname.startsWith('/leads') || location.pathname.startsWith('/lists-and-segments')) ? 700 : 500,
                    fontSize: '13px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Users size={16} />
                    <span>Audience CRM</span>
                  </div>
                  {isAudienceOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
              ) : (
                <button
                  onClick={() => navigate('/contacts')}
                  title="Audience CRM"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '10px 0',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: (location.pathname.startsWith('/contacts') || location.pathname.startsWith('/leads') || location.pathname.startsWith('/lists-and-segments')) ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                    color: (location.pathname.startsWith('/contacts') || location.pathname.startsWith('/leads') || location.pathname.startsWith('/lists-and-segments')) ? 'var(--primary)' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  <Users size={16} />
                </button>
              )}

              {!isCollapsed && isAudienceOpen && (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  paddingLeft: '14px',
                  marginTop: '3px',
                  borderLeft: '1.5px solid var(--border-subtle)',
                  marginLeft: '16px'
                }}>
                  <button
                    onClick={() => navigate('/contacts')}
                    style={{
                      display: 'block',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: (location.pathname === '/contacts' || location.pathname === '/leads') ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                      color: (location.pathname === '/contacts' || location.pathname === '/leads') ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: (location.pathname === '/contacts' || location.pathname === '/leads') ? 700 : 500,
                      fontSize: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    Contacts
                  </button>

                  <button
                    onClick={() => navigate('/lists-and-segments')}
                    style={{
                      display: 'block',
                      padding: '5px 8px',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: location.pathname === '/lists-and-segments' ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                      color: location.pathname === '/lists-and-segments' ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: location.pathname === '/lists-and-segments' ? 700 : 500,
                      fontSize: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%'
                    }}
                  >
                    Lists &amp; Segments
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 2. Outreach & Campaigns Hub */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {!isCollapsed && (
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px 4px 8px' }}>
                Outreach &amp; Growth
              </div>
            )}

            {/* Broadcasts & Campaigns */}
            <button
              onClick={() => navigate('/campaigns')}
              title={isCollapsed ? 'Broadcasts & Campaigns' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '10px',
                padding: isCollapsed ? '10px 0' : '8px 10px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isItemActive('/campaigns') ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                color: isItemActive('/campaigns') ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isItemActive('/campaigns') ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <Send size={16} color={isItemActive('/campaigns') ? 'var(--primary)' : 'currentColor'} />
              {!isCollapsed && <span>Campaigns &amp; Bulk</span>}
            </button>

            {/* Automations & Sequences */}
            <button
              onClick={() => navigate('/automations')}
              title={isCollapsed ? 'Automations' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '10px',
                padding: isCollapsed ? '10px 0' : '8px 10px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isItemActive('/automations', ['/automations', '/journeys']) ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                color: isItemActive('/automations', ['/automations', '/journeys']) ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isItemActive('/automations', ['/automations', '/journeys']) ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <GitBranch size={16} color={isItemActive('/automations', ['/automations', '/journeys']) ? 'var(--primary)' : 'currentColor'} />
              {!isCollapsed && <span>Automations</span>}
            </button>
          </div>

          {/* 3. Channels & Reports Hub */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {!isCollapsed && (
              <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '2px 8px 4px 8px' }}>
                Channels &amp; Data
              </div>
            )}

            {/* Integrations & Channels */}
            <button
              onClick={() => navigate('/integrations')}
              title={isCollapsed ? 'Integrations' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
                gap: '10px',
                padding: isCollapsed ? '10px 0' : '8px 10px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isItemActive('/integrations') ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                color: isItemActive('/integrations') ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isItemActive('/integrations') ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <Plug size={16} color={isItemActive('/integrations') ? 'var(--primary)' : 'currentColor'} />
              {!isCollapsed && <span>Integrations</span>}
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
                backgroundColor: isItemActive('/analytics') ? 'rgba(79, 70, 229, 0.1)' : 'transparent',
                color: isItemActive('/analytics') ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: isItemActive('/analytics') ? 700 : 500,
                fontSize: '13px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%'
              }}
            >
              <BarChart3 size={16} color={isItemActive('/analytics') ? 'var(--primary)' : 'currentColor'} />
              {!isCollapsed && <span>Analytics</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Area: Special Action + Utilities + Workspace Selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
        {/* Special "Ask NovaByte AI" Button */}
        {!isCollapsed ? (
          <button
            onClick={onOpenCopilot}
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
            <span>Ask NovaByte AI</span>
          </button>
        ) : (
          <button
            onClick={onOpenCopilot}
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
            title="Ask NovaByte AI"
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
