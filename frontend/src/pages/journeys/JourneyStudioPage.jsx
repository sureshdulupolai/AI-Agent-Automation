import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  RotateCcw, 
  Maximize2, 
  ZoomIn, 
  ZoomOut, 
  Lock, 
  Unlock, 
  Save, 
  Check, 
  Trash2, 
  AlertTriangle, 
  Plus, 
  Clock, 
  Bot, 
  Mail, 
  GitBranch, 
  Globe, 
  UserCheck, 
  History, 
  ChevronRight,
  X,
  Sparkles,
  CheckCircle2,
  Sliders,
  AlignJustify
} from 'lucide-react';
import confetti from 'canvas-confetti';
import AddNodeModal from '../../components/journeys/AddNodeModal';

export default function JourneyStudioPage({ bots = [] }) {
  const { journeyId } = useParams();
  const navigate = useNavigate();

  const [journey, setJourney] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  
  // Canvas State
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isLocked, setIsLocked] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Modal & Drawer State
  const [insertIndex, setInsertIndex] = useState(null);
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  const fetchJourney = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/journeys/${journeyId}`);
      if (res.ok) {
        const data = await res.json();
        setJourney(data.journey);
        setIsActive(data.journey.status === 'active');
      } else {
        // Fallback default mock
        setJourney({
          id: journeyId,
          name: 'Use AI Agent on WhatsApp',
          status: 'inactive',
          trigger: { type: 'conversation', channel: 'whatsapp', label: 'Conversation' },
          nodes: [
            {
              id: 'node-1',
              type: 'assign_agent',
              title: 'Assign to AI Agent',
              bot_id: bots[0]?.id || 'bot-apex-agency',
              bot_name: bots[0]?.bot_name || 'Apex AI Assistant',
              is_configured: true
            },
            {
              id: 'node-2',
              type: 'wait_delay',
              title: 'Wait Until',
              duration_value: 6,
              duration_unit: 'hours',
              is_configured: true
            },
            {
              id: 'node-3',
              type: 'send_message',
              title: 'Send Message in Conversation',
              message_text: 'Hey! Just following up to see if you needed any assistance?',
              is_configured: true
            }
          ]
        });
      }
    } catch (err) {
      console.error('Error loading journey:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJourney();
  }, [journeyId]);

  const handleSave = async (showConfetti = false) => {
    if (!journey) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await fetch(`/api/journeys/${journey.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: journey.name,
          status: isActive ? 'active' : 'inactive',
          trigger: journey.trigger,
          nodes: journey.nodes
        })
      });

      if (res.ok) {
        setSavedSuccess(true);
        if (showConfetti) {
          confetti({ particleCount: 45, spread: 60, origin: { y: 0.6 } });
        }
        setTimeout(() => setSavedSuccess(false), 2500);
      }
    } catch (err) {
      alert('Failed to save version: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    const nextStatus = !isActive;
    setIsActive(nextStatus);

    try {
      await fetch(`/api/journeys/${journey.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus ? 'active' : 'inactive' })
      });

      if (nextStatus) {
        confetti({ particleCount: 60, spread: 80, origin: { y: 0.65 } });
      }
    } catch (err) {
      console.error('Failed to toggle journey status', err);
    }
  };

  const handleOpenAddNode = (idx) => {
    setInsertIndex(idx);
    setIsAddNodeOpen(true);
  };

  const handleInsertNode = (nodeTypeObj) => {
    if (!journey) return;
    const newNode = {
      id: `node-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      type: nodeTypeObj.type,
      ...nodeTypeObj.defaultData
    };

    const updatedNodes = [...journey.nodes];
    if (insertIndex !== null) {
      updatedNodes.splice(insertIndex, 0, newNode);
    } else {
      updatedNodes.push(newNode);
    }

    setJourney({ ...journey, nodes: updatedNodes });
    setIsAddNodeOpen(false);
    setSelectedNodeId(newNode.id);
  };

  const handleDeleteNode = (e, nodeId) => {
    e.stopPropagation();
    if (!journey) return;
    const updatedNodes = journey.nodes.filter(n => n.id !== nodeId);
    setJourney({ ...journey, nodes: updatedNodes });
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  const handleUpdateActiveNode = (updatedFields) => {
    if (!journey || !selectedNodeId) return;
    const updatedNodes = journey.nodes.map(n => {
      if (n.id === selectedNodeId) {
        return { ...n, ...updatedFields };
      }
      return n;
    });
    setJourney({ ...journey, nodes: updatedNodes });
  };

  const selectedNode = journey?.nodes?.find(n => n.id === selectedNodeId);

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#f8fafc',
      position: 'relative',
      overflow: 'hidden',
      userSelect: 'none'
    }}>
      {/* Top Controls Bar matching Chatzy Image 3 */}
      <header style={{
        height: '60px',
        padding: '0 24px',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 50,
        boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
      }}>
        {/* Left: Back + Status Toggle Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/journeys/templates')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '13px',
              fontWeight: 600,
              padding: '6px 8px',
              borderRadius: '6px'
            }}
          >
            <ArrowLeft size={16} />
            <span>Journeys</span>
          </button>

          <div style={{ height: '18px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

          {/* Active / Inactive Toggle Switch matching Chatzy Image 3 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 12px',
            borderRadius: '9999px',
            backgroundColor: isActive ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${isActive ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isActive ? '#10b981' : '#ef4444'
            }} />
            <span style={{ fontSize: '12.5px', fontWeight: 700, color: isActive ? '#059669' : '#dc2626' }}>
              {isActive ? 'Active' : 'Inactive'}
            </span>

            <button
              onClick={handleTogglePublish}
              style={{
                width: '32px',
                height: '18px',
                borderRadius: '9999px',
                backgroundColor: isActive ? '#10b981' : '#cbd5e1',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background 0.2s',
                marginLeft: '4px',
                padding: '2px'
              }}
            >
              <div style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                transform: isActive ? 'translateX(14px)' : 'translateX(0)',
                transition: 'transform 0.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }} />
            </button>
          </div>

          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginLeft: '6px' }}>
            {journey?.name || 'Journey Studio'}
          </span>
        </div>

        {/* Center/Right: Canvas Tools + Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Canvas Tools Toolbar matching Chatzy Image 3 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '2px',
            padding: '4px 6px',
            borderRadius: '8px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-subtle)'
          }}>
            <button
              onClick={() => alert('Changes undone')}
              style={{ background: 'transparent', border: 'none', padding: '5px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              title="Undo"
            >
              <RotateCcw size={14} />
            </button>

            <button
              onClick={() => setZoomLevel(100)}
              style={{ background: 'transparent', border: 'none', padding: '5px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              title="Fit to view"
            >
              <Maximize2 size={14} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', padding: '0 4px', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
              <span>{zoomLevel}%</span>
            </div>

            <button
              onClick={() => setZoomLevel(Math.min(150, zoomLevel + 10))}
              style={{ background: 'transparent', border: 'none', padding: '5px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              title="Zoom In"
            >
              <ZoomIn size={14} />
            </button>

            <button
              onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))}
              style={{ background: 'transparent', border: 'none', padding: '5px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              title="Zoom Out"
            >
              <ZoomOut size={14} />
            </button>

            <button
              onClick={() => setIsLocked(!isLocked)}
              style={{ background: 'transparent', border: 'none', padding: '5px', cursor: 'pointer', color: isLocked ? 'var(--primary)' : 'var(--text-secondary)' }}
              title={isLocked ? 'Unlock canvas' : 'Lock canvas'}
            >
              {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>

            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{ background: 'transparent', border: 'none', padding: '5px', cursor: 'pointer', color: 'var(--text-secondary)' }}
              title="Auto-Center Layout"
            >
              <AlignJustify size={14} />
            </button>
          </div>

          {/* Save Version Button */}
          <button
            onClick={() => handleSave(false)}
            disabled={saving}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-primary)',
              padding: '7px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {savedSuccess ? <Check size={14} color="#10b981" /> : <Save size={14} />}
            <span>{savedSuccess ? 'Saved' : 'Save version'}</span>
          </button>

          {/* Publish Button */}
          <button
            onClick={() => {
              setIsActive(true);
              handleSave(true);
            }}
            style={{
              backgroundColor: '#4f46e5',
              border: 'none',
              color: '#ffffff',
              padding: '7px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(79, 70, 229, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={14} />
            <span>Publish</span>
          </button>

          {/* History Icon */}
          <button
            onClick={() => alert('Version history: Current Version 1.0')}
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '7px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Version History"
          >
            <History size={16} />
          </button>
        </div>
      </header>

      {/* Dotted Grid Canvas Surface */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'auto',
        padding: '60px 20px',
        display: 'flex',
        justifyContent: 'center',
        position: 'relative',
        backgroundImage: 'radial-gradient(circle, #cbd5e1 1.2px, transparent 1.2px)',
        backgroundSize: '24px 24px'
      }}>
        {/* Workflow Node Tree Column */}
        <div style={{
          width: '420px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: 'top center',
          transition: 'transform 0.15s ease'
        }}>
          {/* STEP 1: TRIGGER NODE CARD matching Chatzy Image 3 */}
          <div style={{
            width: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            border: '1.5px solid var(--border-subtle)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            overflow: 'hidden'
          }}>
            {/* Solid Indigo Trigger Banner */}
            <div style={{
              backgroundColor: '#4f46e5',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              color: '#ffffff'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', fontWeight: 800, letterSpacing: '0.06em' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#ffffff' }} />
                <span>TRIGGER</span>
              </div>
              <Sliders size={13} color="#ffffff" />
            </div>

            {/* Trigger Body */}
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(79, 70, 229, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)'
                }}>
                  <Mail size={16} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {journey?.trigger?.label || 'Conversation'}
                  </h4>
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Channel: {journey?.trigger?.channel === 'instagram' ? 'Instagram' : 'WhatsApp / Web'}
                  </span>
                </div>
              </div>

              {/* Active Connected Account Badge */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'var(--bg-subtle)',
                padding: '6px 10px',
                borderRadius: '6px',
                fontSize: '11.5px',
                marginBottom: '12px',
                border: '1px solid var(--border-subtle)'
              }}>
                <span style={{ color: 'var(--text-muted)' }}>
                  Active Account: <strong style={{ color: 'var(--text-primary)' }}>{journey?.channel === 'instagram' ? '@apex_agency_official' : '+91 98206 46838'}</strong>
                </span>
                <button
                  onClick={() => navigate('/integrations')}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '11px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                >
                  <span>Manage</span>
                  <ExternalLink size={10} />
                </button>
              </div>

              {/* + Add Trigger Button */}
              <button
                onClick={() => alert('Configure Trigger: Listening for WhatsApp & Web Chat starts.')}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: '1.5px dashed rgba(79, 70, 229, 0.4)',
                  backgroundColor: 'rgba(79, 70, 229, 0.03)',
                  color: 'var(--primary)',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Plus size={13} />
                <span>Add Trigger</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC NODES & CONNECTOR LINES */}
          {journey?.nodes?.map((node, index) => {
            const isSelected = selectedNodeId === node.id;
            const getNodeIcon = (type) => {
              switch (type) {
                case 'assign_agent': return <Bot size={18} color="#4f46e5" />;
                case 'wait_delay': return <Clock size={18} color="#d97706" />;
                case 'send_message': return <Mail size={18} color="#0891b2" />;
                case 'condition': return <GitBranch size={18} color="#7c3aed" />;
                case 'webhook': return <Globe size={18} color="#059669" />;
                default: return <Bot size={18} color="#4f46e5" />;
              }
            };

            return (
              <React.Fragment key={node.id}>
                {/* Vertical Connector Line with (+) Inserter Button */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '56px', position: 'relative' }}>
                  <div style={{ width: '2px', height: '100%', backgroundColor: '#94a3b8' }} />

                  {/* Circular (+) Inserter Node on Line */}
                  <button
                    onClick={() => handleOpenAddNode(index)}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #94a3b8',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.06)',
                      transition: 'all 0.15s ease',
                      zIndex: 10
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--primary)';
                      e.currentTarget.style.backgroundColor = 'var(--primary)';
                      e.currentTarget.style.color = '#ffffff';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#94a3b8';
                      e.currentTarget.style.backgroundColor = '#ffffff';
                      e.currentTarget.style.color = '#64748b';
                      e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                    }}
                    title="Insert step here"
                  >
                    <Plus size={13} />
                  </button>
                </div>

                {/* WORKFLOW STEP CARD matching Chatzy Image 3 */}
                <div
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    borderRadius: '14px',
                    border: `1.5px solid ${isSelected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    boxShadow: isSelected 
                      ? '0 0 0 1px var(--primary), 0 8px 20px -4px rgba(79, 70, 229, 0.15)' 
                      : '0 4px 12px rgba(0,0,0,0.04)',
                    padding: '16px 18px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Top Connector Anchor Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '-6px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '28px',
                    height: '6px',
                    backgroundColor: '#cbd5e1',
                    borderRadius: '3px'
                  }} />

                  {/* Card Content Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: 0 }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(79, 70, 229, 0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {getNodeIcon(node.type)}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {node.title}
                        </h4>

                        {node.type === 'wait_delay' && (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                            {node.duration_value} {node.duration_unit || 'hour(s)'}
                          </span>
                        )}

                        {node.type === 'assign_agent' && (
                          <span style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 600 }}>
                            {node.bot_name || 'Select AI Bot'}
                          </span>
                        )}

                        {node.type === 'send_message' && (
                          <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {node.message_text || 'Configure message...'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Warning & Delete Action matching Chatzy Image 3 */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {!node.is_configured && (
                        <div title="Configuration required" style={{ color: '#d97706', display: 'flex', alignItems: 'center' }}>
                          <AlertTriangle size={16} />
                        </div>
                      )}

                      <button
                        onClick={(e) => handleDeleteNode(e, node.id)}
                        style={{
                          background: 'rgba(239, 68, 68, 0.06)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          color: '#ef4444',
                          width: '26px',
                          height: '26px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          transition: 'background 0.15s'
                        }}
                        title="Delete step"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}

          {/* Final Bottom Connector Line + Add Step Button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '56px', position: 'relative' }}>
            <div style={{ width: '2px', height: '100%', backgroundColor: '#94a3b8' }} />
            <button
              onClick={() => handleOpenAddNode(journey?.nodes?.length || 0)}
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                border: '1.5px solid #94a3b8',
                color: '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.06)'
              }}
              title="Add next step"
            >
              <Plus size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Side Configuration Drawer */}
      {selectedNode && (
        <div className="animate-fade-in" style={{
          position: 'absolute',
          top: '60px',
          right: 0,
          bottom: 0,
          width: '360px',
          backgroundColor: '#ffffff',
          borderLeft: '1px solid var(--border-subtle)',
          boxShadow: '-4px 0 20px rgba(0,0,0,0.06)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          zIndex: 60,
          overflowY: 'auto'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                Configure Step
              </h3>
              <button
                onClick={() => setSelectedNodeId(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Step Title Input */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                Step Title
              </label>
              <input
                type="text"
                className="form-input"
                value={selectedNode.title}
                onChange={(e) => handleUpdateActiveNode({ title: e.target.value })}
                style={{ width: '100%', fontSize: '13px' }}
              />
            </div>

            {/* Customizer for: Assign AI Agent */}
            {selectedNode.type === 'assign_agent' && (
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Select AI Agent *
                </label>
                <select
                  className="form-select"
                  value={selectedNode.bot_id || ''}
                  onChange={(e) => {
                    const chosen = bots.find(b => b.id === e.target.value);
                    handleUpdateActiveNode({
                      bot_id: e.target.value,
                      bot_name: chosen ? chosen.bot_name : 'Custom AI Bot',
                      is_configured: true
                    });
                  }}
                  style={{ width: '100%', fontSize: '13px' }}
                >
                  <option value="">-- Choose Chatbot --</option>
                  {bots.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.bot_name}
                    </option>
                  ))}
                  {bots.length === 0 && (
                    <option value="bot-apex-agency">Apex AI Assistant</option>
                  )}
                </select>
              </div>
            )}

            {/* Customizer for: Wait Delay */}
            {selectedNode.type === 'wait_delay' && (
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Delay Duration
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={selectedNode.duration_value || 6}
                    onChange={(e) => handleUpdateActiveNode({ duration_value: parseInt(e.target.value) || 1 })}
                    style={{ width: '90px', fontSize: '13px' }}
                  />
                  <select
                    className="form-select"
                    value={selectedNode.duration_unit || 'hours'}
                    onChange={(e) => handleUpdateActiveNode({ duration_unit: e.target.value })}
                    style={{ flex: 1, fontSize: '13px' }}
                  >
                    <option value="minutes">Minutes</option>
                    <option value="hours">Hours</option>
                    <option value="days">Days</option>
                  </select>
                </div>
              </div>
            )}

            {/* Customizer for: Send Message */}
            {selectedNode.type === 'send_message' && (
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Message Text
                </label>
                <textarea
                  className="form-input"
                  rows="4"
                  value={selectedNode.message_text || ''}
                  onChange={(e) => handleUpdateActiveNode({ message_text: e.target.value, is_configured: true })}
                  placeholder="Type automated follow-up message..."
                  style={{ width: '100%', fontSize: '13px', lineHeight: 1.45 }}
                />
              </div>
            )}

            {/* Customizer for: Webhook */}
            {selectedNode.type === 'webhook' && (
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Endpoint URL
                </label>
                <input
                  type="url"
                  className="form-input"
                  value={selectedNode.webhook_url || ''}
                  onChange={(e) => handleUpdateActiveNode({ webhook_url: e.target.value })}
                  placeholder="https://hooks.zapier.com/..."
                  style={{ width: '100%', fontSize: '13px' }}
                />
              </div>
            )}
          </div>

          {/* Close Panel Button */}
          <div>
            <button
              onClick={() => setSelectedNodeId(null)}
              className="btn-primary"
              style={{ width: '100%', padding: '9px 0', fontSize: '13px' }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Add Step Node Modal */}
      {isAddNodeOpen && (
        <AddNodeModal
          onClose={() => setIsAddNodeOpen(false)}
          onSelectType={handleInsertNode}
        />
      )}
    </div>
  );
}
