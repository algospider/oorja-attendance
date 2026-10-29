import React, { useState, useEffect, useMemo } from 'react';
import { SessionConfig, Attendee } from '../types';
import { retroSound } from '../utils/audio';
import {
  Download,
  Copy,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Lock,
  Unlock,
  CheckCircle2,
  Table,
  Sliders,
  Zap,
  LayoutGrid,
  ListFilter,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react';

interface AdminSpreadsheetProps {
  currentSession: SessionConfig | null;
  onSessionUpdated: (config: SessionConfig) => void;
  onClose: () => void;
}

export const AdminSpreadsheet: React.FC<AdminSpreadsheetProps> = ({
  currentSession,
  onSessionUpdated,
  onClose,
}) => {
  // Auth state
  const [authed, setAuthed] = useState<boolean>(() => {
    return localStorage.getItem('oorja_admin_auth') === 'oorja_auth_power_token_2026';
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // View Mode: 'cards' (Mobile Friendly) or 'sheet' (Desktop Grid)
  const [viewMode, setViewMode] = useState<'cards' | 'grid'>('cards');
  const [activeTab, setActiveTab] = useState<'sheet' | 'session'>('sheet');

  // Sheet data
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: string; val: string } | null>({
    row: 1,
    col: 'C',
    val: 'Roll No',
  });
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  // Manual Add Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualRoll, setManualRoll] = useState('');
  const [manualWing, setManualWing] = useState('Power Systems');

  // Session Settings State
  const [sessionForm, setSessionForm] = useState({
    meetingLink: currentSession?.meetingLink || 'https://meet.google.com/oorja-inauguration-2026',
    meetingTitle: currentSession?.meetingTitle || '⚡ OORJA CLUB INAUGURATION 2026 // Keynote & Induction Session',
    instructor: currentSession?.instructor || 'Club Oorja Executive Board & Faculty Advisor',
    sessionActive: currentSession?.sessionActive ?? true,
    customNotice: currentSession?.customNotice || '⚡ HIGH VOLTAGE: Welcome to CLUB OORJA! Enter your Name & Roll Number.',
  });
  const [savingSession, setSavingSession] = useState(false);
  const [sessionSaveSuccess, setSessionSaveSuccess] = useState(false);

  // Fetch attendees
  const fetchAttendees = async () => {
    if (!authed) return;
    setLoading(true);
    try {
      const res = await fetch('/api/attendees', {
        headers: { Authorization: 'Bearer oorja_auth_power_token_2026' },
      });
      if (res.ok) {
        const data = await res.json();
        setAttendees(data.attendees || []);
      }
    } catch (err) {
      console.error('Failed to fetch attendees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed) {
      fetchAttendees();
      const interval = setInterval(fetchAttendees, 10000);
      return () => clearInterval(interval);
    }
  }, [authed]);

  useEffect(() => {
    if (currentSession) {
      setSessionForm({
        meetingLink: currentSession.meetingLink || '',
        meetingTitle: currentSession.meetingTitle,
        instructor: currentSession.instructor,
        sessionActive: currentSession.sessionActive,
        customNotice: currentSession.customNotice,
      });
    }
  }, [currentSession]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    retroSound.playClick();
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passcode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem('oorja_admin_auth', data.token);
        setAuthed(true);
        retroSound.playSuccess();
      } else {
        retroSound.playError();
        setAuthError(data.message || 'Invalid passcode!');
      }
    } catch {
      retroSound.playError();
      setAuthError('Connection failed.');
    }
  };

  const handleLogout = () => {
    retroSound.playClick();
    localStorage.removeItem('oorja_admin_auth');
    setAuthed(false);
  };

  // Update attendee inline
  const handleUpdateAttendee = async (id: string, updates: Partial<Attendee>) => {
    retroSound.playClick();
    try {
      const res = await fetch(`/api/attendees/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer oorja_auth_power_token_2026',
        },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const data = await res.json();
        setAttendees((prev) =>
          prev.map((a) => (a.id === id ? data.attendee : a))
        );
      }
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  // Delete attendee
  const handleDeleteAttendee = async (id: string, name: string) => {
    if (!window.confirm(`Delete record for ${name}?`)) return;
    retroSound.playClick();
    try {
      const res = await fetch(`/api/attendees/${id}`, {
        method: 'DELETE',
        headers: { Authorization: 'Bearer oorja_auth_power_token_2026' },
      });
      if (res.ok) {
        setAttendees((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  // Clear all
  const handleClearSheet = async () => {
    if (!window.confirm('⚠️ WARNING: This will clear the entire Oorja attendance sheet. Are you sure?')) return;
    retroSound.playClick();
    try {
      const res = await fetch('/api/attendees/clear', {
        method: 'POST',
        headers: { Authorization: 'Bearer oorja_auth_power_token_2026' },
      });
      if (res.ok) {
        setAttendees([]);
      }
    } catch (err) {
      console.error('Clear failed:', err);
    }
  };

  // Add Manual Record
  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualRoll.trim()) return;
    retroSound.playClick();
    try {
      const res = await fetch('/api/attend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: manualName.trim(),
          rollNo: manualRoll.trim(),
          notes: `Admin Manual Entry - ${manualWing}`,
        }),
      });
      if (res.ok) {
        setShowAddModal(false);
        setManualName('');
        setManualRoll('');
        fetchAttendees();
        retroSound.playSuccess();
      }
    } catch (err) {
      console.error('Manual add error:', err);
    }
  };

  // Copy as Sheet TSV
  const handleCopyTSV = () => {
    retroSound.playClick();
    const headers = ['Record ID', 'Roll Number', 'Student Name', 'Check-in Time', 'Status', 'Device/System', 'Notes'];
    const rows = filteredAttendees.map((a) => [
      a.id,
      a.rollNo,
      a.name,
      new Date(a.timestamp).toLocaleString(),
      a.status,
      a.device,
      a.notes || '',
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map((r) => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvContent);

    setCopyStatus('Copied! Open Google Sheets & press Ctrl+V / Cmd+V');
    setTimeout(() => setCopyStatus(null), 3500);
  };

  // Save Session Configuration
  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    retroSound.playClick();
    setSavingSession(true);
    setSessionSaveSuccess(false);

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer oorja_auth_power_token_2026',
        },
        body: JSON.stringify(sessionForm),
      });

      if (res.ok) {
        const data = await res.json();
        onSessionUpdated(data.config);
        setSessionSaveSuccess(true);
        retroSound.playSuccess();
        setTimeout(() => setSessionSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save session error:', err);
      retroSound.playError();
    } finally {
      setSavingSession(false);
    }
  };

  // Filter attendees
  const filteredAttendees = useMemo(() => {
    return attendees.filter((a) => {
      const matchesSearch =
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.rollNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [attendees, searchQuery, statusFilter]);

  // If not authenticated, render login prompt
  if (!authed) {
    return (
      <div className="p-3 sm:p-6 max-w-md mx-auto my-4 sm:my-8">
        <div className="win-box p-4 bg-[#c0c0c0] shadow-2xl">
          <div className="bg-[#000080] text-white px-2.5 py-1.5 font-bold text-xs flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>OORJA SUBSTATION ADMIN AUTH</span>
            </span>
            <span className="font-mono text-[10px] text-yellow-300">440V</span>
          </div>

          <p className="text-xs font-mono text-gray-800 mb-3">
            Enter the authorized Administrator Passcode to manage the <strong>Oorja Inauguration Master Sheet</strong> and live meeting link.
          </p>

          {authError && (
            <div className="mb-3 p-2 bg-red-100 border-2 border-red-600 text-red-900 text-xs font-mono">
              ⚠️ {authError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-3 font-mono text-xs">
            <div>
              <label className="block font-bold text-black mb-1">GRID ADMIN PASSCODE:</label>
              <div className="win-inset p-1 bg-white">
                <input
                  type="password"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Enter admin passcode"
                  autoFocus
                  required
                  className="w-full px-2 py-2 outline-none text-sm font-mono tracking-wider"
                />
              </div>
              <p className="text-[10px] text-gray-600 mt-1">
                Security key: <code>oorja@12344321</code>
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onClose}
                className="win-btn px-3 py-2 text-xs bg-[#c0c0c0] active:bg-gray-300"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="win-btn px-4 py-2 text-xs bg-[#c0c0c0] font-bold text-[#000080] hover:bg-yellow-100 flex items-center gap-1 active:bg-gray-300"
              >
                <span>⚡</span> Unlock Control Panel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 text-black font-sans">
      {/* Top Navigation Tabs - Phone Touch Friendly */}
      <div className="flex items-center justify-between border-b-2 border-gray-400 pb-2 mb-3 gap-1">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <button
            onClick={() => {
              retroSound.playClick();
              setActiveTab('sheet');
            }}
            className={`win-btn px-2.5 sm:px-3 py-2 text-xs font-bold flex items-center gap-1.5 shrink-0 ${
              activeTab === 'sheet' ? 'win-btn-active bg-[#dfdfdf]' : 'bg-[#c0c0c0]'
            }`}
          >
            <Table className="w-3.5 h-3.5 text-blue-900" />
            <span>ATTENDANCE SHEET ({attendees.length})</span>
          </button>

          <button
            onClick={() => {
              retroSound.playClick();
              setActiveTab('session');
            }}
            className={`win-btn px-2.5 sm:px-3 py-2 text-xs font-bold flex items-center gap-1.5 shrink-0 ${
              activeTab === 'session' ? 'win-btn-active bg-[#dfdfdf]' : 'bg-[#c0c0c0]'
            }`}
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-900" />
            <span>SESSION & MEETING LINK</span>
          </button>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={fetchAttendees}
            disabled={loading}
            className="win-btn px-2.5 py-1.5 text-xs bg-[#c0c0c0] flex items-center gap-1"
            title="Refresh Sheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>

          <button
            onClick={handleLogout}
            className="win-btn px-2 py-1.5 text-xs bg-[#c0c0c0] text-red-800 font-bold"
            title="Lock"
          >
            Lock [X]
          </button>
        </div>
      </div>

      {/* ================= TAB 1: SPREADSHEET & CARDS VIEW ================= */}
      {activeTab === 'sheet' && (
        <div className="space-y-2.5">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs font-mono">
            <div className="win-box p-2 bg-white flex flex-col">
              <span className="text-[9px] text-gray-500 uppercase">TOTAL INDUCTED:</span>
              <span className="text-base sm:text-lg font-bold text-blue-950 font-pixel">{attendees.length}</span>
            </div>
            <div className="win-box p-2 bg-emerald-50 flex flex-col">
              <span className="text-[9px] text-emerald-800 uppercase">PRESENT:</span>
              <span className="text-base sm:text-lg font-bold text-emerald-700 font-pixel">
                {attendees.filter((a) => a.status === 'Present').length}
              </span>
            </div>
            <div className="win-box p-2 bg-amber-50 flex flex-col">
              <span className="text-[9px] text-amber-800 uppercase">LATE:</span>
              <span className="text-base sm:text-lg font-bold text-amber-700 font-pixel">
                {attendees.filter((a) => a.status === 'Late').length}
              </span>
            </div>
            <div className="win-box p-2 bg-blue-50 flex flex-col">
              <span className="text-[9px] text-blue-800 uppercase">GRID STATUS:</span>
              <span className="text-[10px] font-bold text-blue-900 truncate mt-1">
                {sessionForm.sessionActive ? '● LIVE (OPEN)' : '○ LOCKED'}
              </span>
            </div>
          </div>

          {/* Search, Mobile View Switcher, and Export Bar */}
          <div className="win-box p-2 bg-[#d8d8d8] flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
            {/* Search and Filters */}
            <div className="flex items-center gap-1.5 flex-1 min-w-[200px]">
              <div className="win-inset px-2 py-1 bg-white flex items-center gap-1.5 flex-1">
                <Search className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Roll No / Name..."
                  className="w-full text-xs outline-none bg-transparent font-sans"
                />
              </div>

              {/* Mobile View Toggle: Cards vs Grid */}
              <div className="flex items-center win-inset bg-white p-0.5">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-2 py-1 text-[10px] font-bold ${viewMode === 'cards' ? 'bg-[#000080] text-white' : 'text-gray-700'}`}
                  title="Mobile Card View"
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2 py-1 text-[10px] font-bold ${viewMode === 'grid' ? 'bg-[#000080] text-white' : 'text-gray-700'}`}
                  title="Desktop Spreadsheet Grid"
                >
                  Sheet
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-1 flex-wrap">
              <a
                href="/api/export/csv"
                download
                onClick={() => retroSound.playClick()}
                className="win-btn px-2.5 py-1.5 bg-[#c0c0c0] font-bold text-[11px] flex items-center gap-1 text-emerald-950 active:bg-gray-300"
              >
                <Download className="w-3.5 h-3.5 text-emerald-800" />
                <span>CSV</span>
              </a>

              <button
                onClick={handleCopyTSV}
                className="win-btn px-2.5 py-1.5 bg-[#c0c0c0] font-bold text-[11px] flex items-center gap-1 active:bg-gray-300"
                title="Copy for Google Sheets"
              >
                <Copy className="w-3.5 h-3.5 text-blue-800" />
                <span>Copy for Sheets</span>
              </button>

              <button
                onClick={() => {
                  retroSound.playClick();
                  setShowAddModal(true);
                }}
                className="win-btn px-2.5 py-1.5 bg-[#c0c0c0] font-bold text-[11px] flex items-center gap-1 active:bg-gray-300"
              >
                <Plus className="w-3.5 h-3.5 text-black" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Toast Notification */}
          {copyStatus && (
            <div className="p-2 bg-blue-100 border-2 border-blue-600 text-blue-900 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
              <span>{copyStatus}</span>
            </div>
          )}

          {/* ================= VIEW 1: MOBILE CARD LIST ================= */}
          {viewMode === 'cards' && (
            <div className="space-y-2">
              {filteredAttendees.length === 0 ? (
                <div className="win-inset p-6 bg-white text-center text-gray-500 font-mono text-xs">
                  No attendees matching filter. Entries submitted via the student portal appear here in real-time.
                </div>
              ) : (
                filteredAttendees.map((att) => (
                  <div
                    key={att.id}
                    className="win-box p-2.5 bg-white border border-gray-400 space-y-1.5 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#000080] text-sm tracking-wide">
                          {att.rollNo}
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">({att.id})</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <select
                          value={att.status}
                          onChange={(e) =>
                            handleUpdateAttendee(att.id, {
                              status: e.target.value as 'Present' | 'Late' | 'Absent' | 'Excused',
                            })
                          }
                          className={`px-1.5 py-0.5 text-[10px] font-bold border rounded-none cursor-pointer outline-none uppercase ${
                            att.status === 'Present'
                              ? 'bg-green-100 text-green-800 border-green-500'
                              : att.status === 'Late'
                              ? 'bg-amber-100 text-amber-800 border-amber-500'
                              : 'bg-red-100 text-red-800 border-red-500'
                          }`}
                        >
                          <option value="Present">Present</option>
                          <option value="Late">Late</option>
                          <option value="Absent">Absent</option>
                          <option value="Excused">Excused</option>
                        </select>

                        <button
                          onClick={() => handleDeleteAttendee(att.id, att.name)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-gray-900 font-sans font-medium text-xs">
                      <span>{att.name}</span>
                      <span className="text-[10px] text-gray-500 font-mono">
                        {new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    {/* Notes & Device */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-gray-200 text-[10px] text-gray-600">
                      <input
                        type="text"
                        defaultValue={att.notes || ''}
                        onBlur={(e) => {
                          if (e.target.value !== att.notes) {
                            handleUpdateAttendee(att.id, { notes: e.target.value });
                          }
                        }}
                        placeholder="Add remark..."
                        className="flex-1 bg-yellow-50/50 px-1 py-0.5 border border-gray-300 rounded-none outline-none focus:bg-white"
                      />
                      <span className="truncate max-w-[100px] shrink-0 text-gray-400">
                        {att.device}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ================= VIEW 2: FULL SPREADSHEET GRID ================= */}
          {viewMode === 'grid' && (
            <div className="win-inset bg-white overflow-x-auto max-h-[460px] border-2 border-gray-600 shadow-inner">
              <table className="w-full border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-[#e4e4e4] text-gray-800 border-b border-gray-400 select-none sticky top-0 z-10">
                    <th className="w-7 border-r border-b border-gray-400 p-1 text-center font-normal text-gray-600 bg-[#dfdfdf]">#</th>
                    <th className="border-r border-b border-gray-400 px-2 py-1 text-left font-bold text-[#000080] bg-[#dfdfdf]">ROLL NO</th>
                    <th className="border-r border-b border-gray-400 px-2 py-1 text-left font-bold text-gray-900 bg-[#dfdfdf]">STUDENT NAME</th>
                    <th className="border-r border-b border-gray-400 px-2 py-1 text-left font-bold text-gray-700 bg-[#dfdfdf]">TIME</th>
                    <th className="border-r border-b border-gray-400 px-2 py-1 text-center font-bold text-gray-700 bg-[#dfdfdf]">STATUS</th>
                    <th className="border-r border-b border-gray-400 px-2 py-1 text-left font-bold text-gray-700 bg-[#dfdfdf]">REMARKS / WING</th>
                    <th className="border-b border-gray-400 px-2 py-1 text-center font-bold text-gray-700 bg-[#dfdfdf]">DEL</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendees.map((att, idx) => (
                    <tr key={att.id} className="border-b border-gray-200 hover:bg-yellow-50">
                      <td className="border-r border-gray-300 p-1 text-center text-gray-500 bg-[#f4f4f4] text-[11px]">{idx + 1}</td>
                      <td className="border-r border-gray-300 px-2 py-1 font-bold text-[#000080]">{att.rollNo}</td>
                      <td className="border-r border-gray-300 px-2 py-1 font-sans">{att.name}</td>
                      <td className="border-r border-gray-300 px-2 py-1 text-gray-600 text-[11px] whitespace-nowrap">
                        {new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="border-r border-gray-300 px-1 py-1 text-center">
                        <select
                          value={att.status}
                          onChange={(e) =>
                            handleUpdateAttendee(att.id, {
                              status: e.target.value as 'Present' | 'Late' | 'Absent' | 'Excused',
                            })
                          }
                          className="text-[10px] font-bold border rounded-none p-0.5 outline-none cursor-pointer"
                        >
                          <option value="Present">Present</option>
                          <option value="Late">Late</option>
                          <option value="Absent">Absent</option>
                        </select>
                      </td>
                      <td className="border-r border-gray-300 px-2 py-1 text-[11px]">
                        <input
                          type="text"
                          defaultValue={att.notes || ''}
                          onBlur={(e) => {
                            if (e.target.value !== att.notes) {
                              handleUpdateAttendee(att.id, { notes: e.target.value });
                            }
                          }}
                          className="w-full bg-transparent outline-none focus:bg-white"
                        />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <button
                          onClick={() => handleDeleteAttendee(att.id, att.name)}
                          className="text-red-600 hover:text-red-900 p-0.5"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex justify-between items-center text-[10px] text-gray-600 pt-1">
            <span>Showing {filteredAttendees.length} records</span>
            <button onClick={handleClearSheet} className="text-red-700 underline font-mono">
              Reset Entire Sheet
            </button>
          </div>
        </div>
      )}

      {/* ================= TAB 2: SESSION & MEETING LINK CONFIG ================= */}
      {activeTab === 'session' && (
        <div className="max-w-xl mx-auto win-box p-3 sm:p-4 bg-[#c0c0c0]">
          <div className="bg-[#000080] text-white px-2.5 py-1.5 font-bold text-xs flex items-center justify-between mb-3">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>OORJA SESSION & MEETING GATE CONTROLLER</span>
            </span>
          </div>

          {sessionSaveSuccess && (
            <div className="mb-3 p-2 bg-emerald-100 border-2 border-emerald-600 text-emerald-900 text-xs font-mono flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Grid updated! Live meeting link & notice are instantly active.</span>
            </div>
          )}

          <form onSubmit={handleSaveSession} className="space-y-3 font-mono text-xs">
            {/* Gate switch */}
            <div className="win-box p-2.5 bg-white flex items-center justify-between gap-2">
              <div>
                <strong className="block text-black text-xs sm:text-sm uppercase">Attendance Grid Gate</strong>
                <p className="text-[10px] text-gray-600">
                  Toggle to open or lock attendance submission.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  retroSound.playClick();
                  setSessionForm((prev) => ({ ...prev, sessionActive: !prev.sessionActive }));
                }}
                className={`win-btn px-3 py-2 font-bold text-xs flex items-center gap-1.5 shrink-0 ${
                  sessionForm.sessionActive ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                }`}
              >
                {sessionForm.sessionActive ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{sessionForm.sessionActive ? 'GATE: ACTIVE' : 'GATE: LOCKED'}</span>
              </button>
            </div>

            {/* Meeting URL */}
            <div>
              <label className="block font-bold text-black mb-1">
                ⚡ INAUGURATION MEETING LINK (GOOGLE MEET / ZOOM): <span className="text-red-600">*</span>
              </label>
              <div className="win-inset p-1.5 bg-white">
                <input
                  type="url"
                  value={sessionForm.meetingLink}
                  onChange={(e) => setSessionForm({ ...sessionForm, meetingLink: e.target.value })}
                  placeholder="https://meet.google.com/oorja-inauguration-2026"
                  required
                  className="w-full px-1.5 py-1 text-xs sm:text-sm font-mono outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Event Title */}
            <div>
              <label className="block font-bold text-black mb-1">
                INAUGURATION SESSION TITLE:
              </label>
              <div className="win-inset p-1.5 bg-white">
                <input
                  type="text"
                  value={sessionForm.meetingTitle}
                  onChange={(e) => setSessionForm({ ...sessionForm, meetingTitle: e.target.value })}
                  className="w-full px-1.5 py-1 text-xs font-sans outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Host Name */}
            <div>
              <label className="block font-bold text-black mb-1">
                HOST / FACULTY ADVISOR:
              </label>
              <div className="win-inset p-1.5 bg-white">
                <input
                  type="text"
                  value={sessionForm.instructor}
                  onChange={(e) => setSessionForm({ ...sessionForm, instructor: e.target.value })}
                  className="w-full px-1.5 py-1 text-xs font-sans outline-none bg-transparent"
                />
              </div>
            </div>

            {/* Scrolling Notice */}
            <div>
              <label className="block font-bold text-black mb-1">
                TICKER BROADCAST MESSAGE:
              </label>
              <div className="win-inset p-1.5 bg-white">
                <textarea
                  rows={2}
                  value={sessionForm.customNotice}
                  onChange={(e) => setSessionForm({ ...sessionForm, customNotice: e.target.value })}
                  className="w-full px-1.5 py-1 text-xs font-mono outline-none bg-transparent"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={savingSession}
                className="win-btn w-full py-3 bg-[#c0c0c0] font-bold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 hover:bg-yellow-100 active:scale-[0.98]"
              >
                <span>💾</span>
                <span>{savingSession ? 'ENERGIZING CHANGES...' : 'SAVE & APPLY TO GRID'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Manual Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3">
          <div className="win-box w-full max-w-sm p-4 bg-[#c0c0c0] shadow-2xl">
            <div className="bg-[#000080] text-white px-2 py-1 font-bold text-xs flex items-center justify-between mb-3">
              <span>MANUAL INDUCTION ENTRY</span>
              <button onClick={() => setShowAddModal(false)} className="text-white hover:text-red-300 font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block font-bold text-black mb-1">FULL NAME:</label>
                <div className="win-inset p-1 bg-white">
                  <input
                    type="text"
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    required
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-2 py-1 text-xs outline-none bg-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-black mb-1">ROLL NUMBER:</label>
                <div className="win-inset p-1 bg-white">
                  <input
                    type="text"
                    value={manualRoll}
                    onChange={(e) => setManualRoll(e.target.value)}
                    required
                    placeholder="e.g. 23EE199"
                    className="w-full px-2 py-1 text-xs uppercase outline-none bg-transparent"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="win-btn px-3 py-1 bg-[#c0c0c0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="win-btn px-4 py-1 bg-[#c0c0c0] font-bold text-blue-900"
                >
                  Insert Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
