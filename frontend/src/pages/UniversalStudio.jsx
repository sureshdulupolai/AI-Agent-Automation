import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Building2,
  Briefcase,
  Layers,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  CheckCircle2,
  Clock,
  MapPin,
  CreditCard,
  ShieldCheck,
  ArrowUp,
  Zap,
  Target,
  RefreshCw,
  Cpu,
  Activity,
  Home,
  Check,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  FileText,
  HelpCircle,
  Settings2,
  Stethoscope,
  ShoppingBag,
  GraduationCap,
  Utensils,
  Headphones,
  Code2,
  Wand2,
  Sliders,
  DollarSign,
  Calendar,
  Send,
  Bot,
  HeartHandshake,
  Rocket,
  Award,
  AlertCircle,
  Coins,
  Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import TypewriterMessage from '../components/common/TypewriterMessage';
import { formatWhatsAppText } from '../utils/formatWhatsAppText';

// 8 Professional Industry Presets (Clean, Executive, Zero Emojis)
const INDUSTRY_PRESETS = [
  {
    id: 'tech_agency',
    label: 'IT & Software Agency',
    icon: Code2,
    color: '#4f46e5',
    tagline: 'Custom Web Apps, SaaS & AI Automations',
    profile: {
      business_name: 'NovaByte AI & Web Studio',
      industry_category: 'Full-Stack Web & AI Automation',
      brand_voice: 'Warm, Consultative, and Authoritative Senior Specialist',
      fulfillment_type: 'custom_quote',
      core_offerings: [
        {
          name: 'Custom Web App / SaaS Platform',
          category: 'Software Development',
          pricing_type: 'tier_based',
          price_range: '$3,500 - $10,000',
          turnaround: '2 to 4 Weeks',
          description: 'Full-stack React / Next.js web application with database, authentication, and responsive UI.'
        },
        {
          name: 'Autonomous WhatsApp & AI Chatbot',
          category: 'AI Automation',
          pricing_type: 'fixed',
          price_range: '$1,200 - $2,500',
          turnaround: '3 to 5 Days',
          description: '24/7 autonomous WhatsApp lead qualifier with live agent CRM handoff and zero cloud per-message fees.'
        },
        {
          name: 'UI/UX Design & Brand System',
          category: 'Design',
          pricing_type: 'tier_based',
          price_range: '$800 - $1,800',
          turnaround: '5 to 7 Days',
          description: 'High-fidelity Figma prototypes, custom component tokens, and mobile-first mockups.'
        }
      ],
      qualification_rules: [
        {
          field_key: 'project_scope',
          label: 'Project Scope / Requirements',
          is_mandatory: true,
          prompt_nudge: 'Ask what key features or business outcomes they need.'
        },
        {
          field_key: 'target_budget',
          label: 'Estimated Budget Range',
          is_mandatory: true,
          prompt_nudge: 'Ask politely for their investment budget to suggest the right tier.'
        },
        {
          field_key: 'timeline',
          label: 'Target Launch Date',
          is_mandatory: false,
          prompt_nudge: 'Ask when they are looking to launch or start development.'
        }
      ],
      policies_and_faqs: {
        operating_hours: 'Mon-Sat: 9:00 AM - 7:00 PM',
        location_address: 'Global Remote & Virtual Consultations',
        payment_terms: '50% milestone deposit, 50% upon final verified deployment.',
        custom_policies: '100% Satisfaction guarantee with 30-day post-delivery warranty.'
      }
    }
  },
  {
    id: 'healthcare_clinic',
    label: 'Hospital & Clinic',
    icon: Stethoscope,
    color: '#0891b2',
    tagline: 'Doctor Consultations, OPD & Lab Reports',
    profile: {
      business_name: 'CarePlus Multi-Specialty Clinic',
      industry_category: 'Healthcare & Patient Diagnostics',
      brand_voice: 'Gentle, Caring, Reassuring, and Highly Professional',
      fulfillment_type: 'appointment',
      core_offerings: [
        {
          name: 'Senior Specialist Doctor Consultation',
          category: 'Clinical OPD',
          pricing_type: 'fixed',
          price_range: '$40 - $75',
          turnaround: '30-45 Minutes',
          description: 'Direct in-person or video consultation with board-certified specialty doctors.'
        },
        {
          name: 'Comprehensive Health Checkup Package',
          category: 'Diagnostics',
          pricing_type: 'fixed',
          price_range: '$120 - $250',
          turnaround: 'Same-Day Report',
          description: 'Full blood profile, ECG, liver & kidney tests with WhatsApp digital report delivery.'
        },
        {
          name: 'Home Sample Collection & Lab Diagnostics',
          category: 'Home Care',
          pricing_type: 'fixed',
          price_range: '$25 - $50',
          turnaround: '12 Hours',
          description: 'Certified phlebotomist visit for home sample extraction with digital receipt.'
        }
      ],
      qualification_rules: [
        {
          field_key: 'chief_complaint',
          label: 'Primary Concern / Pain Area',
          is_mandatory: true,
          prompt_nudge: 'Ask if they are experiencing any pain or looking for routine checkup.'
        },
        {
          field_key: 'patient_contact',
          label: 'Patient WhatsApp Number & Email',
          is_mandatory: true,
          prompt_nudge: 'Collect WhatsApp number and email to issue booking token and digital report.'
        },
        {
          field_key: 'preferred_date_time',
          label: 'Preferred Appointment Slot',
          is_mandatory: true,
          prompt_nudge: 'Ask what day and time works best for their clinic visit.'
        }
      ],
      policies_and_faqs: {
        operating_hours: 'OPD: 8:00 AM - 8:00 PM | Emergency: 24/7',
        location_address: 'Suite 402, Medical City Center, Downtown',
        payment_terms: 'Cash, Cards, and Major Insurance accepted with cashless claims.',
        custom_policies: 'Same-day emergency appointments prioritized. Free parking on site.'
      }
    }
  },
  {
    id: 'real_estate',
    label: 'Real Estate & Living',
    icon: Building2,
    color: '#059669',
    tagline: 'Residential Units, Commercial & Site Visits',
    profile: {
      business_name: 'Prestige Luxury Estates',
      industry_category: 'Premium Real Estate & Property Advisory',
      brand_voice: 'Sophisticated, Discreet, Knowledgeable, and Premium',
      fulfillment_type: 'on_premise',
      core_offerings: [
        {
          name: 'Luxury Sea-Facing 3BHK Penthouse',
          category: 'Residential',
          pricing_type: 'fixed',
          price_range: '$1,200,000 - $3,500,000',
          turnaround: 'Private VIP Viewing',
          description: 'Panoramic skyline views, private plunge pool, and 24/7 concierge.'
        },
        {
          name: 'Executive 2BHK Smart Apartment',
          category: 'Residential',
          pricing_type: 'fixed',
          price_range: '$350,000 - $650,000',
          turnaround: 'Ready Possession',
          description: 'Modern modular kitchen, EV parking bay, and clubhouse access.'
        },
        {
          name: 'Commercial Prime Office Floor',
          category: 'Commercial',
          pricing_type: 'tier_based',
          price_range: '$8,000 - $20,000 / month',
          turnaround: 'Immediate Handover',
          description: 'Furnished A-grade commercial workspace in central business district.'
        }
      ],
      qualification_rules: [
        {
          field_key: 'buyer_budget',
          label: 'Target Investment Budget',
          is_mandatory: true,
          prompt_nudge: 'Ask what budget range they are targeting for their property search.'
        },
        {
          field_key: 'property_preference',
          label: 'Property Type & Desired Location',
          is_mandatory: true,
          prompt_nudge: 'Ask if they prefer beachfront apartments, private villas, or central plots.'
        },
        {
          field_key: 'contact_details',
          label: 'WhatsApp Mobile Number & Email',
          is_mandatory: true,
          prompt_nudge: 'Collect WhatsApp and email to deliver the confidential master brochure and floor plans.'
        }
      ],
      policies_and_faqs: {
        operating_hours: 'Mon-Sun: 9:00 AM - 8:00 PM',
        location_address: 'Level 18, Prime Financial Tower, Central Plaza',
        payment_terms: 'Flexible developer milestone payment plans with escrow bank guarantee.',
        custom_policies: 'Complimentary chauffeur pickup service provided for VIP site tours.'
      }
    }
  },
  {
    id: 'ecommerce',
    label: 'E-Commerce & Retail',
    icon: ShoppingBag,
    color: '#e11d48',
    tagline: 'Product Catalog, Order Tracking & Returns',
    profile: {
      business_name: 'Aura Lifestyle Store',
      industry_category: 'Online Fashion & Lifestyle Retail',
      brand_voice: 'Helpful, Proactive, Energetic, and Concise',
      fulfillment_type: 'delivery',
      core_offerings: [
        {
          name: 'Designer Casuals & Streetwear',
          category: 'Apparel',
          pricing_type: 'fixed',
          price_range: '$45 - $120',
          turnaround: '2-3 Days Delivery',
          description: '100% organic cotton sustainable fashion line with sizing guide.'
        },
        {
          name: 'Leather Accessories & Footwear',
          category: 'Footwear',
          pricing_type: 'fixed',
          price_range: '$85 - $220',
          turnaround: '2-4 Days Delivery',
          description: 'Handcrafted genuine leather footwear with 1-year craftsmanship warranty.'
        }
      ],
      qualification_rules: [
        {
          field_key: 'customer_intent',
          label: 'Shopping Inquiry or Order Lookup',
          is_mandatory: true,
          prompt_nudge: 'Ask if they are browsing products or need tracking for an existing order.'
        },
        {
          field_key: 'contact_email_phone',
          label: 'Email / WhatsApp for Discount Code',
          is_mandatory: true,
          prompt_nudge: 'Offer a 10% welcome coupon in exchange for their email or WhatsApp.'
        }
      ],
      policies_and_faqs: {
        operating_hours: '24/7 Automated Orders | Human Support: 9:00 AM - 9:00 PM',
        location_address: 'Central Fulfillment Hub, Logistics Bay 4',
        payment_terms: 'Credit Cards, Debit Cards, UPI, PayPal, and Cash on Delivery (COD).',
        custom_policies: '7-day hassle-free returns with doorstep pickup and instant refund.'
      }
    }
  },
  {
    id: 'lead_generation',
    label: 'B2B Sales Closer',
    icon: Target,
    color: '#7c3aed',
    tagline: 'High-Ticket Qualification & Discovery Calls',
    profile: {
      business_name: 'Apex Revenue Systems',
      industry_category: 'B2B Growth & Outbound Pipeline',
      brand_voice: 'Executive, Sharp, and High-Efficiency',
      fulfillment_type: 'appointment',
      core_offerings: [
        {
          name: 'Executive Revenue Operations Audit',
          category: 'Strategy',
          pricing_type: 'fixed',
          price_range: '$1,500 - $3,000',
          turnaround: '5 Business Days',
          description: 'Comprehensive analysis of sales pipeline leaks and outbound automation ROI.'
        },
        {
          name: 'Full Outbound Conversion Engine',
          category: 'Implementation',
          pricing_type: 'tier_based',
          price_range: '$4,000 - $8,500 / month',
          turnaround: '14 Days Onboarding',
          description: 'Dedicated SDR infrastructure, verified list enrichment, and WhatsApp sequences.'
        }
      ],
      qualification_rules: [
        {
          field_key: 'business_model',
          label: 'Company Size & Current Monthly Revenue',
          is_mandatory: true,
          prompt_nudge: 'Ask about their current team size and growth targets.'
        },
        {
          field_key: 'decision_maker_contact',
          label: 'Work Email & WhatsApp Number',
          is_mandatory: true,
          prompt_nudge: 'Secure their work email and direct phone for executive calendar invite.'
        }
      ],
      policies_and_faqs: {
        operating_hours: 'Mon-Fri: 9:00 AM - 6:00 PM EST',
        location_address: 'Global Virtual Strategy Engagements',
        payment_terms: 'Monthly retainer with milestone delivery and performance bonuses.',
        custom_policies: 'Guaranteed 25+ qualified executive conversations within 60 days.'
      }
    }
  },
  {
    id: 'education_coaching',
    label: 'Education & Academy',
    icon: GraduationCap,
    color: '#d97706',
    tagline: 'Curriculum Inquiries, Fees & Admissions',
    profile: {
      business_name: 'Zenith Tech Academy',
      industry_category: 'Higher Education & Career Coaching',
      brand_voice: 'Warm, Consultative, and Authoritative Senior Specialist',
      fulfillment_type: 'appointment',
      core_offerings: [
        {
          name: 'Full-Stack Web & AI Engineering Cohort',
          category: 'Diploma Program',
          pricing_type: 'fixed',
          price_range: '$850 - $1,500',
          turnaround: '16 Weeks Curriculum',
          description: 'Live mentor-led cohort with capstone software projects and career placement cell.'
        }
      ],
      qualification_rules: [
        {
          field_key: 'student_background',
          label: 'Educational Background & Career Goals',
          is_mandatory: true,
          prompt_nudge: 'Ask if they are a student, recent graduate, or working professional.'
        },
        {
          field_key: 'contact_info',
          label: 'WhatsApp Mobile Number & Email',
          is_mandatory: true,
          prompt_nudge: 'Collect WhatsApp and email to dispatch the syllabus curriculum and free demo class pass.'
        }
      ],
      policies_and_faqs: {
        operating_hours: 'Mon-Sat: 10:00 AM - 7:00 PM',
        location_address: 'Online Interactive Campus & Weekend City Labs',
        payment_terms: '0% Interest monthly EMI plans and merit-based scholarship discounts.',
        custom_policies: '100% Placement assistance guarantee with 5 mock technical interviews.'
      }
    }
  },
  {
    id: 'restaurant_catering',
    label: 'Restaurant & Catering',
    icon: Utensils,
    color: '#b45309',
    tagline: 'Table Bookings, Menu Specials & Event Catering',
    profile: {
      business_name: 'The Bistro Table & Bar',
      industry_category: 'Hospitality & Dining Concierge',
      brand_voice: 'Warm, Consultative, and Authoritative Senior Specialist',
      fulfillment_type: 'appointment',
      core_offerings: [
        {
          name: 'Chef Tasting 5-Course Dinner',
          category: 'Dining Experience',
          pricing_type: 'fixed',
          price_range: '$65 - $110 / person',
          turnaround: 'Dinner (7:00 PM - 11:30 PM)',
          description: 'Seasonal artisanal menu paired with signature craft cocktails and dessert.'
        }
      ],
      qualification_rules: [
        {
          field_key: 'party_size',
          label: 'Party Size & Desired Date/Time',
          is_mandatory: true,
          prompt_nudge: 'Ask how many guests are dining and preferred reservation time.'
        },
        {
          field_key: 'guest_contact',
          label: 'Guest Name & WhatsApp Number',
          is_mandatory: true,
          prompt_nudge: 'Collect guest name and WhatsApp phone to dispatch the digital reservation confirmation.'
        }
      ],
      policies_and_faqs: {
        operating_hours: 'Lunch: 12:00 PM - 3:30 PM | Dinner: 7:00 PM - 11:30 PM',
        location_address: '42 Heritage Boulevard, Old Town Square',
        payment_terms: 'Cash, Cards, Apple Pay, and Google Pay accepted.',
        custom_policies: 'Complimentary celebration voucher on table reservations of 6+ guests.'
      }
    }
  },
  {
    id: 'tech_support',
    label: '24/7 Technical Support',
    icon: Headphones,
    color: '#2563eb',
    tagline: 'Incident Triage, Troubleshooting & Escalations',
    profile: {
      business_name: 'NovaCare Global Helpdesk',
      industry_category: 'Technical Support & Incident Management',
      brand_voice: 'Executive, Sharp, and High-Efficiency',
      fulfillment_type: 'custom_quote',
      core_offerings: [
        {
          name: 'Tier-1 Immediate Automated Troubleshooting',
          category: 'Support Resolution',
          pricing_type: 'fixed',
          price_range: 'Included with Plan',
          turnaround: 'Instant (< 5 Seconds)',
          description: 'Knowledge base solutions, credentials reset, and billing query resolutions.'
        }
      ],
      qualification_rules: [
        {
          field_key: 'issue_description',
          label: 'Error Message / Reproduction Steps',
          is_mandatory: true,
          prompt_nudge: 'Ask the user to describe the issue or share an error code/screenshot.'
        },
        {
          field_key: 'account_credentials',
          label: 'Registered Account Email & WhatsApp',
          is_mandatory: true,
          prompt_nudge: 'Collect account email and phone to open an official engineering ticket.'
        }
      ],
      policies_and_faqs: {
        operating_hours: '24 Hours / 7 Days / 365 Days Guaranteed Uptime',
        location_address: 'Enterprise Cloud Operations Centers',
        payment_terms: 'Covered under active SaaS subscription tier.',
        custom_policies: '99.9% SLA uptime guarantee with dedicated support channel.'
      }
    }
  }
];

// Reimagined Visual Persona Options
const PERSONA_OPTIONS = [
  {
    id: 'consultative',
    title: 'Senior Solutions Consultant',
    badge: 'Recommended for B2B & Agencies',
    badgeColor: '#4f46e5',
    icon: Sparkles,
    tone: 'Warm, Consultative, and Authoritative Senior Specialist',
    description: 'Empathetic, highly knowledgeable, and authoritative. Answers questions thoroughly while guiding prospects toward a custom scope.'
  },
  {
    id: 'closer',
    title: 'Executive Sales Closer',
    badge: 'High Conversion Velocity',
    badgeColor: '#059669',
    icon: Zap,
    tone: 'Executive, Sharp, and High-Efficiency',
    description: 'Crisp, concise, and value-driven. Focuses on project deliverables, qualifies budget brackets, and secures meeting slots quickly.'
  },
  {
    id: 'empathy',
    title: 'Clinical Care Coordinator',
    badge: 'Healthcare & Wellness',
    badgeColor: '#0891b2',
    icon: HeartHandshake,
    tone: 'Gentle, Caring, Reassuring, and Highly Professional',
    description: 'Patient-first, calming, and reassuring. Explains medical procedures gently, answers common FAQs, and coordinates doctor appointments.'
  },
  {
    id: 'concierge',
    title: 'Proactive Retail Concierge',
    badge: 'E-Commerce & Retail',
    badgeColor: '#e11d48',
    icon: Rocket,
    tone: 'Helpful, Proactive, Energetic, and Concise',
    description: 'Fast, energetic, and brand-aligned. Assists with sizing, delivery tracking, stock availability, and offers welcome discounts.'
  }
];

// Reimagined Visual Conversion Objectives
const CONVERSION_OBJECTIVES = [
  {
    id: 'custom_quote',
    title: 'Commercial Project Scope & Quote',
    subtitle: 'Captures project requirements & prompts for WhatsApp/Email',
    icon: FileText,
    accent: '#4f46e5'
  },
  {
    id: 'appointment',
    title: 'Consultation & Appointment Booking',
    subtitle: 'Schedules doctor appointments, strategy calls, or discovery meetings',
    icon: Calendar,
    accent: '#0891b2'
  },
  {
    id: 'on_premise',
    title: 'VIP Site Visit & In-Person Tour',
    subtitle: 'Coordinates property viewings with complimentary chauffeur service',
    icon: Building2,
    accent: '#059669'
  },
  {
    id: 'delivery',
    title: 'Product Orders & Doorstep Delivery',
    subtitle: 'Assists with cart checkout, shipping inquiries & tracking lookup',
    icon: ShoppingBag,
    accent: '#e11d48'
  },
  {
    id: 'digital',
    title: 'Digital Onboarding & Instant Access',
    subtitle: 'Directs users to software documentation, portal login & self-serve links',
    icon: Zap,
    accent: '#7c3aed'
  }
];

// Helper to synthesize full human-grade prompt from 4-step profile for Direct Prompt Mode
function compileFullPromptFromProfile(p) {
  const businessName = p.business_name || 'NovaByte Solutions Lead';
  const category = p.industry_category || 'Full-Stack Web & AI Automation';
  const voice = p.brand_voice || 'Warm, Consultative, and Authoritative Senior Specialist';
  const fulfillment = p.fulfillment_type || 'custom_quote';

  const offeringsText = (p.core_offerings || []).map((o, idx) => {
    const priceStr = o.pricing_type === 'quote_upon_request' ? 'Custom Quote upon request' : (o.price_range || 'Contact for pricing');
    const reqStr = (o.required_fields && o.required_fields.length > 0) ? ` (Key details needed: ${o.required_fields.join(', ')})` : '';
    return `${idx + 1}. ${o.name} [${o.category || 'Core'}] — Price: ${priceStr}${reqStr}. ${o.description || ''}`;
  }).join('\n') || 'No specific offerings configured. Consult directly on client needs.';

  const qualRulesText = (p.qualification_rules || []).map((r) => {
    return `- ${r.label}: ${r.is_mandatory ? 'MANDATORY to qualify' : 'Helpful context'}. Directive: "${r.prompt_nudge || ''}"`;
  }).join('\n') || '- Gather customer contact name, phone/email, and specific requirements.';

  const policiesText = [
    `Operating Hours: ${p.policies_and_faqs?.operating_hours || 'Mon-Sat 9AM-7PM'}`,
    `Location / Service Area: ${p.policies_and_faqs?.location_address || 'Global / Remote & Local Operations'}`,
    `Commercial Terms: ${p.policies_and_faqs?.payment_terms || 'Standard verified terms upon project scope confirmation.'}`,
    `Assurances: ${p.policies_and_faqs?.custom_policies || '100% verified client satisfaction guarantee.'}`
  ].join('\n');

  return `You are the official Senior Solutions Consultant and Client Partner representing "${businessName}" (${category}).

### YOUR HUMAN PERSONA & VOICE DIRECTIVE:
1. Speak with 100% authentic human warmth, conversational empathy, and deep domain authority. Tone: ${voice}.
2. Absolute prohibition on robotic declarations: NEVER introduce yourself as an AI assistant ("I am an AI assistant", "As an AI language model...", "I am programmed to...").
3. Conversational consultative flow: Keep replies concise, helpful, and natural (1 to 2 sentences for casual greetings, 2 to 3 sentences for general questions).
4. Strictly mirror the language and dialect of the prospect (Hinglish -> professional Hinglish, English -> executive English).
5. Commercial lead conversion directive: When a customer asks about a project or service, confirm capability, highlight high-level architecture, and promptly request their WhatsApp number or email for a detailed quote.
6. Target fulfillment outcome: Guide prospect toward ${fulfillment.replace(/_/g, ' ')}.

### VERIFIED BUSINESS OFFERINGS:
${offeringsText}

### DYNAMIC QUALIFICATION DIRECTIVES:
${qualRulesText}

### OPERATIONAL POLICIES & LOCATION:
${policiesText}`.trim();
}

export default function UniversalStudio({ bots = [] }) {
  const navigate = useNavigate();
  const [selectedBotId, setSelectedBotId] = useState(bots[0]?.id || 'bot-ec0db899');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [launchingPrompt, setLaunchingPrompt] = useState(false);
  const [launchSuccess, setLaunchSuccess] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [studioMode, setStudioMode] = useState('guided'); // 'guided' | 'direct'
  const [activeTab, setActiveTab] = useState('identity'); // 'identity' | 'offerings' | 'rules' | 'policies' | 'direct'
  const [selectedPresetId, setSelectedPresetId] = useState('tech_agency');
  const [customToneExpanded, setCustomToneExpanded] = useState(false);
  const [creatingBot, setCreatingBot] = useState(false);
  const [copiedPromptSuccess, setCopiedPromptSuccess] = useState(false);

  // Active Chatbot Model Reference & Verified Identity
  const activeBot = (bots || []).find(b => String(b.id) === String(selectedBotId)) || bots[0];
  const activeBotName = activeBot?.bot_name || 'NovaByte Solutions Lead';

  // Responsive window resize tracking for rock-solid grid division
  useEffect(() => {
    const handleWinResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleWinResize);
    return () => window.removeEventListener('resize', handleWinResize);
  }, []);

  // Sync selectedBotId when bots load or update
  useEffect(() => {
    if (bots && bots.length > 0) {
      if (!selectedBotId || !bots.some(b => String(b.id) === String(selectedBotId))) {
        setSelectedBotId(bots[0].id);
      }
    }
  }, [bots]);

  // Persistent Credit Tracking State (Each bot model gets 10 independent free inquiries, then ₹0.60/query)
  const [creditUsage, setCreditUsage] = useState(() => {
    const cached = localStorage.getItem(`omnibot_credits_${selectedBotId}`);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }
    return { freeLimit: 10, usedCount: 0, freeRemaining: 10, paidCount: 0, pricePerQuery: 0.60, accruedCost: 0 };
  });

  // AI Generator state
  const [generatorPrompt, setGeneratorPrompt] = useState('');
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  // Profile Schema State
  const [profile, setProfile] = useState({
    business_name: 'NovaByte Solutions Lead',
    industry_category: 'Full-Stack Web & AI Automation',
    brand_voice: 'Warm, Consultative, and Authoritative Senior Specialist',
    fulfillment_type: 'custom_quote',
    direct_prompt_enabled: false,
    direct_prompt: '',
    core_offerings: INDUSTRY_PRESETS[0].profile.core_offerings,
    qualification_rules: INDUSTRY_PRESETS[0].profile.qualification_rules,
    policies_and_faqs: INDUSTRY_PRESETS[0].profile.policies_and_faqs
  });

  // Live Interactive Simulator State
  const [simMessages, setSimMessages] = useState([
    {
      id: 'init-1',
      sender: 'bot',
      text: `Hello. Thank you for connecting with ${activeBotName}. How can I assist you with our services, packages, or consultation scheduling today?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [simInput, setSimInput] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [latestAnalysis, setLatestAnalysis] = useState({
    intent: 'General Consultation',
    readiness_score: 50,
    lead_temperature: 'Moderate Intent',
    extracted_parameters: {},
    missing_fields: []
  });

  const chatEndRef = useRef(null);

  // Fetch Business Profile
  const fetchProfile = async () => {
    if (!selectedBotId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/universal/profile/${selectedBotId}`);
      const data = await res.json();
      if (data.success && data.profile) {
        const currentBot = bots.find(b => String(b.id) === String(selectedBotId));
        const dynamicPrompt = (currentBot?.system_instructions && currentBot.system_instructions.trim())
          ? currentBot.system_instructions
          : data.profile.direct_prompt || '';

        setProfile({
          ...data.profile,
          business_name: currentBot?.bot_name || data.profile.business_name || 'NovaByte Solutions Lead',
          direct_prompt: dynamicPrompt
        });

        if (data.profile.direct_prompt_enabled) {
          setStudioMode('direct');
          setActiveTab('direct');
        }
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch persistent credit usage strictly for target bot
  const fetchCredits = async (targetBotId = selectedBotId) => {
    if (!targetBotId) return;
    try {
      const res = await fetch(`/api/universal/credits/${targetBotId}`);
      const data = await res.json();
      if (data.success) {
        setCreditUsage(data);
        localStorage.setItem(`omnibot_credits_${targetBotId}`, JSON.stringify(data));
      }
    } catch (err) {
      console.warn('Credits load error:', err);
    }
  };

  useEffect(() => {
    // When switching bots, load that specific bot's local cached credits immediately
    const cached = localStorage.getItem(`omnibot_credits_${selectedBotId}`);
    if (cached) {
      try { setCreditUsage(JSON.parse(cached)); } catch (e) {}
    } else {
      setCreditUsage({ freeLimit: 10, usedCount: 0, freeRemaining: 10, paidCount: 0, pricePerQuery: 0.60, accruedCost: 0 });
    }
    fetchProfile();
    fetchCredits(selectedBotId);
  }, [selectedBotId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [simMessages, simulating]);

  // Create Starter Bot if none exist
  const handleCreateStarterBot = async () => {
    setCreatingBot(true);
    try {
      const res = await fetch('/api/bots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bot_name: profile.business_name || 'Autonomous Business Agent',
          welcome_message: `Hello! Thank you for connecting with ${profile.business_name || 'us'}. How can I assist you with our services today?`,
          system_instructions: compileFullPromptFromProfile(profile),
          primary_color: '#4f46e5'
        })
      });
      const data = await res.json();
      if (data.bot) {
        setSelectedBotId(data.bot.id);
        alert(`Chatbot "${data.bot.bot_name}" initialized and connected!`);
      }
    } catch (err) {
      console.error('Failed to create bot:', err);
    } finally {
      setCreatingBot(false);
    }
  };

  // Save Dynamic Profile and synchronize with connected bot
  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/universal/profile/${selectedBotId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...profile,
          business_name: activeBotName
        })
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        confetti({ particleCount: 45, spread: 65, origin: { y: 0.6 } });
        setTimeout(() => setSavedSuccess(false), 3500);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
      alert('Error saving profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  // 1-Click "Ready to Launch Prompt" - Compiles, injects & deploys master system prompt to active model
  const handleCompileAndDeployPrompt = async () => {
    setLaunchingPrompt(true);
    try {
      const compiled = compileFullPromptFromProfile({
        ...profile,
        business_name: activeBotName
      });

      const updatedProfile = {
        ...profile,
        business_name: activeBotName,
        direct_prompt: compiled,
        direct_prompt_enabled: true
      };

      setProfile(updatedProfile);

      const res = await fetch(`/api/universal/profile/${selectedBotId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile)
      });
      const data = await res.json();

      if (data.success) {
        confetti({ particleCount: 75, spread: 80, origin: { y: 0.55 } });
        setLaunchSuccess(true);
        setTimeout(() => setLaunchSuccess(false), 5000);

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setSimMessages(prev => [
          ...prev,
          {
            id: `sys-${Date.now()}`,
            sender: 'bot',
            text: `*System Directive Deployed:* Production master system prompt has been compiled and injected into *${activeBotName}*. Live on connected WhatsApp and Web channels.`,
            time: timeStr
          }
        ]);
      }
    } catch (err) {
      console.error('Launch prompt error:', err);
      alert('Error launching prompt: ' + err.message);
    } finally {
      setLaunchingPrompt(false);
    }
  };

  // Apply Industry Preset while strictly preserving active chatbot identity
  const handleApplyPreset = (preset) => {
    setSelectedPresetId(preset.id);
    setProfile(prev => ({
      ...preset.profile,
      business_name: activeBotName, // Keep active bot's real name (NovaByte Solutions Lead)
      direct_prompt_enabled: prev.direct_prompt_enabled,
      direct_prompt: prev.direct_prompt
    }));
    confetti({ particleCount: 30, spread: 55, origin: { y: 0.5 } });
  };

  // 1-Click AI Auto-Generate Schema
  const handleSynthesizeProfile = async (promptOverride) => {
    const textToUse = (promptOverride || generatorPrompt).trim();
    if (!textToUse) return;

    setIsSynthesizing(true);
    try {
      const res = await fetch('/api/universal/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: textToUse })
      });
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.5 } });
      }
    } catch (err) {
      console.error('Synthesis error:', err);
      alert('AI Generation error: ' + err.message);
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Offering helpers
  const handleAddOffering = (template = null) => {
    const newOffering = template || {
      name: 'Custom Service Deliverable',
      category: 'Core Service',
      pricing_type: 'tier_based',
      price_range: '$1,000 - $2,500',
      turnaround: '5 to 7 Business Days',
      description: 'Comprehensive deliverable scope outlining what the client receives upon completion.'
    };
    setProfile(prev => ({ ...prev, core_offerings: [...(prev.core_offerings || []), newOffering] }));
  };

  const handleRemoveOffering = (index) => {
    setProfile(prev => ({
      ...prev,
      core_offerings: prev.core_offerings.filter((_, i) => i !== index)
    }));
  };

  // Qualification helpers
  const handleAddQualRule = () => {
    const newRule = {
      field_key: `field_${Date.now()}`,
      label: 'New Required Parameter',
      is_mandatory: true,
      prompt_nudge: 'Politely inquire during initial conversation to qualify the prospect.'
    };
    setProfile(prev => ({
      ...prev,
      qualification_rules: [...(prev.qualification_rules || []), newRule]
    }));
  };

  const handleRemoveQualRule = (index) => {
    setProfile(prev => ({
      ...prev,
      qualification_rules: prev.qualification_rules.filter((_, i) => i !== index)
    }));
  };

  // Send Test Message in Universal Simulator (Optimized for tokens & persistent credit tracking)
  const handleSendSimMessage = async (customText) => {
    const textToSend = (customText || simInput).trim();
    if (!textToSend || simulating) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { id: `u-${Date.now()}`, sender: 'user', text: textToSend, time: timeStr };

    setSimMessages(prev => [...prev, userMsg]);
    setSimInput('');
    setSimulating(true);

    try {
      const res = await fetch('/api/universal/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          botId: selectedBotId,
          userMessage: textToSend,
          // Token & load optimization: only transmit last 4 message turns
          history: simMessages.slice(-4).map(m => ({ sender: m.sender, content: m.text })),
          channel: 'universal_simulator'
        })
      });

      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (jsonErr) {
        throw new Error(text || `Server returned invalid response (${res.status})`);
      }

      if (!res.ok || (!data.reply && !data.success)) {
        throw new Error(data.error || `Server error (${res.status})`);
      }

      setSimulating(false);

      // Update and persistently cache credit statistics strictly per bot
      if (data.creditUsage) {
        setCreditUsage(data.creditUsage);
        localStorage.setItem(`omnibot_credits_${selectedBotId}`, JSON.stringify(data.creditUsage));
      }

      if (data.reply) {
        const botMsg = {
          id: `b-${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isStreaming: true
        };
        setSimMessages(prev => [...prev, botMsg]);
        setLatestAnalysis({
          intent: data.intent || 'Commercial Inquiry',
          readiness_score: data.readiness_score || 65,
          lead_temperature: (data.readiness_score || 65) >= 80 ? 'High Intent' : 'Moderate Intent',
          extracted_parameters: data.extracted_parameters || {},
          missing_fields: data.missing_fields || []
        });
      }
    } catch (err) {
      setSimulating(false);
      setSimMessages(prev => [
        ...prev,
        { id: `err-${Date.now()}`, sender: 'bot', text: `Error: ${err.message}`, time: timeStr }
      ]);
    }
  };

  // 5 Pipeline Stepper Tabs Definition (Guided Steps 1-4 + Direct Master System Prompt Step 5)
  const NAVIGATION_TABS = [
    {
      id: 'identity',
      stepNum: 1,
      title: 'Identity & Voice',
      subtitle: 'Entity, Persona & Tone',
      icon: Building2,
      count: null
    },
    {
      id: 'offerings',
      stepNum: 2,
      title: 'Catalog & Services',
      subtitle: 'Deliverables & Pricing',
      icon: Briefcase,
      count: (profile.core_offerings || []).length
    },
    {
      id: 'rules',
      stepNum: 3,
      title: 'Lead Qualification',
      subtitle: 'Required Lead Criteria',
      icon: Target,
      count: (profile.qualification_rules || []).length
    },
    {
      id: 'policies',
      stepNum: 4,
      title: 'Operations & Guidelines',
      subtitle: 'Hours, Location & Terms',
      icon: Clock,
      count: null
    },
    {
      id: 'direct',
      stepNum: 5,
      title: 'Direct Master Prompt',
      subtitle: 'Live Custom Directive',
      icon: FileText,
      count: null
    }
  ];

  return (
    <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '24px 24px 80px', position: 'relative' }}>
      
      {/* Zero-Bot Blocking Modal Dialog */}
      {(!bots || bots.length === 0) && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            width: '100%',
            maxWidth: '460px',
            backgroundColor: 'var(--bg-surface, #ffffff)',
            borderRadius: '16px',
            padding: '32px 28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--border-subtle, #e2e8f0)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              color: '#4f46e5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bot size={28} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary, #0f172a)', margin: '0 0 8px' }}>
                Chatbot Connection Required
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary, #64748b)', margin: 0, lineHeight: 1.6 }}>
                No active chatbot found. You must create a chatbot first to train and configure its neural knowledge base in Universal Studio.
              </p>
            </div>
            <button
              onClick={() => navigate('/bots')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                width: '100%',
                padding: '12px 20px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: '#4f46e5',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                transition: 'all 0.15s ease'
              }}
            >
              <Bot size={16} />
              <span>Create Your First Chatbot</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Header Toolbar (Clean, without redundant action line) */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
            flexShrink: 0
          }}>
            <Bot size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{
                fontSize: '22px',
                fontWeight: 800,
                color: 'var(--text-primary)',
                margin: 0,
                letterSpacing: '-0.02em'
              }}>
                Universal AI Knowledge Base &amp; Studio
              </h1>
              <span style={{
                backgroundColor: 'rgba(79, 70, 229, 0.08)',
                color: '#4f46e5',
                border: '1px solid rgba(79, 70, 229, 0.2)',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700
              }}>
                Enterprise Knowledge Engine
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '3px 0 0' }}>
              Train your autonomous AI representative with domain intelligence, dynamic service offerings, and qualification rules.
            </p>
          </div>
        </div>
      </div>

      {/* 2. AI Copilot Synthesis Card */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.05) 0%, rgba(14, 165, 233, 0.05) 100%)',
        border: '1px solid rgba(79, 70, 229, 0.2)',
        borderRadius: '14px',
        padding: '16px 20px',
        marginBottom: '20px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '26px', height: '26px', borderRadius: '7px', backgroundColor: '#e0e7ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Wand2 size={14} color="#4f46e5" />
            </div>
            <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-primary)' }}>
              AI Copilot Auto-Synthesis
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Describe your business in one sentence to instantly generate the full catalog, pricing &amp; qualification rules
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#4f46e5', fontWeight: 700 }}>
            Powered by Google Gemini
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="e.g. Specialty dental clinic in Mumbai offering implants, clear aligners, and cosmetic procedures..."
            value={generatorPrompt}
            onChange={(e) => setGeneratorPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSynthesizeProfile()}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              backgroundColor: 'var(--bg-surface)',
              fontSize: '13px',
              color: 'var(--text-primary)',
              outline: 'none'
            }}
          />
          <button
            onClick={() => handleSynthesizeProfile()}
            disabled={isSynthesizing || !generatorPrompt.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: isSynthesizing ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            <Sparkles size={13} className={isSynthesizing ? 'animate-spin' : ''} />
            <span>{isSynthesizing ? 'Generating Profile...' : 'Auto-Generate'}</span>
          </button>
        </div>

        {/* Quick Sample Prompts */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Quick Prompts:</span>
          {[
            'Custom Software Studio & AI Automations',
            'Multi-Specialty Healthcare Clinic & Diagnostics',
            'Luxury Sea-Facing Real Estate Advisory',
            'Direct-to-Consumer Fashion Retail Store',
            'B2B Growth Agency & Outbound Lead Systems'
          ].map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setGeneratorPrompt(prompt);
                handleSynthesizeProfile(prompt);
              }}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(79, 70, 229, 0.18)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.12s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#4f46e5';
                e.currentTarget.style.color = '#4f46e5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(79, 70, 229, 0.18)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Industry Presets Strip (8 Domains) */}
      <div style={{ marginBottom: '22px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Layers size={14} color="#4f46e5" />
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
              1-Click Industry Presets
            </span>
            <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              (Loads verified catalogs, pricing benchmarks &amp; qualification logic)
            </span>
          </div>
          <span style={{ fontSize: '11.5px', color: '#64748b' }}>
            Select any to apply
          </span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '10px'
        }}>
          {INDUSTRY_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            const IconComponent = preset.icon;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  padding: '11px 13px',
                  borderRadius: '10px',
                  border: '2px solid',
                  borderColor: isSelected ? preset.color : 'var(--border-subtle)',
                  backgroundColor: isSelected ? `${preset.color}0a` : 'var(--bg-surface)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  position: 'relative',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                  boxShadow: isSelected ? `0 4px 12px ${preset.color}20` : 'none',
                  boxSizing: 'border-box'
                }}
              >
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  backgroundColor: isSelected ? preset.color : 'var(--bg-page)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'background-color 0.15s ease'
                }}>
                  <IconComponent size={16} color={isSelected ? '#ffffff' : 'var(--text-secondary)'} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: isSelected ? preset.color : 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {preset.label}
                  </div>
                  <div style={{
                    fontSize: '10.5px',
                    color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginTop: '1px'
                  }}>
                    {preset.tagline}
                  </div>
                </div>

                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  border: '2px solid',
                  borderColor: isSelected ? preset.color : '#cbd5e1',
                  backgroundColor: isSelected ? preset.color : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '2px',
                  transition: 'background-color 0.15s ease, border-color 0.15s ease'
                }}>
                  <Check
                    size={10}
                    color="#ffffff"
                    strokeWidth={3}
                    style={{
                      opacity: isSelected ? 1 : 0,
                      transition: 'opacity 0.15s ease'
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Main Two-Column View: Studio Tabs Left + Spacious Live Simulator Right */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: (typeof window !== 'undefined' && windowWidth < 1180) ? '1fr' : 'minmax(0, 1.25fr) minmax(390px, 450px)',
        gap: '24px',
        alignItems: 'start'
      }}>
        
        {/* Left Side: Modern Stepper & Studio Workspace */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0, width: '100%' }}>
          
          {/* Studio Configuration Mode Switcher: Guided 4-Step Pipeline vs Direct Master System Prompt */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            padding: '6px',
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            minWidth: 0
          }}>
            <button
              type="button"
              onClick={() => {
                setStudioMode('guided');
                if (activeTab === 'direct') setActiveTab('identity');
                setProfile(prev => ({ ...prev, direct_prompt_enabled: false }));
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '2px solid',
                borderColor: (studioMode === 'guided' && activeTab !== 'direct') ? '#4f46e5' : 'transparent',
                backgroundColor: (studioMode === 'guided' && activeTab !== 'direct') ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                color: (studioMode === 'guided' && activeTab !== 'direct') ? '#4f46e5' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '12.5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                minWidth: 0
              }}
            >
              <Sliders size={15} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Guided 4-Step Studio</span>
              <span style={{
                fontSize: '10.5px',
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: '999px',
                backgroundColor: (studioMode === 'guided' && activeTab !== 'direct') ? '#4f46e5' : 'var(--bg-page)',
                color: (studioMode === 'guided' && activeTab !== 'direct') ? '#ffffff' : 'var(--text-muted)',
                flexShrink: 0
              }}>
                Structured
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setStudioMode('direct');
                setActiveTab('direct');
                setProfile(prev => {
                  const compiled = prev.direct_prompt?.trim() ? prev.direct_prompt : compileFullPromptFromProfile(prev);
                  return {
                    ...prev,
                    direct_prompt_enabled: true,
                    direct_prompt: compiled
                  };
                });
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: '10px',
                border: '2px solid',
                borderColor: (studioMode === 'direct' || activeTab === 'direct') ? '#4f46e5' : 'transparent',
                backgroundColor: (studioMode === 'direct' || activeTab === 'direct') ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                color: (studioMode === 'direct' || activeTab === 'direct') ? '#4f46e5' : 'var(--text-secondary)',
                fontWeight: 700,
                fontSize: '12.5px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                minWidth: 0
              }}
            >
              <FileText size={15} />
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Direct Master Prompt</span>
              <span style={{
                fontSize: '10.5px',
                fontWeight: 600,
                padding: '2px 7px',
                borderRadius: '999px',
                backgroundColor: (studioMode === 'direct' || activeTab === 'direct') ? '#4f46e5' : 'var(--bg-page)',
                color: (studioMode === 'direct' || activeTab === 'direct') ? '#ffffff' : 'var(--text-muted)',
                flexShrink: 0
              }}>
                Direct AI
              </span>
            </button>
          </div>

          {/* Reimagined Pipeline Stepper (Interconnected 5-Step Navigation - Responsive & Compact) */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            padding: '8px 10px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
            gap: '6px',
            minWidth: 0
          }}>
            {NAVIGATION_TABS.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    if (tab.id === 'direct') {
                      setStudioMode('direct');
                      setProfile(prev => {
                        const compiled = prev.direct_prompt?.trim() ? prev.direct_prompt : compileFullPromptFromProfile(prev);
                        return {
                          ...prev,
                          direct_prompt_enabled: true,
                          direct_prompt: compiled
                        };
                      });
                    } else {
                      setStudioMode('guided');
                      setProfile(prev => ({ ...prev, direct_prompt_enabled: false }));
                    }
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '8px 8px',
                    borderRadius: '10px',
                    border: '2px solid',
                    borderColor: isActive ? '#4f46e5' : 'transparent',
                    backgroundColor: isActive ? 'rgba(79, 70, 229, 0.08)' : 'transparent',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'background-color 0.15s ease, border-color 0.15s ease',
                    boxSizing: 'border-box',
                    minWidth: 0,
                    overflow: 'hidden'
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '7px',
                    backgroundColor: isActive ? '#4f46e5' : 'var(--bg-page)',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    boxShadow: isActive ? '0 2px 8px rgba(79, 70, 229, 0.3)' : 'none',
                    transition: 'all 0.15s ease'
                  }}>
                    <TabIcon size={14} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{
                        fontSize: '9.5px',
                        fontWeight: 800,
                        textTransform: 'uppercase',
                        color: isActive ? '#4f46e5' : 'var(--text-muted)',
                        whiteSpace: 'nowrap'
                      }}>
                        Step {tab.stepNum}
                      </span>
                      {tab.count !== null && (
                        <span style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          backgroundColor: isActive ? '#4f46e5' : 'var(--bg-page)',
                          color: isActive ? '#ffffff' : 'var(--text-muted)',
                          padding: '1px 5px',
                          borderRadius: '9999px',
                          lineHeight: 1
                        }}>
                          {tab.count}
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {tab.title}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* TAB 1: Business Identity & Tone */}
          {activeTab === 'identity' && (
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              minHeight: '680px',
              boxSizing: 'border-box'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Building2 size={18} color="#4f46e5" />
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Step 1: Business Identity &amp; Voice Directive
                  </h3>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                  Define how the AI introduces itself, its commercial vertical, and its consultative persona.
                </p>
              </div>

              {/* Entity Name & Industry */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Entity / Target Chatbot *
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-page)',
                    position: 'relative'
                  }}>
                    <Bot size={15} color="#4f46e5" />
                    <select
                      value={selectedBotId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setSelectedBotId(newId);
                        const matched = bots.find(b => String(b.id) === String(newId));
                        if (matched) {
                          setProfile(prev => ({
                            ...prev,
                            business_name: matched.bot_name || prev.business_name,
                            direct_prompt: matched.system_instructions || prev.direct_prompt
                          }));
                        }
                      }}
                      style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        fontSize: '13px',
                        color: 'var(--text-primary)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        paddingRight: '22px',
                        appearance: 'none',
                        WebkitAppearance: 'none'
                      }}
                    >
                      {bots && bots.length > 0 ? (
                        bots.map(b => (
                          <option key={b.id} value={b.id} style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                            {b.bot_name || b.id}
                          </option>
                        ))
                      ) : (
                        <option value="">No chatbot created</option>
                      )}
                    </select>
                    <ChevronDown size={14} color="#64748b" style={{ position: 'absolute', right: '12px', pointerEvents: 'none' }} />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Industry Classification *
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-page)'
                  }}>
                    <Layers size={15} color="#94a3b8" />
                    <input
                      type="text"
                      value={profile.industry_category || ''}
                      onChange={(e) => setProfile({ ...profile, industry_category: e.target.value })}
                      placeholder="e.g. Healthcare, Software Studio, Real Estate"
                      style={{
                        flex: 1,
                        border: 'none',
                        background: 'transparent',
                        outline: 'none',
                        fontSize: '13px',
                        color: 'var(--text-primary)',
                        fontWeight: 600
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Reimagined Conversational Persona & Tone (Visual Cards) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Conversational Persona &amp; Tone (Select Archetype)
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Governs tone, pacing &amp; vocabulary
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                  {PERSONA_OPTIONS.map((opt) => {
                    const isSelected = profile.brand_voice === opt.tone;
                    const OptIcon = opt.icon;

                    return (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => setProfile({ ...profile, brand_voice: opt.tone })}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'flex-start',
                          padding: '14px',
                          borderRadius: '10px',
                          border: '2px solid',
                          borderColor: isSelected ? '#4f46e5' : 'var(--border-subtle)',
                          backgroundColor: isSelected ? 'rgba(79, 70, 229, 0.05)' : 'var(--bg-page)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          position: 'relative',
                          transition: 'background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease',
                          boxShadow: isSelected ? '0 4px 12px rgba(79, 70, 229, 0.12)' : 'none',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '7px',
                              backgroundColor: isSelected ? '#4f46e5' : 'var(--bg-surface)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: isSelected ? '#ffffff' : '#64748b',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                              flexShrink: 0
                            }}>
                              <OptIcon size={15} />
                            </div>
                            <span style={{
                              fontSize: '12.5px',
                              fontWeight: 800,
                              color: isSelected ? '#4f46e5' : 'var(--text-primary)'
                            }}>
                              {opt.title}
                            </span>
                          </div>

                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: '2px solid',
                            borderColor: isSelected ? '#4f46e5' : '#cbd5e1',
                            backgroundColor: isSelected ? '#4f46e5' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            transition: 'background-color 0.15s ease, border-color 0.15s ease'
                          }}>
                            <Check
                              size={10}
                              color="#ffffff"
                              strokeWidth={3}
                              style={{
                                opacity: isSelected ? 1 : 0,
                                transition: 'opacity 0.15s ease'
                              }}
                            />
                          </div>
                        </div>

                        <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '0 0 8px', lineHeight: 1.4 }}>
                          {opt.description}
                        </p>

                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: isSelected ? '#4f46e51a' : 'var(--bg-surface)',
                          color: isSelected ? '#4f46e5' : '#64748b',
                          padding: '2px 8px',
                          borderRadius: '5px'
                        }}>
                          {opt.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Optional Custom Directives Accordion */}
                <div style={{ marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setCustomToneExpanded(!customToneExpanded)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      background: 'transparent',
                      border: 'none',
                      color: '#4f46e5',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      padding: '4px 0'
                    }}
                  >
                    <Sliders size={13} />
                    <span>{customToneExpanded ? 'Hide Custom Prompt Directives' : 'Fine-Tune Custom Prompt Directives (Optional)'}</span>
                    {customToneExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                  </button>

                  {customToneExpanded && (
                    <div style={{ marginTop: '8px' }}>
                      <textarea
                        rows={3}
                        value={profile.brand_voice || ''}
                        onChange={(e) => setProfile({ ...profile, brand_voice: e.target.value })}
                        placeholder="Define custom personality guidelines, tone restrictions, or greetings..."
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--bg-page)',
                          fontSize: '12px',
                          color: 'var(--text-primary)',
                          outline: 'none',
                          fontFamily: 'inherit',
                          lineHeight: 1.45
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Reimagined Primary Conversion Objective (Visual Grid Tiles) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    Primary Conversion Objective
                  </label>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    What the AI actively steers prospects to complete
                  </span>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '8px'
                }}>
                  {CONVERSION_OBJECTIVES.map((obj) => {
                    const isSelected = (profile.fulfillment_type || 'custom_quote') === obj.id;
                    const ObjIcon = obj.icon;

                    return (
                      <button
                        type="button"
                        key={obj.id}
                        onClick={() => setProfile({ ...profile, fulfillment_type: obj.id })}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: '2px solid',
                          borderColor: isSelected ? obj.accent : 'var(--border-subtle)',
                          backgroundColor: isSelected ? `${obj.accent}0d` : 'var(--bg-page)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'background-color 0.15s ease, border-color 0.15s ease',
                          boxSizing: 'border-box'
                        }}
                      >
                        <div style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '6px',
                          backgroundColor: isSelected ? obj.accent : 'var(--bg-surface)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isSelected ? '#ffffff' : '#64748b',
                          flexShrink: 0
                        }}>
                          <ObjIcon size={14} />
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: isSelected ? obj.accent : 'var(--text-primary)',
                            lineHeight: 1.2
                          }}>
                            {obj.title}
                          </div>
                          <div style={{
                            fontSize: '10.5px',
                            color: 'var(--text-muted)',
                            lineHeight: 1.3,
                            marginTop: '2px'
                          }}>
                            {obj.subtitle}
                          </div>
                        </div>

                        <div style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: isSelected ? obj.accent : '#cbd5e1',
                          backgroundColor: isSelected ? obj.accent : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          marginTop: '2px',
                          transition: 'background-color 0.15s ease, border-color 0.15s ease'
                        }}>
                          <Check
                            size={10}
                            color="#ffffff"
                            strokeWidth={3}
                            style={{
                              opacity: isSelected ? 1 : 0,
                              transition: 'opacity 0.15s ease'
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Navigation Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
                marginTop: '4px'
              }}>
                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Step 1 of 4: Business Identity Configured
                </span>

                <button
                  type="button"
                  onClick={() => setActiveTab('offerings')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>Continue to Catalog &amp; Services</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Core Offerings & Services */}
          {activeTab === 'offerings' && (
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              minHeight: '680px',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Briefcase size={18} color="#4f46e5" />
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Step 2: Commercial Catalog &amp; Services
                    </h3>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                    Configure the exact services, deliverables, pricing benchmarks, and turnaround times the AI quotes.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleAddOffering()}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.2)'
                  }}
                >
                  <Plus size={14} /> Add Deliverable
                </button>
              </div>

              {/* Offerings List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(profile.core_offerings || []).length === 0 ? (
                  <div style={{
                    padding: '36px',
                    textAlign: 'center',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: '10px',
                    color: 'var(--text-muted)',
                    fontSize: '13px'
                  }}>
                    <Briefcase size={28} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                    <p style={{ margin: '0 0 10px', fontWeight: 600 }}>No services configured in catalog.</p>
                    <button
                      type="button"
                      onClick={() => handleAddOffering()}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: '1px solid #4f46e5',
                        backgroundColor: '#4f46e510',
                        color: '#4f46e5',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      + Add First Offering
                    </button>
                  </div>
                ) : (
                  profile.core_offerings.map((offering, idx) => (
                    <div
                      key={idx}
                      style={{
                        backgroundColor: 'var(--bg-page)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '10px',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                          <span style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            backgroundColor: '#e0e7ff',
                            color: '#4f46e5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '11px',
                            fontWeight: 800
                          }}>
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={offering.name || ''}
                            placeholder="Service Deliverable Name (e.g. Custom Next.js SaaS Web App)"
                            onChange={(e) => {
                              const updated = [...profile.core_offerings];
                              updated[idx].name = e.target.value;
                              setProfile({ ...profile, core_offerings: updated });
                            }}
                            style={{
                              flex: 1,
                              fontSize: '14px',
                              fontWeight: 700,
                              border: 'none',
                              background: 'transparent',
                              outline: 'none',
                              color: 'var(--text-primary)'
                            }}
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveOffering(idx)}
                          title="Delete Offering"
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: '#ef4444',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px'
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '10px' }}>
                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '3px' }}>
                            Category / Domain
                          </label>
                          <input
                            type="text"
                            value={offering.category || ''}
                            placeholder="e.g. Software Development"
                            onChange={(e) => {
                              const updated = [...profile.core_offerings];
                              updated[idx].category = e.target.value;
                              setProfile({ ...profile, core_offerings: updated });
                            }}
                            style={{
                              width: '100%',
                              padding: '7px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: 'var(--bg-surface)',
                              fontSize: '12px',
                              color: 'var(--text-primary)'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '3px' }}>
                            Price Benchmark
                          </label>
                          <input
                            type="text"
                            value={offering.price_range || ''}
                            placeholder="e.g. $1,500 - $3,000"
                            onChange={(e) => {
                              const updated = [...profile.core_offerings];
                              updated[idx].price_range = e.target.value;
                              setProfile({ ...profile, core_offerings: updated });
                            }}
                            style={{
                              width: '100%',
                              padding: '7px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: 'var(--bg-surface)',
                              fontSize: '12px',
                              color: 'var(--text-primary)',
                              fontWeight: 700
                            }}
                          />
                        </div>

                        <div>
                          <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '3px' }}>
                            Turnaround Timeline
                          </label>
                          <input
                            type="text"
                            value={offering.turnaround || ''}
                            placeholder="e.g. 5 to 7 Days"
                            onChange={(e) => {
                              const updated = [...profile.core_offerings];
                              updated[idx].turnaround = e.target.value;
                              setProfile({ ...profile, core_offerings: updated });
                            }}
                            style={{
                              width: '100%',
                              padding: '7px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--border-subtle)',
                              backgroundColor: 'var(--bg-surface)',
                              fontSize: '12px',
                              color: 'var(--text-primary)'
                            }}
                          />
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '3px' }}>
                          Deliverables &amp; Inclusions
                        </label>
                        <input
                          type="text"
                          value={offering.description || ''}
                          placeholder="What the client receives upon project completion..."
                          onChange={(e) => {
                            const updated = [...profile.core_offerings];
                            updated[idx].description = e.target.value;
                            setProfile({ ...profile, core_offerings: updated });
                          }}
                          style={{
                            width: '100%',
                            padding: '7px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--border-subtle)',
                            backgroundColor: 'var(--bg-surface)',
                            fontSize: '12px',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Navigation Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
                marginTop: '4px'
              }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('identity')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'transparent',
                    fontSize: '12.5px',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('rules')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>Continue to Lead Qualification</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: Lead Qualification Parameters */}
          {activeTab === 'rules' && (
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              minHeight: '680px',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <Target size={18} color="#4f46e5" />
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Step 3: Lead Qualification Criteria
                    </h3>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                    Parameters the AI proactively extracts from inbound WhatsApp and web leads before notifying your team.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddQualRule}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontSize: '12.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(79, 70, 229, 0.2)'
                  }}
                >
                  <Plus size={14} /> Add Parameter
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {(profile.qualification_rules || []).map((rule, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px'
                    }}
                  >
                    <div style={{ flex: 1.2 }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '3px' }}>
                        Parameter Name
                      </label>
                      <input
                        type="text"
                        value={rule.label || ''}
                        placeholder="e.g. Target Budget"
                        onChange={(e) => {
                          const updated = [...profile.qualification_rules];
                          updated[idx].label = e.target.value;
                          setProfile({ ...profile, qualification_rules: updated });
                        }}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--bg-surface)',
                          fontSize: '12.5px',
                          color: 'var(--text-primary)',
                          fontWeight: 700
                        }}
                      />
                    </div>

                    <div style={{ flex: 2 }}>
                      <label style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, display: 'block', marginBottom: '3px' }}>
                        Agent Inquiry Directive / Nudge
                      </label>
                      <input
                        type="text"
                        value={rule.prompt_nudge || ''}
                        placeholder="e.g. Inquire about the customer's budget tier"
                        onChange={(e) => {
                          const updated = [...profile.qualification_rules];
                          updated[idx].prompt_nudge = e.target.value;
                          setProfile({ ...profile, qualification_rules: updated });
                        }}
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--border-subtle)',
                          backgroundColor: 'var(--bg-surface)',
                          fontSize: '12px',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>

                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      marginTop: '16px'
                    }}>
                      <input
                        type="checkbox"
                        checked={rule.is_mandatory || false}
                        onChange={(e) => {
                          const updated = [...profile.qualification_rules];
                          updated[idx].is_mandatory = e.target.checked;
                          setProfile({ ...profile, qualification_rules: updated });
                        }}
                        style={{ accentColor: '#4f46e5', cursor: 'pointer' }}
                      />
                      Mandatory
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveQualRule(idx)}
                      title="Remove Parameter"
                      style={{
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        cursor: 'pointer',
                        marginTop: '16px',
                        padding: '4px'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Bottom Navigation Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
                marginTop: '4px'
              }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('offerings')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'transparent',
                    fontSize: '12.5px',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('policies')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(79, 70, 229, 0.25)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>Continue to Operations</span>
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: Operations & FAQs */}
          {activeTab === 'policies' && (
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              minHeight: '680px',
              boxSizing: 'border-box'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <Clock size={18} color="#4f46e5" />
                  <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Step 4: Operational Guidelines &amp; Policies
                  </h3>
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                  Standard operating hours, facility address, payment terms, and client guarantees.
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    <Clock size={14} color="#4f46e5" />
                    <span>Operating Hours</span>
                  </label>
                  <input
                    type="text"
                    value={profile.policies_and_faqs?.operating_hours || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      policies_and_faqs: { ...profile.policies_and_faqs, operating_hours: e.target.value }
                    })}
                    placeholder="e.g. Mon-Sat: 9:00 AM - 7:00 PM"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-page)',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    <MapPin size={14} color="#0891b2" />
                    <span>Facility / Office Location</span>
                  </label>
                  <input
                    type="text"
                    value={profile.policies_and_faqs?.location_address || ''}
                    onChange={(e) => setProfile({
                      ...profile,
                      policies_and_faqs: { ...profile.policies_and_faqs, location_address: e.target.value }
                    })}
                    placeholder="e.g. Level 18, Prime Tower, Downtown"
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-page)',
                      fontSize: '13px',
                      color: 'var(--text-primary)',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  <CreditCard size={14} color="#059669" />
                  <span>Commercial Terms &amp; Invoicing</span>
                </label>
                <input
                  type="text"
                  value={profile.policies_and_faqs?.payment_terms || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    policies_and_faqs: { ...profile.policies_and_faqs, payment_terms: e.target.value }
                  })}
                  placeholder="e.g. 50% milestone deposit, 50% on verified delivery"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-page)',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  <ShieldCheck size={14} color="#7c3aed" />
                  <span>Quality Assurances &amp; Guarantees</span>
                </label>
                <input
                  type="text"
                  value={profile.policies_and_faqs?.custom_policies || ''}
                  onChange={(e) => setProfile({
                    ...profile,
                    policies_and_faqs: { ...profile.policies_and_faqs, custom_policies: e.target.value }
                  })}
                  placeholder="e.g. 100% Satisfaction guarantee with 30-day post-delivery warranty"
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-page)',
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Bottom Navigation Footer */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
                marginTop: '4px'
              }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('rules')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'transparent',
                    fontSize: '12.5px',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('direct');
                      setStudioMode('direct');
                      setProfile(prev => {
                        const compiled = prev.direct_prompt?.trim() ? prev.direct_prompt : compileFullPromptFromProfile(prev);
                        return {
                          ...prev,
                          direct_prompt_enabled: true,
                          direct_prompt: compiled
                        };
                      });
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: '1px solid #4f46e5',
                      backgroundColor: 'rgba(79, 70, 229, 0.06)',
                      color: '#4f46e5',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <span>Continue to Direct Master Prompt</span>
                    <ChevronRight size={15} />
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: '#16a34a',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)'
                    }}
                  >
                    <Save size={14} />
                    <span>{saving ? 'Deploying...' : 'Save & Deploy Agent'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: Direct Master System Prompt Directive (Unified Single Card - Zero Layout Shift) */}
          {activeTab === 'direct' && (
            <div style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
              minHeight: '680px',
              boxSizing: 'border-box'
            }}>
              {/* Card Header with Sync & Copy Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <FileText size={18} color="#4f46e5" />
                    <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                      Step 5: Direct Master System Prompt Directive
                    </h3>
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', margin: 0 }}>
                    Custom instructions injected directly into your connected WhatsApp and Web AI neural brain.
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      const compiled = compileFullPromptFromProfile(profile);
                      setProfile(prev => ({
                        ...prev,
                        direct_prompt: compiled,
                        direct_prompt_enabled: true
                      }));
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-page)',
                      color: 'var(--text-secondary)',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                    title="Populate or overwrite with the synthesized instructions from the 4-Step Builder"
                  >
                    <RotateCcw size={12} />
                    <span>Sync from 4 Steps</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (profile.direct_prompt) {
                        navigator.clipboard.writeText(profile.direct_prompt);
                        setCopiedPromptSuccess(true);
                        setTimeout(() => setCopiedPromptSuccess(false), 2500);
                      }
                    }}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: copiedPromptSuccess ? 'rgba(22, 163, 74, 0.1)' : 'var(--bg-page)',
                      color: copiedPromptSuccess ? '#16a34a' : 'var(--text-secondary)',
                      fontSize: '11.5px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    {copiedPromptSuccess ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedPromptSuccess ? 'Copied' : 'Copy Prompt'}</span>
                  </button>
                </div>
              </div>

              {/* Entity / Target Chatbot Row (Consistent with Step 1) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Entity / Target Chatbot *
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-page)',
                    position: 'relative'
                  }}>
                    <Bot size={15} color="#4f46e5" />
                    <select
                      value={selectedBotId}
                      onChange={(e) => {
                        const newId = e.target.value;
                        setSelectedBotId(newId);
                        const matched = bots.find(b => String(b.id) === String(newId));
                        if (matched) {
                          setProfile(prev => ({
                            ...prev,
                            business_name: matched.bot_name || prev.business_name,
                            direct_prompt: (matched.system_instructions && matched.system_instructions.trim()) ? matched.system_instructions : prev.direct_prompt
                          }));
                        }
                      }}
                      style={{
                        flex: 1,
                        border: 'none',
                        outline: 'none',
                        background: 'transparent',
                        fontSize: '13px',
                        fontWeight: 700,
                        color: 'var(--text-primary)',
                        cursor: 'pointer'
                      }}
                    >
                      {bots.map(b => (
                        <option key={b.id} value={b.id} style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}>
                          {b.bot_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Execution Channel &amp; Mode *
                  </label>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-page)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-primary)'
                  }}>
                    <Cpu size={15} color="#059669" />
                    <span>WhatsApp &amp; Web Realtime Synced</span>
                  </div>
                </div>
              </div>

              {/* Textarea for Direct Master System Prompt */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    System Instructions &amp; Behavioral Guidelines
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Characters: {(profile.direct_prompt || '').length} | Est. Tokens: ~{Math.round(((profile.direct_prompt || '').length) / 4)}
                    </span>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(22, 163, 74, 0.1)',
                      color: '#15803d'
                    }}>
                      <ShieldCheck size={11} /> Low-Load Optimized
                    </span>
                  </div>
                </div>

                <textarea
                  value={profile.direct_prompt || ''}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    direct_prompt: e.target.value,
                    direct_prompt_enabled: true
                  }))}
                  rows={18}
                  placeholder="Enter or customize your complete system prompt here..."
                  style={{
                    width: '100%',
                    flex: 1,
                    minHeight: '440px',
                    padding: '16px',
                    borderRadius: '10px',
                    border: '1px solid var(--border-subtle)',
                    backgroundColor: 'var(--bg-page)',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    lineHeight: '1.6',
                    fontFamily: 'Consolas, Monaco, "Courier New", monospace',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
              </div>

              {/* Direct Mode Bottom Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '16px',
                borderTop: '1px solid var(--border-subtle)',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('policies');
                    setStudioMode('guided');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-subtle)',
                    background: 'transparent',
                    fontSize: '12.5px',
                    cursor: 'pointer'
                  }}
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                  <Cpu size={14} />
                  <span>Pruned 4-turn context ensures minimal token consumption and instant replies.</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleCompileAndDeployPrompt}
                    disabled={launchingPrompt}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: launchSuccess ? '#16a34a' : '#4f46e5',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: launchingPrompt ? 'not-allowed' : 'pointer',
                      boxShadow: launchSuccess ? '0 2px 8px rgba(22, 163, 74, 0.3)' : '0 2px 8px rgba(79, 70, 229, 0.3)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {launchSuccess ? <Check size={14} strokeWidth={3} /> : <Rocket size={14} />}
                    <span>{launchingPrompt ? 'Deploying to Model...' : launchSuccess ? 'Prompt Deployed!' : `Ready to Launch Prompt (${activeBotName})`}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={saving}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 18px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      backgroundColor: 'var(--bg-surface)',
                      color: 'var(--text-primary)',
                      fontSize: '13px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    <Save size={14} />
                    <span>{saving ? 'Saving...' : 'Save Profile'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Live Interactive AI Simulator */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '14px',
          display: 'flex',
          flexDirection: 'column',
          height: '760px',
          minWidth: 0,
          width: '100%',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          position: (typeof window !== 'undefined' && windowWidth >= 1180) ? 'sticky' : 'static',
          top: '20px'
        }}>
          {/* Simulator Top Header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-page)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: '#22c55e',
                  boxShadow: '0 0 8px #22c55e',
                  flexShrink: 0
                }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                    Live WhatsApp &amp; Web Simulator
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    Testing: <strong style={{ color: '#4f46e5' }}>{activeBotName}</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={handleCompileAndDeployPrompt}
                  disabled={launchingPrompt}
                  title="Compile & Deploy Master Prompt into Bot Model"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: launchSuccess ? '#16a34a' : '#4f46e5',
                    background: launchSuccess ? 'rgba(22, 163, 74, 0.1)' : 'rgba(79, 70, 229, 0.08)',
                    border: `1px solid ${launchSuccess ? 'rgba(22, 163, 74, 0.3)' : 'rgba(79, 70, 229, 0.25)'}`,
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: launchingPrompt ? 'not-allowed' : 'pointer',
                    transition: 'all 0.15s ease',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <Rocket size={11} />
                  <span>{launchSuccess ? 'Deployed' : 'Launch Prompt'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSimMessages([{
                    id: 'init-1',
                    sender: 'bot',
                    text: `Hello. Thank you for connecting with ${activeBotName}. How can I assist you with our services, packages, or consultation scheduling today?`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }])}
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Telemetry HUD Bar (Zero Emojis) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexWrap: 'wrap',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '8px 10px'
            }}>
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: latestAnalysis.readiness_score >= 80 ? 'rgba(22, 163, 74, 0.12)' : 'rgba(234, 88, 12, 0.12)',
                color: latestAnalysis.readiness_score >= 80 ? '#15803d' : '#c2410c'
              }}>
                <Zap size={11} /> {latestAnalysis.lead_temperature} ({latestAnalysis.readiness_score}/100)
              </span>

              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '5px',
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                color: '#4338ca'
              }}>
                <Target size={11} /> {latestAnalysis.intent}
              </span>

              <div style={{ flex: 1, minWidth: '100px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>Readiness:</span>
                <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--border-subtle)', borderRadius: '9999px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, Math.max(10, latestAnalysis.readiness_score || 50))}%`,
                    height: '100%',
                    backgroundColor: (latestAnalysis.readiness_score || 50) >= 80 ? '#16a34a' : '#4f46e5',
                    borderRadius: '9999px',
                    transition: 'all 0.3s ease'
                  }} />
                </div>
              </div>
            </div>

            {/* Simulator Token Quota & Billing HUD (Hard-refresh persistent) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginTop: '8px',
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              fontSize: '11.5px',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: '26px',
                  height: '26px',
                  padding: '0 6px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 800,
                  backgroundColor: creditUsage.freeRemaining >= 7
                    ? 'rgba(22, 163, 74, 0.15)'
                    : creditUsage.freeRemaining >= 3
                      ? 'rgba(217, 119, 6, 0.15)'
                      : 'rgba(220, 38, 38, 0.15)',
                  color: creditUsage.freeRemaining >= 7
                    ? '#15803d'
                    : creditUsage.freeRemaining >= 3
                      ? '#b45309'
                      : '#b91c1c',
                  border: `1px solid ${
                    creditUsage.freeRemaining >= 7
                      ? 'rgba(22, 163, 74, 0.3)'
                      : creditUsage.freeRemaining >= 3
                        ? 'rgba(217, 119, 6, 0.3)'
                        : 'rgba(220, 38, 38, 0.3)'
                  }`
                }}>
                  {creditUsage.freeRemaining}
                </span>

                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                    {creditUsage.freeRemaining > 0
                      ? `${creditUsage.freeRemaining} / 10 Free Inquiries Left`
                      : 'Free 10-Token Limit Reached'}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                    {creditUsage.freeRemaining > 0
                      ? 'Complimentary test tokens. ₹0.60/query charged beyond 10.'
                      : 'Metered usage active: ₹0.60 per inquiry'}
                  </div>
                </div>
              </div>

              {/* Metered Cost Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {creditUsage.paidCount > 0 ? (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 9px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(220, 38, 38, 0.08)',
                    color: '#dc2626',
                    border: '1px solid rgba(220, 38, 38, 0.25)',
                    fontWeight: 800,
                    fontSize: '11px'
                  }}>
                    <Coins size={12} /> Billed: ₹{Number(creditUsage.accruedCost || 0).toFixed(2)} ({creditUsage.paidCount} queries @ ₹0.60)
                  </span>
                ) : (
                  <span style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(22, 163, 74, 0.08)',
                    color: '#15803d',
                    border: '1px solid rgba(22, 163, 74, 0.2)',
                    fontWeight: 600,
                    fontSize: '10.5px'
                  }}>
                    <ShieldCheck size={12} /> Free Tier Active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Chat Messages Stream */}
          <div style={{
            flex: 1,
            padding: '16px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: 'var(--bg-page)'
          }}>
            {simMessages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    backgroundColor: m.sender === 'user' ? '#4f46e5' : 'var(--bg-surface)',
                    color: m.sender === 'user' ? '#ffffff' : 'var(--text-primary)',
                    fontSize: '13px',
                    lineHeight: 1.5,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                    border: m.sender === 'user' ? 'none' : '1px solid var(--border-subtle)'
                  }}
                >
                  <TypewriterMessage 
                    text={m.text} 
                    isStreaming={m.isStreaming} 
                    speed={18}
                    formatter={formatWhatsAppText}
                    onStreamEnd={() => { m.isStreaming = false; }}
                  />
                </div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px', padding: '0 4px' }}>
                  {m.time}
                </span>
              </div>
            ))}

            {simulating && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '10px',
                width: 'fit-content'
              }}>
                <RefreshCw size={13} className="animate-spin" color="#4f46e5" />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {activeBotName} is formulating reply...
                </span>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Ready to Launch Master Prompt Action Card */}
          <div style={{
            padding: '10px 14px',
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-subtle)',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.06) 0%, rgba(34, 197, 94, 0.06) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Rocket size={13} color="#4f46e5" />
                <span>Ready to Launch Prompt?</span>
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Compile &amp; inject system prompt into <strong>{activeBotName}</strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCompileAndDeployPrompt}
              disabled={launchingPrompt}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '7px 14px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: launchSuccess ? '#16a34a' : '#4f46e5',
                color: '#ffffff',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: launchingPrompt ? 'not-allowed' : 'pointer',
                boxShadow: launchSuccess ? '0 2px 8px rgba(22, 163, 74, 0.3)' : '0 2px 8px rgba(79, 70, 229, 0.3)',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {launchSuccess ? <Check size={12} strokeWidth={3} /> : <Rocket size={12} />}
              <span>{launchingPrompt ? 'Compiling & Launching...' : launchSuccess ? 'Prompt Deployed!' : 'Ready to Launch Prompt'}</span>
            </button>
          </div>

          {/* Quick Prompt Suggestions */}
          <div style={{
            padding: '8px 14px',
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '6px',
            overflowX: 'auto'
          }}>
            {[
              'What services do you provide?',
              'What are your pricing tiers?',
              'I would like to schedule a consultation',
              'Can I get a custom project quote?'
            ].map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSendSimMessage(p)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-subtle)',
                  backgroundColor: 'var(--bg-page)',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.12s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#4f46e5';
                  e.currentTarget.style.color = '#4f46e5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Chat Input Capsule */}
          <div style={{ padding: '12px 16px', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '24px',
              padding: '4px 5px 4px 14px'
            }}>
              <input
                type="text"
                placeholder={`Ask ${activeBotName} anything...`}
                value={simInput}
                onChange={(e) => setSimInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendSimMessage()}
                style={{
                  flex: 1,
                  border: 'none',
                  background: 'transparent',
                  outline: 'none',
                  fontSize: '13px',
                  color: 'var(--text-primary)'
                }}
              />
              <button
                onClick={() => handleSendSimMessage()}
                disabled={simulating || !simInput.trim()}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  cursor: (simulating || !simInput.trim()) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: (simulating || !simInput.trim()) ? 0.45 : 1,
                  transition: 'all 0.15s ease'
                }}
              >
                <ArrowUp size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
