import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APPOINTMENTS_FILE = path.join(__dirname, '../data/appointments.json');

/**
 * Read appointments from disk
 */
export function readAppointments() {
  try {
    if (!fs.existsSync(APPOINTMENTS_FILE)) {
      fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify([]));
      return [];
    }
    return JSON.parse(fs.readFileSync(APPOINTMENTS_FILE, 'utf-8'));
  } catch (err) {
    return [];
  }
}

/**
 * Save appointments to disk
 */
export function saveAppointments(data) {
  try {
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Parse Natural Language Date & Time
 */
export function parseDateTimeFromText(text = '') {
  const lower = text.toLowerCase();
  const now = new Date();
  let targetDate = new Date();

  if (lower.includes('tomorrow')) {
    targetDate.setDate(now.getDate() + 1);
  } else if (lower.includes('day after tomorrow')) {
    targetDate.setDate(now.getDate() + 2);
  } else if (lower.includes('next monday')) {
    const day = now.getDay();
    const diff = (8 - day) % 7 || 7;
    targetDate.setDate(now.getDate() + diff);
  } else if (lower.includes('friday')) {
    const day = now.getDay();
    const diff = (5 - day + 7) % 7 || 7;
    targetDate.setDate(now.getDate() + diff);
  }

  // Parse hour (e.g. 4 PM, 11:30 AM, 3pm, 17:00)
  const timeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1], 10);
    const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const meridian = timeMatch[3] ? timeMatch[3].toLowerCase() : '';

    if (meridian === 'pm' && hour < 12) hour += 12;
    if (meridian === 'am' && hour === 12) hour = 0;

    targetDate.setHours(hour, minute, 0, 0);
  } else {
    // Default 11:00 AM
    targetDate.setHours(11, 0, 0, 0);
  }

  return targetDate.toISOString();
}

/**
 * Book an Appointment
 */
export function createAppointment({
  client_name = '',
  client_phone = '',
  client_email = '',
  service_title = 'Consultation Call',
  scheduled_time = null,
  raw_text = '',
  notes = '',
  bot_id = 'bot-ec0db899'
}) {
  const appointments = readAppointments();
  const time = scheduled_time || parseDateTimeFromText(raw_text);

  const newAppt = {
    id: `appt-${uuidv4().substring(0, 8)}`,
    client_name: client_name || 'Prospect Client',
    client_phone: client_phone || '',
    client_email: client_email || '',
    service_title: service_title || 'Discovery & Demo Session',
    scheduled_time: time,
    status: 'confirmed', // 'confirmed' | 'rescheduled' | 'cancelled'
    notes: notes || `Auto-booked by NovaByte AI Scheduler`,
    bot_id,
    created_at: new Date().toISOString()
  };

  appointments.unshift(newAppt);
  saveAppointments(appointments);
  return newAppt;
}

/**
 * Cancel an Appointment
 */
export function cancelAppointment(apptId) {
  const appointments = readAppointments();
  const appt = appointments.find(a => a.id === apptId);
  if (!appt) return null;
  appt.status = 'cancelled';
  saveAppointments(appointments);
  return appt;
}
