import * as appointmentService from '../services/appointmentService.js';

export function listAppointments(req, res) {
  try {
    let appointments = appointmentService.readAppointments();

    // Seed default appointment if empty
    if (appointments.length === 0) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(15, 0, 0, 0);

      appointmentService.createAppointment({
        client_name: 'Rahul Sharma',
        client_phone: '+91 98206 46838',
        client_email: 'rahul.s@techcorp.in',
        service_title: 'SaaS Platform & AI Automation Demo',
        scheduled_time: tomorrow.toISOString(),
        notes: 'Requested live demonstration of WhatsApp Broadcast and AI agents.'
      });
      appointments = appointmentService.readAppointments();
    }

    return res.json({ success: true, appointments });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function bookAppointment(req, res) {
  try {
    const appt = appointmentService.createAppointment(req.body);
    return res.status(201).json({ success: true, appointment: appt });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export function cancelAppointment(req, res) {
  try {
    const { id } = req.params;
    const cancelled = appointmentService.cancelAppointment(id);
    if (!cancelled) {
      return res.status(404).json({ success: false, error: 'Appointment not found' });
    }
    return res.json({ success: true, appointment: cancelled });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
