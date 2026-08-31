import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, '../data/journeys.json');

function getJourneysData() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading journeys data:', err);
    return [];
  }
}

function saveJourneysData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error saving journeys data:', err);
  }
}

export const listJourneys = (req, res) => {
  const journeys = getJourneysData();
  res.json({ success: true, journeys });
};

export const getJourney = (req, res) => {
  const { id } = req.params;
  const journeys = getJourneysData();
  const journey = journeys.find(j => j.id === id);

  if (!journey) {
    return res.status(404).json({ success: false, error: 'Journey not found' });
  }

  res.json({ success: true, journey });
};

export const createJourney = (req, res) => {
  const { name, template_id, channel, trigger, nodes } = req.body;
  const journeys = getJourneysData();

  const channelVal = channel || (template_id && template_id.includes('ig') ? 'instagram' : 'whatsapp');
  const channelLabelVal = channelVal === 'instagram' ? 'Instagram' : (channelVal === 'whatsapp' ? 'WhatsApp' : 'Omnichannel');

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const newJourney = {
    id: `journey-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name || 'Untitled Journey',
    template_id: template_id || 'custom',
    channel: channelVal,
    channel_label: channelLabelVal,
    status: 'active',
    version: 'v1',
    formatted_date: `${dateStr} at ${timeStr}`,
    trigger: trigger || {
      type: 'conversation',
      channel: channelVal,
      label: 'Conversation'
    },
    nodes: nodes && nodes.length > 0 ? nodes : [
      {
        id: `node-${Date.now()}-1`,
        type: 'assign_agent',
        title: 'Assign to AI Agent',
        bot_id: 'bot-apex-agency',
        bot_name: 'Apex AI Assistant',
        is_configured: true
      },
      {
        id: `node-${Date.now()}-2`,
        type: 'wait_delay',
        title: 'Wait Until',
        duration_value: 2,
        duration_unit: 'hours',
        is_configured: true
      },
      {
        id: `node-${Date.now()}-3`,
        type: 'send_message',
        title: 'Send Message in Conversation',
        message_text: 'Hello! Let us know if you need assistance.',
        is_configured: true
      }
    ],
    stats: {
      total_runs: 0,
      completed: 0,
      sent: 0,
      delivered: 0,
      read: 0,
      failed: 0,
      outcomes: {
        completed: 0,
        in_progress: 0,
        dropped_off: 0,
        failed: 0
      }
    },
    runs: [],
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  };

  journeys.unshift(newJourney);
  saveJourneysData(journeys);

  res.status(201).json({ success: true, journey: newJourney });
};

export const updateJourney = (req, res) => {
  const { id } = req.params;
  const { name, status, trigger, nodes } = req.body;
  const journeys = getJourneysData();
  const index = journeys.findIndex(j => j.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Journey not found' });
  }

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const currentVerNum = parseInt((journeys[index].version || 'v1').replace('v', '')) || 1;

  journeys[index] = {
    ...journeys[index],
    ...(name !== undefined && { name }),
    ...(status !== undefined && { status }),
    ...(trigger !== undefined && { trigger }),
    ...(nodes !== undefined && { 
      nodes,
      version: `v${currentVerNum + 1}`
    }),
    formatted_date: `${dateStr} at ${timeStr}`,
    updated_at: now.toISOString()
  };

  saveJourneysData(journeys);
  res.json({ success: true, journey: journeys[index] });
};

export const toggleJourneyStatus = (req, res) => {
  const { id } = req.params;
  const journeys = getJourneysData();
  const index = journeys.findIndex(j => j.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Journey not found' });
  }

  const currentStatus = journeys[index].status;
  journeys[index].status = currentStatus === 'active' ? 'inactive' : 'active';
  journeys[index].updated_at = new Date().toISOString();

  saveJourneysData(journeys);
  res.json({ success: true, status: journeys[index].status, journey: journeys[index] });
};

export const simulateRun = (req, res) => {
  const { id } = req.params;
  const { contact_name, contact_handle } = req.body;
  const journeys = getJourneysData();
  const index = journeys.findIndex(j => j.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Journey not found' });
  }

  const j = journeys[index];
  const sampleNames = ['Jessica Miller', 'Marcus Aurelius', 'Elena Rostova', 'Priya Patel', 'Chris Evans', 'Maya Lin'];
  const chosenName = contact_name || sampleNames[Math.floor(Math.random() * sampleNames.length)];
  const chosenHandle = contact_handle || (j.channel === 'whatsapp' ? `+91 ${Math.floor(10000 + Math.random() * 90000)} ${Math.floor(10000 + Math.random() * 90000)}` : `@${chosenName.toLowerCase().replace(' ', '.')}`);

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' });
  const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const lastStepName = j.nodes && j.nodes.length > 0 ? j.nodes[j.nodes.length - 1].title : 'Send Message';

  const newRun = {
    id: `run-${Date.now()}`,
    contact_name: chosenName,
    contact_handle: chosenHandle,
    contact_channel: j.channel || 'whatsapp',
    state: 'completed',
    last_step: lastStepName,
    version: j.version || 'v2',
    created_at: `${dateStr} at ${timeStr}`,
    updated_at: `${dateStr} at ${timeStr}`,
    logs: [
      { time: `${timeStr}`, step: `Trigger: ${j.trigger?.label || 'Inbound Message received'}`, status: 'success' },
      ...(j.nodes || []).map((n, nIdx) => ({
        time: `${timeStr}`,
        step: `Step ${nIdx + 1}: ${n.title} (${n.type === 'send_message' ? 'Delivered' : (n.type === 'wait_delay' ? `${n.duration_value} ${n.duration_unit}` : (n.bot_name || 'AI Assistant'))})`,
        status: 'success'
      })),
      { time: `${timeStr}`, step: 'Status: Journey execution completed', status: 'success' }
    ]
  };

  if (!j.runs) j.runs = [];
  j.runs.unshift(newRun);

  if (!j.stats) {
    j.stats = { total_runs: 0, completed: 0, sent: 0, delivered: 0, read: 0, failed: 0, outcomes: { completed: 0, in_progress: 0, dropped_off: 0, failed: 0 } };
  }

  j.stats.total_runs += 1;
  j.stats.completed += 1;
  j.stats.sent += 1;
  j.stats.delivered += 1;
  j.stats.read += 1;
  j.stats.outcomes.completed += 1;

  saveJourneysData(journeys);
  res.json({ success: true, run: newRun, stats: j.stats });
};

export const deleteJourney = (req, res) => {
  const { id } = req.params;
  let journeys = getJourneysData();
  const beforeCount = journeys.length;
  journeys = journeys.filter(j => j.id !== id);

  if (journeys.length === beforeCount) {
    return res.status(404).json({ success: false, error: 'Journey not found' });
  }

  saveJourneysData(journeys);
  res.json({ success: true, message: 'Journey deleted successfully' });
};
