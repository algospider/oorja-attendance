# 💾 CYBER-ATTEND '99 // Student Attendance & Meeting Session Gateway

> **Modern Tech Stack (React 18, TypeScript, Tailwind CSS, Vite, Express, Web Audio API) styled with an authentic Retro Windows 95 / Web 1.0 aesthetic, featuring a full interactive master spreadsheet.**

---

## ⚡ Features

### 1. 📝 Student Attendance Portal
* **Collects Name & Roll Number**: Simple, clean retro form with validation and instant feedback.
* **Instant Meeting Link Unlock**: Once the student registers, their active meeting session link (Google Meet, Zoom, MS Teams, etc.) is presented with:
  * One-click **Copy Link**
  * Direct **🚀 Join Classroom Meeting Now** button
  * Retro **Attendance Receipt Slip** complete with unique Receipt ID, timestamp, verification hash, and barcode for their records.
* **Duplicate Detection**: Acknowledges existing roll numbers without corrupting previous records.
* **Gatekeeper Lock**: If the instructor locks/pauses attendance in the admin panel, the portal instantly prevents submissions and shows a retro notice.

### 2. 📊 Master Attendance Sheet ("CYBER-SHEET '99")
* **Interactive Spreadsheet View**: Modeled after classic Excel 97 / Google Sheets.
  * Formula bar displaying active cell coordinates and contents (`fx [ =ATTENDANCE_RECORDS(ALL) ]`).
  * Columns with headers `A: Record ID`, `B: Roll No`, `C: Student Name`, `D: Check-in Time`, `E: Status`, `F: System/Device`, `G: Notes/Remarks`, and `Actions`.
  * Clickable row/cell selection highlight.
  * **Inline Status Management**: Change status between **Present**, **Late**, **Absent**, or **Excused** right from the cell dropdown.
  * **Inline Notes**: Click and edit remarks for any student on the fly.
  * **Search & Filter**: Instant filtering by student name, roll number, or attendance status.
* **Google Sheets & Excel Integration**:
  * **📥 Download CSV**: Directly exports an RFC-compliant `.csv` file ready to open in Microsoft Excel, Apple Numbers, or import into Google Sheets.
  * **📋 Copy for Google Sheets (TSV)**: Copies clean tab-separated values to the clipboard so you can simply press `Ctrl+V` / `Cmd+V` in any Google Sheet!
  * **➕ Manual Entry**: Add rows manually for students who reported in person.
  * **🗑️ Reset Sheet**: Wipe or restart sheet with confirmation.

### 3. ⚙️ Admin Meeting Link Controller
* **Change Meeting Session Link**: Update the live meeting URL anytime (e.g. `https://meet.google.com/xyz-1234-abc`, Zoom link, etc.).
* **Session Gate Toggle**: Turn check-ins `[ONLINE / ACTIVE]` or `[LOCKED / PAUSED]`.
* **Live Broadcast Ticker**: Customize the scrolling announcement ticker shown to all students.
* **Secure Access**: Protected with an admin passcode (Default: `admin99`).

### 4. 🕹️ Retro 90s Aesthetics & Immersion
* **Windows 95/98 Window Frames**: Beveled 3D borders, gradient navy title bars, minimize/maximize/close buttons.
* **Web 1.0 Nostalgia**: Animated scrolling marquee, visitor hit counter with spinning dials, classic retro badges ("HTML 4.0", "Netscape Navigator 3.0", "Y2K Compliant").
* **CRT Scanline Overlay**: Toggleable CRT retro monitor effect in the taskbar.
* **Tactile Web Audio**: Authentic synthesized mechanical keyboard clicks, success chimes, and alert beeps (using Web Audio API, no external MP3 dependencies).
* **Retro Windows Taskbar**: Complete with a functional Start Menu, active window switcher, system tray, and live clock.

---

## 🚀 Getting Started

### Prerequisites
* Node.js (v18+)
* npm

### Running the Application

1. **Production Mode (Single Server on port 3001)**:
   ```bash
   # Build the frontend assets
   npm run build

   # Start the Express server
   npm start
   ```
   Open [http://localhost:3001](http://localhost:3001) in your browser.

2. **Development Mode (Hot Reloading)**:
   ```bash
   npm run dev
   ```
   This starts:
   * Backend API on [http://localhost:3001](http://localhost:3001)
   * Vite Dev Server on [http://localhost:5173](http://localhost:5173) with automatic proxying to `/api`

---

## 🔑 Default Credentials
* **Admin Passcode**: `admin99`
  *(You can also change this in `server/index.js` or in `data/db.json`)*

---

## 📂 Project Structure

```
├── data/                  # Persistent JSON database (auto-created)
│   └── db.json            # Stores session config & attendance records
├── server/
│   └── index.js           # Express API server, endpoints & static file server
├── src/
│   ├── components/
│   │   ├── AdminSpreadsheet.tsx # Interactive Sheet & Meeting Controller
│   │   ├── StudentPortal.tsx    # Name & Roll No Form + Meeting Link Reveal
│   │   ├── RetroBadges.tsx      # Hit counter & 90s web badges
│   │   ├── RetroTaskbar.tsx     # Win95 Taskbar, Start menu & Clock
│   │   ├── TitleBar.tsx         # Classic OS window title bar
│   │   └── AboutDialog.tsx      # Info modal
│   ├── utils/
│   │   └── audio.ts             # Web Audio API 8-bit sound synthesizer
│   ├── types.ts                 # TypeScript types
│   ├── App.tsx                  # Main desktop environment
│   ├── index.css                # Retro bevels, CRT scanlines & styling
│   └── main.tsx                 # React entrypoint
├── package.json
├── tailwind.config.js
└── vite.config.ts
```
