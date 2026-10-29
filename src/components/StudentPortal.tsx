import React, { useState } from 'react';
import { SessionConfig, AttendanceReceipt, SessionItem } from '../types';
import { retroSound } from '../utils/audio';
import {
  ExternalLink,
  Copy,
  Check,
  Zap,
  Calendar,
  User,
  Hash,
  Clock,
  Lock,
} from 'lucide-react';

interface StudentPortalProps {
  session: SessionConfig | null;
  loadingSession: boolean;
  onRefreshSession: () => void;
  onOpenAdmin: () => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  session,
  loadingSession,
  onRefreshSession,
  onOpenAdmin,
}) => {
  const [name, setName] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState<string>(() => {
    return session?.sessions?.[0]?.id || 'ses-1';
  });
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);
  const [unlockedSessionTitle, setUnlockedSessionTitle] = useState<string>('');
  const [unlockedSessionTime, setUnlockedSessionTime] = useState<string>('');
  const [receipt, setReceipt] = useState<AttendanceReceipt | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const availableSessions: SessionItem[] = session?.sessions || [];
  const currentChosenSession =
    availableSessions.find((s) => s.id === selectedSessionId) || availableSessions[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    retroSound.playClick();
    setErrorMsg(null);

    const cleanName = name.trim();
    const cleanRollNo = rollNo.trim().toUpperCase();

    if (!cleanName) {
      retroSound.playError();
      setErrorMsg('Please enter your Full Name.');
      return;
    }
    if (!cleanRollNo) {
      retroSound.playError();
      setErrorMsg('Please enter your Roll Number (Format: BTECH/15XXX/2X).');
      return;
    }
    if (!currentChosenSession) {
      retroSound.playError();
      setErrorMsg('Please select a session.');
      return;
    }
    if (!currentChosenSession.active) {
      retroSound.playError();
      setErrorMsg(`[${currentChosenSession.title}] is currently locked by admin.`);
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/attend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          rollNo: cleanRollNo,
          sessionId: currentChosenSession.id,
          notes: 'Inducted Member',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit attendance.');
      }

      setMeetingUrl(data.meetingLink);
      setUnlockedSessionTitle(data.sessionTitle || currentChosenSession.title);
      setUnlockedSessionTime(data.sessionTime || currentChosenSession.time);
      setReceipt(data.receipt);
      setIsDuplicate(Boolean(data.isDuplicate));
      retroSound.playSuccess();
    } catch (err: unknown) {
      retroSound.playError();
      const message = err instanceof Error ? err.message : 'Connection failed. Please retry.';
      setErrorMsg(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!meetingUrl) return;
    navigator.clipboard.writeText(meetingUrl);
    setCopiedLink(true);
    retroSound.playClick();
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleReset = () => {
    retroSound.playClick();
    setReceipt(null);
    setMeetingUrl(null);
    setErrorMsg(null);
    setIsDuplicate(false);
    setName('');
    setRollNo('');
  };

  return (
    <div className="p-3 sm:p-5 text-black font-sans max-w-xl mx-auto">
      {/* Clean, Simple Club Header */}
      <div className="text-center pb-3 mb-3 border-b border-gray-400">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#000080] text-yellow-300 font-bold text-xs font-mono uppercase mb-1">
          <Zap className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span>CLUB OORJA // INAUGURATION 2026</span>
        </div>
        <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
          Student Attendance & Session Access
        </h1>
        <p className="text-xs text-gray-600 mt-0.5 font-sans">
          Select your session, enter your Name & Roll No to join the Google Meet.
        </p>
      </div>

      {/* Main Content: Form or Link Result */}
      {!receipt ? (
        <div className="win-box p-3 sm:p-4 bg-[#c0c0c0] shadow-sm">
          {/* Error Message */}
          {errorMsg && (
            <div className="mb-3 p-2 bg-yellow-100 border-2 border-red-600 text-red-900 text-xs font-mono flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* 1. SELECT SESSION */}
            <div>
              <label className="block font-bold text-black mb-1.5 text-xs sm:text-sm flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#000080]" />
                <span>1. SELECT YOUR SESSION:</span>
              </label>

              <div className="space-y-1.5">
                {availableSessions.map((s) => {
                  const isSelected = (selectedSessionId || availableSessions[0]?.id) === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => {
                        if (s.active) {
                          retroSound.playClick();
                          setSelectedSessionId(s.id);
                        }
                      }}
                      className={`p-2 sm:p-2.5 win-box border cursor-pointer select-none transition-all ${
                        isSelected
                          ? 'bg-[#ffffd8] border-[#000080] shadow-sm'
                          : s.active
                          ? 'bg-white hover:bg-gray-50 border-gray-400'
                          : 'bg-gray-200 border-gray-300 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="radio"
                            name="sessionOption"
                            checked={isSelected}
                            onChange={() => s.active && setSelectedSessionId(s.id)}
                            disabled={!s.active}
                            className="w-4 h-4 text-blue-900 cursor-pointer"
                          />
                          <div>
                            <strong className="block font-bold text-xs sm:text-sm text-gray-900">
                              {s.title}
                            </strong>
                            <span className="text-[11px] text-gray-600 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-blue-800 inline" /> {s.time}
                            </span>
                          </div>
                        </div>

                        {!s.active && (
                          <span className="text-[9px] font-bold text-red-700 bg-red-100 px-1.5 py-0.5 border border-red-300 uppercase shrink-0">
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. FULL NAME */}
            <div>
              <label className="block font-bold text-black mb-1 text-xs sm:text-sm flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#000080]" />
                <span>2. FULL NAME:</span>
              </label>
              <div className="win-inset p-1 bg-white">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name (e.g. Rohan Sharma)"
                  required
                  className="w-full px-2 py-2 text-sm outline-none bg-transparent font-sans"
                />
              </div>
            </div>

            {/* 3. ROLL NUMBER */}
            <div>
              <label className="block font-bold text-black mb-1 text-xs sm:text-sm flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-[#000080]" />
                  <span>3. ROLL NUMBER:</span>
                </span>
                <span className="text-[10px] font-mono text-blue-900 bg-blue-100 px-1.5 py-0.5 border border-blue-200">
                  BTECH/15XXX/2X
                </span>
              </label>
              <div className="win-inset p-1 bg-white">
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value.toUpperCase())}
                  placeholder="e.g. BTECH/15001/23"
                  required
                  className="w-full px-2 py-2 text-sm outline-none bg-transparent font-mono uppercase tracking-wider"
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="win-btn w-full py-3.5 bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 hover:from-yellow-400 hover:to-amber-500 text-black font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {submitting ? (
                  <span className="flex items-center gap-2 font-mono">
                    <span className="inline-block animate-spin">⚡</span> GENERATING MEETING LINK...
                  </span>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-black" />
                    <span>GET MEETING LINK</span>
                    <span>➔</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* RESULT VIEW: CLEAN & DIRECT */
        <div className="win-box p-3 sm:p-5 bg-white space-y-4 shadow-sm">
          {/* Status Message */}
          <div className="bg-emerald-50 border border-emerald-500 p-3 text-center space-y-1">
            <span className="inline-block text-xl">🎉</span>
            <h2 className="font-bold text-sm sm:text-base text-emerald-900">
              Attendance Verified Successfully!
            </h2>
            <p className="text-xs text-gray-700">
              {isDuplicate
                ? 'Your roll number was already registered for this session.'
                : 'Your attendance has been logged in the master sheet.'}
            </p>
          </div>

          {/* Direct Meeting Link Box */}
          <div className="win-box p-3 sm:p-4 bg-[#e8f4fd] border-2 border-blue-900 space-y-2.5">
            <div className="text-center">
              <span className="text-[10px] font-mono font-bold text-blue-900 uppercase tracking-wider block">
                MEETING SESSION UNLOCKED
              </span>
              <strong className="text-sm sm:text-base text-gray-900 block font-bold">
                {unlockedSessionTitle}
              </strong>
              {unlockedSessionTime && (
                <span className="text-xs text-gray-600 font-mono">
                  {unlockedSessionTime}
                </span>
              )}
            </div>

            {meetingUrl ? (
              <div className="space-y-2 pt-1">
                <a
                  href={meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => retroSound.playClick()}
                  className="win-btn w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 uppercase tracking-wider shadow-md active:scale-[0.98]"
                >
                  <span>🚀 JOIN GOOGLE MEET NOW</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <div className="flex items-center gap-1.5 pt-1">
                  <div className="win-inset flex-1 px-2 py-1.5 bg-white text-xs font-mono text-gray-700 truncate select-all">
                    {meetingUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="win-btn px-3 py-1.5 bg-[#c0c0c0] font-bold text-xs flex items-center gap-1 shrink-0 active:bg-gray-300"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs font-mono text-red-600 text-center">
                Meeting link has not been set by administrator.
              </p>
            )}
          </div>

          {/* Simple Induction Pass */}
          <div className="win-inset p-3 bg-[#ffffea] border border-gray-400 font-mono text-xs space-y-1.5">
            <div className="text-center border-b border-gray-300 pb-1.5 mb-1.5">
              <strong className="block text-xs font-bold text-gray-900">
                ⚡ CLUB OORJA INDUCTION PASS
              </strong>
              <span className="text-[10px] text-gray-500">Pass ID: {receipt.id}</span>
            </div>

            <div className="flex justify-between text-[11px]">
              <span className="text-gray-500">Student:</span>
              <span className="font-bold text-black uppercase">{receipt.name}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-500">Roll No:</span>
              <span className="font-bold text-blue-900">{receipt.rollNo}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-500">Session:</span>
              <span className="font-bold text-gray-800 truncate max-w-[200px]">{receipt.sessionTitle}</span>
            </div>
            <div className="flex justify-between text-[11px]">
              <span className="text-gray-500">Time:</span>
              <span className="text-black">{new Date(receipt.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Return / Reset Button */}
          <div className="text-center pt-1">
            <button
              onClick={handleReset}
              className="win-btn px-4 py-2 bg-[#c0c0c0] font-bold text-xs active:bg-gray-300"
            >
              ↩ Check In Another Student
            </button>
          </div>
        </div>
      )}

      {/* Subtle, Clean Footer */}
      <div className="text-center pt-4">
        <button
          onClick={onOpenAdmin}
          className="text-xs text-gray-500 hover:text-gray-800 underline font-mono"
        >
          Admin Control & Master Sheet ➔
        </button>
      </div>
    </div>
  );
};
