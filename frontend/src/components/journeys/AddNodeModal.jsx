import React from 'react';
import { 
  X, 
  Bot, 
  Clock, 
  Mail, 
  GitBranch, 
  Globe, 
  Tag, 
  Sparkles,
  UserCheck
} from 'lucide-react';

const NODE_TYPES = [
  {
    type: 'assign_agent',
    title: 'Assign to AI Agent',
    description: 'Direct incoming conversation to an intelligent AI chatbot agent.',
    icon: Bot,
    color: '#4f46e5',
    defaultData: {
      title: 'Assign to AI Agent',
      bot_id: '',
      bot_name: 'Select AI Bot',
      is_configured: false
    }
  },
  {
    type: 'wait_delay',
    title: 'Wait Until (Delay)',
    description: 'Pause the workflow for a specified number of minutes, hours, or days.',
    icon: Clock,
    color: '#d97706',
    defaultData: {
      title: 'Wait Until',
      duration_value: 6,
      duration_unit: 'hours',
      is_configured: true
    }
  },
  {
    type: 'send_message',
    title: 'Send Message in Conversation',
    description: 'Deliver an automated follow-up message or interactive template.',
    icon: Mail,
    color: '#0891b2',
    defaultData: {
      title: 'Send Message in Conversation',
      message_text: 'Hey! Just following up to see if you needed any assistance?',
      is_configured: true
    }
  },
  {
    type: 'condition',
    title: 'Condition / Branching',
    description: 'Branch the flow depending on lead responses or captured contact info.',
    icon: GitBranch,
    color: '#7c3aed',
    defaultData: {
      title: 'Check Condition',
      condition_rule: 'lead.has_phone == true',
      is_configured: true
    }
  },
  {
    type: 'webhook',
    title: 'HTTP Webhook Trigger',
    description: 'POST customer data to an external CRM, Make.com, or Zapier endpoint.',
    icon: Globe,
    color: '#059669',
    defaultData: {
      title: 'Trigger Webhook',
      webhook_url: 'https://api.yourdomain.com/webhook',
      is_configured: true
    }
  },
  {
    type: 'escalate',
    title: 'Escalate to Human Agent',
    description: 'Hand over conversation from AI agent to live human support team.',
    icon: UserCheck,
    color: '#e11d48',
    defaultData: {
      title: 'Escalate to Human Agent',
      target_queue: 'General Support',
      is_configured: true
    }
  }
];

export default function AddNodeModal({ onClose, onSelectType }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.55)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div className="animate-fade-in" style={{
        width: '560px',
        maxWidth: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '24px 28px',
        border: '1px solid var(--border-subtle)',
        position: 'relative',
        maxHeight: '85vh',
        overflowY: 'auto'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Add Step to Journey
            </h3>
            <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Select an action, delay, or conditional logic block.
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Node Options Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {NODE_TYPES.map((node) => {
            const Icon = node.icon;
            return (
              <div
                key={node.type}
                onClick={() => onSelectType(node)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = node.color;
                  e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: `${node.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: node.color,
                  flexShrink: 0
                }}>
                  <Icon size={20} />
                </div>

                <div style={{ flex: 1 }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px' }}>
                    {node.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.4, margin: 0 }}>
                    {node.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
