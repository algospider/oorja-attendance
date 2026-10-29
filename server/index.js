import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In Vercel serverless, root filesystem is read-only except /tmp
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

// OORJA Electrical Club Inauguration Seed Data
const initialDb = {
  config: {
    meetingLink: 'https://meet.google.com/oorja-inauguration-2026',
    meetingTitle: '⚡ OORJA CLUB INAUGURATION 2026 // Keynote & Live Induction Session',
    instructor: 'Club Oorja Executive Board & Faculty In-Charge',
    sessionActive: true,
    requireRollPrefix: false,
    customNotice: '⚡ HIGH VOLTAGE NOTICE: Welcome to CLUB OORJA! Enter your Name & Roll Number to claim your Official Induction Pass & join the Inauguration Session.',
    adminPassword: 'oorja@12344321',
    autoRedirectDelay: 5,
  },
  attendees: [
    {
      id: 'OORJA-001',
      name: 'Rohan Sharma',
      rollNo: '23EE101',
      timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
      status: 'Present',
      device: 'Android Mobile',
      notes: 'Power Systems Wing',
      sessionTitle: '⚡ OORJA CLUB INAUGURATION 2026'
    },
    {
      id: 'OORJA-002',
      name: 'Priya Verma',
      rollNo: '23EE142',
      timestamp: new Date(Date.now() - 3600000 * 1.2).toISOString(),
      status: 'Present',
      device: 'iPhone / Safari',
      notes: 'Robotics & Embedded Lead',
      sessionTitle: '⚡ OORJA CLUB INAUGURATION 2026'
    },
    {
      id: 'OORJA-003',
      name: 'Aarav Patel',
      rollNo: '23EE118',
      timestamp: new Date(Date.now() - 3600000 * 0.8).toISOString(),
      status: 'Present',
      device: 'MacBook Air',
      notes: 'EV & High Voltage Cell',
      sessionTitle: '⚡ OORJA CLUB INAUGURATION 2026'
    },
    {
      id: 'OORJA-004',
      name: 'Sneha Kulkarni',
      rollNo: '23EE156',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      status: 'Late',
      device: 'Windows Mobile',
      notes: 'Joined via campus cellular',
      sessionTitle: '⚡ OORJA CLUB INAUGURATION 2026'
    }
  ]
};

// In-memory memory fallback in case disk is read-only
let memoryDb = JSON.parse(JSON.stringify(initialDb));

function readDb() {
  try {
    if (!fs.existsSync(DB_FILE)) {
      try {
        fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
      } catch {
        // Ephemeral fallback
      }
      return memoryDb;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(content);
    // Keep in-memory in sync
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
    console.warn('Filesystem write notice (using memory fallback):', err.message);
  }
}

const app = express();
app.use(cors());
app.use(express.json());

// Public session endpoint
app.get('/api/session', (req, res) => {
  const db = readDb();
  res.json({
    meetingTitle: db.config.meetingTitle,
    instructor: db.config.instructor,
    sessionActive: db.config.sessionActive,
    customNotice: db.config.customNotice,
    autoRedirectDelay: db.config.autoRedirectDelay,
    totalAttendees: db.attendees.length,
    meetingLink: db.config.sessionActive ? db.config.meetingLink : null
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

// Admin get full configuration
app.get('/api/admin/config', (req, res) => {
  const auth = req.headers['authorization'];
  const db = readDb();
  if (auth !== 'Bearer oorja_auth_power_token_2026') {
    return res.status(401).json({ error: 'Unauthorized Grid Access' });
  }
  res.json(db.config);
});

// Admin update session & meeting link
app.post('/api/admin/config', (req, res) => {
  const auth = req.headers['authorization'];
  if (auth !== 'Bearer oorja_auth_power_token_2026') {
    return res.status(401).json({ error: 'Unauthorized Grid Access' });
  }
  const db = readDb();
  db.config = {
    ...db.config,
    ...req.body,
  };
  writeDb(db);
  res.json({ success: true, config: db.config });
});

// Student Check-In & Get Meeting Link
app.post('/api/attend', (req, res) => {
  const { name, rollNo, notes } = req.body;
  
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Please enter your Full Name.' });
  }
  if (!rollNo || !rollNo.trim()) {
    return res.status(400).json({ error: 'Please enter your Roll / Student ID Number.' });
  }

  const db = readDb();

  if (!db.config.sessionActive) {
    return res.status(403).json({
      error: '⚡ OORJA GRID OFFLINE: Inauguration room check-in is temporarily PAUSED by the administration.'
    });
  }

  const cleanRollNo = rollNo.trim().toUpperCase();
  const cleanName = name.trim();

  const existingIndex = db.attendees.findIndex(
    a => a.rollNo.toUpperCase() === cleanRollNo
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
      timestamp: now,
      status: 'Present',
      device,
      notes: notes || 'Club Member',
      sessionTitle: db.config.meetingTitle
    };
    db.attendees.unshift(attendeeRecord);
    writeDb(db);
  }

  return res.json({
    success: true,
    isDuplicate,
    meetingLink: db.config.meetingLink,
    meetingTitle: db.config.meetingTitle,
    instructor: db.config.instructor,
    receipt: {
      id: attendeeRecord.id,
      name: attendeeRecord.name,
      rollNo: attendeeRecord.rollNo,
      timestamp: attendeeRecord.timestamp,
      status: attendeeRecord.status,
      securityHash: `⚡-EE-${Buffer.from(`${attendeeRecord.rollNo}:${attendeeRecord.timestamp}`).toString('base64').substring(0, 8)}`
    }
  });
});

// Admin Get Attendees (The Sheet Data)
app.get('/api/attendees', (req, res) => {
  const auth = req.headers['authorization'];
  if (auth !== 'Bearer oorja_auth_power_token_2026') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const db = readDb();
  res.json({
    total: db.attendees.length,
    attendees: db.attendees,
    session: db.config
  });
});

// Admin update an attendee record in the sheet
app.patch('/api/attendees/:id', (req, res) => {
  const auth = req.headers['authorization'];
  if (auth !== 'Bearer oorja_auth_power_token_2026') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { id } = req.params;
  const db = readDb();
  const index = db.attendees.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }

  db.attendees[index] = {
    ...db.attendees[index],
    ...req.body
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
  db.attendees = db.attendees.filter(a => a.id !== id);
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

// Download CSV for Google Sheets / Excel
app.get('/api/export/csv', (req, res) => {
  const db = readDb();
  const headers = ['Record ID', 'Roll Number', 'Full Name', 'Check-in Time', 'Status', 'Device/System', 'Notes', 'Session Title'];
  const rows = db.attendees.map(a => [
    `"${a.id}"`,
    `"${a.rollNo}"`,
    `"${a.name.replace(/"/g, '""')}"`,
    `"${new Date(a.timestamp).toLocaleString()}"`,
    `"${a.status}"`,
    `"${a.device}"`,
    `"${(a.notes || '').replace(/"/g, '""')}"`,
    `"${(a.sessionTitle || db.config.meetingTitle).replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');

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

// Export for Vercel serverless handler & local runner
export default app;

if (process.env.NODE_ENV !== 'production' || !isVercel) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`⚡ OORJA Electrical Attendance Grid running at http://localhost:${PORT}`);
  });
}
