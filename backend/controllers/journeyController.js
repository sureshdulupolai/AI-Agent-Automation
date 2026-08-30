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
  const { name, template_id, trigger, nodes } = req.body;
  const journeys = getJourneysData();

  const newJourney = {
    id: `journey-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: name || 'Untitled Journey',
    template_id: template_id || 'custom',
    status: 'inactive',
    trigger: trigger || {
      type: 'conversation',
      channel: 'all',
      label: 'Conversation'
    },
    nodes: nodes && nodes.length > 0 ? nodes : [
      {
        id: `node-${Date.now()}-1`,
        type: 'assign_agent',
        title: 'Assign to AI Agent',
        bot_id: '',
        bot_name: 'Select Bot',
        is_configured: false
      },
      {
        id: `node-${Date.now()}-2`,
        type: 'wait_delay',
        title: 'Wait Until',
        duration_value: 6,
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    execution_count: 0
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

  journeys[index] = {
    ...journeys[index],
    ...(name !== undefined && { name }),
    ...(status !== undefined && { status }),
    ...(trigger !== undefined && { trigger }),
    ...(nodes !== undefined && { nodes }),
    updated_at: new Date().toISOString()
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
