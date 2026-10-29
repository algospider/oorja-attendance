import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = process.env.VERCEL === '1' || process.env.AWS_LAMBDA_FUNCTION_NAME !== undefined;
const DATA_DIR = isVercel ? '/tmp' : path.join(__dirname, '../data');

if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.warn('Could not create data dir:', e);
  }
}

const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initial Multi-Session Seed Data
const initialDb = {
  config: {
    adminPassword: 'oorja@12344321',
    customNotice: '⚡ HIGH VOLTAGE: Welcome to CLUB OORJA! Select your Session, enter your Name & Roll No (BTECH/15XXX/2X) to claim your Induction Pass.',
    autoRedirectDelay: 5,
  },
  sessions: [
    {
      id: 'ses-1',
      title: 'Session 1: Grand Inauguration & Keynote Address',
      time: '10:00 AM - 11:30 AM',
      speaker: 'Chief Guest & Faculty Advisor',
      meetingLink: 'https://meet.google.com/oorja-session-1',
      active: true,
    },
    {
      id: 'ses-2',
      title: 'Session 2: EV Tech, Smart Grids & Robotics Lab',
      time: '01:30 PM - 03:00 PM',
      speaker: 'Technical Leads & Domain Heads',
      meetingLink: 'https://meet.google.com/oorja-session-2',
      active: true,
    },
    {
      id: 'ses-3',
      title: 'Session 3: Core Team Induction & Project Roadmaps',
      time: '04:00 PM - 05:30 PM',
      speaker: 'Club Oorja Executive Council',
      meetingLink: 'https://meet.google.com/oorja-session-3',
      active: true,
    },
  ],
  attendees: [
    {
      id: 'OORJA-001',
      name: 'Rohan Sharma',
      rollNo: 'BTECH/15001/23',
      sessionId: 'ses-1',
      sessionTitle: 'Session 1: Grand Inauguration & Keynote Address',
      timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      status: 'Present',
      device: 'Android Phone',
      notes: 'Inducted Member',
    },
    {
      id: 'OORJA-002',
      name: 'Priya Verma',
      rollNo: 'BTECH/15014/23',
      sessionId: 'ses-2',
      sessionTitle: 'Session 2: EV Tech, Smart Grids & Robotics Lab',
      timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(),
      status: 'Present',
      device: 'iPhone / iOS',
      notes: 'Inducted Member',
    },
    {
      id: 'OORJA-003',
      name: 'Aarav Patel',
      rollNo: 'BTECH/15023/24',
      sessionId: 'ses-1',
      sessionTitle: 'Session 1: Grand Inauguration & Keynote Address',
      timestamp: new Date(Date.now() - 3600000 * 0.8).toISOString(),
      status: 'Present',
      device: 'MacBook Air',
      notes: 'Inducted Member',
    },
    {
      id: 'OORJA-004',
      name: 'Sneha Kulkarni',
      rollNo: 'BTECH/15045/24',
      sessionId: 'ses-3',
      sessionTitle: 'Session 3: Core Team Induction & Project Roadmaps',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      status: 'Late',
      device: 'Mobile Browser',
      notes: 'Inducted Member',
    },
  ],
};

let memoryDb = JSON.parse(JSON.stringify(initialDb));

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      } catch {
        // Ephemeral
      }
      return memoryDb;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);

    // Migration helper: ensure sessions array exists
    if (!parsed.sessions || !Array.isArray(parsed.sessions)) {
      parsed.sessions = initialDb.sessions;
      writeDb(parsed);
    }

    memoryDb = parsed;
    return parsed;
  } catch (err) {
    console.error('Error reading DB, using memoryDb fallback:', err);
    return memoryDb;
  }
}

function writeDb(data) {
  memoryDb = data;
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Filesystem write notice:', err.message);
  }
}

const app = express();
app.use(cors());
app.use(express.json());

// Public session endpoint: returns all sessions (with meeting links if active) and config
app.get('/api/session', (req, res) => {
  const db = readDb();
  const sessions = (db.sessions || []).map((s) => ({
    id: s.id,
    title: s.title,
    time: s.time,
    speaker: s.speaker,
    active: Boolean(s.active),
    meetingLink: s.active ? s.meetingLink : null,
  }));

  res.json({
    sessions,
    customNotice: db.config.customNotice,
    totalAttendees: db.attendees.length,
  });
});

// Admin verify / login
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  const db = readDb();
  if (password === db.config.adminPassword) {
    return res.json({ success: true, token: 'oorja_auth_power_token_2026' });
  }
  return res.status(401).json({ success: false, message: 'Invalid Electrical Grid Passcode! Access Denied.' });
});

// Admin get full configuration & sessions
app.get('/api/admin/config', (req, res) => {
  const auth = req.headers['authorization'];
  const db = readDb();
  if (auth !== 'Bearer oorja_auth_power_token_2026') {
    return res.status(401).json({ error: 'Unauthorized Grid Access' });
  }
  res.json({
    config: db.config,
    sessions: db.sessions,
  });
});

// Admin update sessions list or custom notice
app.post('/api/admin/config', (req, res) => {
  const auth = req.headers['authorization'];
  if (auth !== 'Bearer oorja_auth_power_token_2026') {
    return res.status(401).json({ error: 'Unauthorized Grid Access' });
  }
  const db = readDb();
  const { customNotice, sessions } = req.body;

  if (customNotice !== undefined) {
    db.config.customNotice = customNotice;
  }
  if (Array.isArray(sessions)) {
    db.sessions = sessions;
  }

  writeDb(db);
  res.json({ success: true, config: db.config, sessions: db.sessions });
});

// Student Check-In & Get Chosen Session's Meeting Link
app.post('/api/attend', (req, res) => {
  const { name, rollNo, sessionId, notes } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Please enter your Full Name.' });
  }
  if (!rollNo || !rollNo.trim()) {
    return res.status(400).json({ error: 'Please enter your Roll Number (Format: BTECH/15XXX/2X).' });
  }

  const db = readDb();
  const cleanRollNo = rollNo.trim().toUpperCase();
  const cleanName = name.trim();

  // Find targeted session
  const targetSession = (db.sessions || []).find((s) => s.id === sessionId) || (db.sessions || [])[0];

  if (!targetSession) {
    return res.status(400).json({ error: 'No active session found.' });
  }

  if (!targetSession.active) {
    return res.status(403).json({
      error: `⚡ [${targetSession.title}] is currently LOCKED or closed by the admin. Please select another active session.`,
    });
  }

  // Check duplicate check-in for the same session
  const existingIndex = db.attendees.findIndex(
    (a) => a.rollNo.toUpperCase() === cleanRollNo && a.sessionId === targetSession.id
  );

  const userAgent = req.headers['user-agent'] || 'Electrical Terminal';
  let device = 'Desktop';
  if (/Android/i.test(userAgent)) device = 'Android Phone';
  else if (/iPhone|iPad/i.test(userAgent)) device = 'iPhone / iOS';
  else if (/Mobile/i.test(userAgent)) device = 'Mobile Browser';
  else if (/Mac/i.test(userAgent)) device = 'Mac OS';
  else if (/Win/i.test(userAgent)) device = 'Windows PC';
  else if (/Linux/i.test(userAgent)) device = 'Linux Grid';

  const recordId = `OORJA-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date().toISOString();

  let attendeeRecord;
  let isDuplicate = false;

  if (existingIndex !== -1) {
    isDuplicate = true;
    attendeeRecord = db.attendees[existingIndex];
  } else {
    attendeeRecord = {
      id: recordId,
      name: cleanName,
      rollNo: cleanRollNo,
      sessionId: targetSession.id,
      sessionTitle: targetSession.title,
      timestamp: now,
      status: 'Present',
      device,
      notes: notes || 'Inducted Member',
    };
    db.attendees.unshift(attendeeRecord);
    writeDb(db);
  }

  return res.json({
    success: true,
    isDuplicate,
    meetingLink: targetSession.meetingLink,
    sessionTitle: targetSession.title,
    sessionTime: targetSession.time,
    speaker: targetSession.speaker,
    receipt: {
      id: attendeeRecord.id,
      name: attendeeRecord.name,
      rollNo: attendeeRecord.rollNo,
      sessionTitle: attendeeRecord.sessionTitle,
      timestamp: attendeeRecord.timestamp,
      status: attendeeRecord.status,
      securityHash: `⚡-EE-${Buffer.from(`${attendeeRecord.rollNo}:${attendeeRecord.sessionId}`).toString('base64').substring(0, 8)}`,
    },
  });
});

// Admin Get Attendees (The Sheet Data) & Sessions
app.get('/api/attendees', (req, res) => {
  const auth = req.headers['authorization'];
  if (auth !== 'Bearer oorja_auth_power_token_2026') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const db = readDb();
  res.json({
    total: db.attendees.length,
    attendees: db.attendees,
    sessions: db.sessions,
    config: db.config,
  });
});

// Admin update an attendee record
app.patch('/api/attendees/:id', (req, res) => {
  const auth = req.headers['authorization'];
  if (auth !== 'Bearer oorja_auth_power_token_2026') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { id } = req.params;
  const db = readDb();
  const index = db.attendees.findIndex((a) => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }

  db.attendees[index] = {
    ...db.attendees[index],
    ...req.body,
  };
  writeDb(db);
  res.json({ success: true, attendee: db.attendees[index] });
});

// Admin delete an attendee record
app.delete('/api/attendees/:id', (req, res) => {
  const auth = req.headers['authorization'];
  if (auth !== 'Bearer oorja_auth_power_token_2026') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { id } = req.params;
  const db = readDb();
  db.attendees = db.attendees.filter((a) => a.id !== id);
  writeDb(db);
  res.json({ success: true, remaining: db.attendees.length });
});

// Admin clear all attendees / start new sheet
app.post('/api/attendees/clear', (req, res) => {
  const auth = req.headers['authorization'];
  if (auth !== 'Bearer oorja_auth_power_token_2026') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const db = readDb();
  db.attendees = [];
  writeDb(db);
  res.json({ success: true, count: 0 });
});

// Download CSV with Session details
app.get('/api/export/csv', (req, res) => {
  const db = readDb();
  const headers = ['Record ID', 'Roll Number', 'Full Name', 'Session', 'Check-in Time', 'Status', 'Device/System', 'Notes'];
  const rows = db.attendees.map((a) => [
    `"${a.id}"`,
    `"${a.rollNo}"`,
    `"${a.name.replace(/"/g, '""')}"`,
    `"${(a.sessionTitle || 'General').replace(/"/g, '""')}"`,
    `"${new Date(a.timestamp).toLocaleString()}"`,
    `"${a.status}"`,
    `"${a.device}"`,
    `"${(a.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="OORJA_attendance_sheet_${new Date().toISOString().slice(0, 10)}.csv"`);
  res.send(csvContent);
});

// Serve frontend production build if available
const DIST_DIR = path.join(__dirname, '../dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

export default app;

if (process.env.NODE_ENV !== 'production' || !isVercel) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`⚡ OORJA Electrical Attendance Grid running at http://localhost:${PORT}`);
  });
}
