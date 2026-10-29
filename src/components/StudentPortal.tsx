import React, { useState } from 'react';
import { SessionConfig, AttendanceReceipt } from '../types';
import { retroSound } from '../utils/audio';
import {
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Activity,
  Flame,
  Radio,
  User,
  Hash,
  Share2
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
  const [wing, setWing] = useState('Power Systems');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [meetingUrl, setMeetingUrl] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<AttendanceReceipt | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    retroSound.playClick();
    setErrorMsg(null);

    if (!name.trim()) {
      retroSound.playError();
      setErrorMsg('Error: Student Name cannot be empty.');
      return;
    }
    if (!rollNo.trim()) {
      retroSound.playError();
      setErrorMsg('Error: Roll Number / Student ID is required.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/attend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          rollNo: rollNo.trim(),
          notes: `${wing}${notes ? ` - ${notes}` : ''}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit attendance.');
      }

      setMeetingUrl(data.meetingLink);
      setReceipt(data.receipt);
      setIsDuplicate(Boolean(data.isDuplicate));
      retroSound.playSuccess();
    } catch (err: unknown) {
      retroSound.playError();
      const message = err instanceof Error ? err.message : 'Connection error to Oorja Power Substation.';
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
    setNotes('');
  };

  return (
    <div className="p-2 sm:p-4 text-black">
      {/* High Voltage Danger Hazard Ribbon */}
      <div className="h-2 w-full hazard-tape mb-2 rounded-none"></div>

      {/* Retro Electrical Club Header */}
      <div className="win-box p-3 mb-3 bg-[#ffffeb] border border-yellow-600 shadow-sm">
        <div className="flex items-center gap-2.5 pb-2 mb-2 border-b border-black/30">
          <div className="w-10 h-10 bg-black flex items-center justify-center shrink-0 border border-yellow-400">
            <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400 animate-pulse" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="bg-red-600 text-white font-mono text-[9px] font-bold px-1.5 py-0.2 tracking-wider">
                ⚡ 440V HIGH VOLTAGE
              </span>
              <span className="bg-blue-900 text-yellow-300 font-mono text-[9px] font-bold px-1.5 py-0.2">
                EST. 2026
              </span>
            </div>

            <h1 className="font-extrabold text-xs sm:text-base tracking-wide uppercase font-pixel text-[#000080] truncate mt-0.5">
              CLUB OORJA // INAUGURATION 2026
            </h1>
            <p className="text-[11px] text-gray-700 font-mono truncate">
              {session?.meetingTitle || '⚡ Electrical Engineering Society Grand Inaugural Session'}
            </p>
          </div>
        </div>

        {/* Live Grid Metrics - Mobile Grid */}
        <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[10px] sm:text-xs mb-2">
          <div className="win-inset py-1 px-1 bg-black text-yellow-400 font-bold">
            <span className="text-[9px] text-gray-400 block">VOLTAGE</span>
            <span>230V AC</span>
          </div>
          <div className="win-inset py-1 px-1 bg-black text-cyan-400 font-bold">
            <span className="text-[9px] text-gray-400 block">FREQUENCY</span>
            <span>50.0 Hz</span>
          </div>
          <div className="win-inset py-1 px-1 bg-black text-emerald-400 font-bold">
            <span className="text-[9px] text-gray-400 block">ATTENDEES</span>
            <span>{session?.totalAttendees ?? 0} INDUCTED</span>
          </div>
        </div>

        {/* Retro Scrolling Bulletin Ticker */}
        <div className="marquee-container bg-black text-yellow-300 font-mono text-xs py-1 px-2 border border-yellow-500">
          <div className="marquee-content font-bold flex items-center gap-2">
            <span>⚡ INAUGURATION NOTICE:</span>
            <span>{session?.customNotice || 'Welcome to Club Oorja! Register with your Name & Roll Number to join the live session.'}</span>
            <span>★ HOST: {session?.instructor || 'Club Oorja Executive Board'} ★</span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      {!receipt ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Left Column: Mobile-First Form */}
          <div className="lg:col-span-2 win-box p-3 bg-[#c0c0c0]">
            <div className="border-b-2 border-white pb-1.5 mb-3 flex items-center justify-between">
              <h2 className="font-bold text-xs sm:text-sm text-[#000080] flex items-center gap-1.5 uppercase font-mono">
                <Radio className="w-4 h-4 text-red-600 animate-ping" />
                <span>INDUCTION ATTENDANCE ENTRY</span>
              </h2>
              <span className="text-[10px] font-mono bg-yellow-200 text-black px-1.5 py-0.5 border border-black font-bold">
                GRID #2026
              </span>
            </div>

            {/* Inactive Session Warning */}
            {session && !session.sessionActive && (
              <div className="mb-3 p-2.5 bg-red-100 border-2 border-red-700 text-red-900 text-xs font-mono flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold uppercase">⚡ GRID SWITCH OPEN: Check-ins Paused</strong>
                  The Oorja Administration has momentarily paused entry. Please stand by or refresh.
                  <button
                    onClick={onRefreshSession}
                    className="mt-2 win-btn px-2.5 py-1 text-xs bg-white text-black block active:bg-gray-200"
                  >
                    🔄 Re-check Grid Status
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="mb-3 p-2 bg-yellow-100 border-2 border-red-600 text-red-900 text-xs font-mono flex items-center gap-2">
                <span className="text-base">⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
              {/* Name Field */}
              <div>
                <label className="block font-bold text-black mb-1 flex items-center gap-1 text-xs sm:text-sm">
                  <User className="w-3.5 h-3.5 text-blue-900" />
                  STUDENT FULL NAME: <span className="text-red-600">*</span>
                </label>
                <div className="win-inset p-1 bg-white">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rohan Sharma"
                    required
                    disabled={session ? !session.sessionActive : false}
                    className="w-full px-2 py-2 text-sm font-sans outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Roll No Field */}
              <div>
                <label className="block font-bold text-black mb-1 flex items-center gap-1 text-xs sm:text-sm">
                  <Hash className="w-3.5 h-3.5 text-blue-900" />
                  ROLL NUMBER / STUDENT ID: <span className="text-red-600">*</span>
                </label>
                <div className="win-inset p-1 bg-white">
                  <input
                    type="text"
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    placeholder="e.g. 23EE101 or CS-2024-042"
                    required
                    disabled={session ? !session.sessionActive : false}
                    className="w-full px-2 py-2 text-sm font-mono uppercase tracking-wider outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Wing / Domain Selector */}
              <div>
                <label className="block font-bold text-black mb-1 text-xs">
                  ⚡ DOMAIN / SPECIALIZATION:
                </label>
                <div className="win-inset p-1 bg-white">
                  <select
                    value={wing}
                    onChange={(e) => setWing(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs font-mono outline-none bg-transparent cursor-pointer"
                  >
                    <option value="Power Systems & Grid">Power Systems & Smart Grid</option>
                    <option value="EV & Energy Storage">Electric Vehicles & Battery Tech</option>
                    <option value="Robotics & Embedded Systems">Robotics & Embedded Systems</option>
                    <option value="Renewable & Solar Energy">Renewable & Solar Energy</option>
                    <option value="VLSI & Microelectronics">VLSI & Microelectronics</option>
                    <option value="General Electrical / Other">General Electrical & Allied Branches</option>
                  </select>
                </div>
              </div>

              {/* Submit Button - Phone Touch Optimized */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting || (session ? !session.sessionActive : false)}
                  className="win-btn w-full py-3.5 bg-gradient-to-r from-yellow-300 via-amber-300 to-yellow-400 hover:from-yellow-400 hover:to-amber-500 text-black font-extrabold text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.98] disabled:opacity-50"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2 font-mono">
                      <span className="inline-block animate-spin">⚡</span> ENERGIZING INDUCTION PASS...
                    </span>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-black fill-black" />
                      <span>SUBMIT & UNLOCK INAUGURATION LINK</span>
                      <span className="text-black font-bold">➔</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Electrical Info & Quick Switch */}
          <div className="win-box p-3 bg-[#e8e8e8] flex flex-col justify-between text-xs font-mono">
            <div>
              <div className="bg-[#000080] text-white px-2 py-1 font-bold text-xs mb-2 flex items-center justify-between">
                <span>SUBSTATION FEED</span>
                <span className={`px-1.5 py-0.2 text-[9px] uppercase ${session?.sessionActive ? 'bg-green-500 text-black font-bold' : 'bg-red-500 text-white'}`}>
                  {session?.sessionActive ? '● ENERGIZED' : '○ DE-ENERGIZED'}
                </span>
              </div>

              <div className="win-inset p-2.5 bg-white text-gray-800 space-y-2 text-[11px] leading-relaxed">
                <p className="font-bold text-black border-b pb-1 flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-blue-800" />
                  INSTRUCTIONS FOR ATTENDEES:
                </p>
                <ul className="space-y-1 text-gray-700 list-disc list-inside">
                  <li>Ensure your Roll Number is correct for official certificates.</li>
                  <li>Clicking submit immediately creates your <strong>Oorja Induction Pass</strong>.</li>
                  <li>Use the Google Meet link unlocked on the next screen to join the live address.</li>
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-400 mt-3 text-center">
              <button
                onClick={onOpenAdmin}
                className="win-btn px-3 py-2 text-xs bg-[#c0c0c0] font-sans font-bold flex items-center justify-center gap-1.5 w-full hover:bg-yellow-100"
              >
                <span>🔑</span> Switch to Admin Panel & Sheet
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* SUCCESS / INAUGURATION LINK & OORJA POWER PASS */
        <div className="win-box p-3 sm:p-5 bg-[#fffffa]">
          {/* Success Banner */}
          <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-800 text-white p-3 mb-4 shadow flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-bounce">⚡</span>
              <div>
                <h2 className="font-bold text-xs sm:text-sm tracking-wide font-pixel text-yellow-300">
                  INDUCTION PASS ENERGIZED!
                </h2>
                <p className="text-[11px] font-mono text-emerald-200">
                  {isDuplicate
                    ? 'Roll number was already registered! Induction re-verified.'
                    : 'Logged to Master Inauguration Attendance Sheet.'}
                </p>
              </div>
            </div>
            <span className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 font-mono uppercase border border-black shrink-0">
              VERIFIED
            </span>
          </div>

          {/* Large Phone-First Meeting Link Action Card */}
          <div className="win-box p-3 sm:p-4 bg-[#e8f4fd] border-2 border-blue-900 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-blue-900 fill-blue-900" />
              <h3 className="font-bold text-xs sm:text-sm text-blue-950 uppercase font-sans">
                LIVE INAUGURATION MEETING LINK
              </h3>
            </div>

            {meetingUrl ? (
              <div className="space-y-2.5">
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <div className="win-inset flex-1 p-2 bg-white font-mono text-xs sm:text-sm text-blue-900 break-all select-all flex items-center">
                    {meetingUrl}
                  </div>
                  <button
                    onClick={handleCopyLink}
                    className="win-btn py-2.5 px-3 bg-[#c0c0c0] font-bold text-xs flex items-center justify-center gap-1.5 shrink-0 active:bg-gray-300"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-green-700" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? 'COPIED!' : 'COPY LINK'}</span>
                  </button>
                </div>

                <div className="pt-1">
                  <a
                    href={meetingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => retroSound.playClick()}
                    className="win-btn w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 uppercase tracking-wider shadow-lg active:scale-[0.98]"
                  >
                    <span>🚀 JOIN INAUGURATION (GOOGLE MEET)</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ) : (
              <p className="text-xs font-mono text-red-600">
                Meeting link has not been set by administrator.
              </p>
            )}
          </div>

          {/* Phone-Optimized Oorja Induction Pass */}
          <div className="max-w-md mx-auto win-inset p-3 sm:p-4 bg-[#ffffea] border-2 border-dashed border-yellow-700 font-mono text-xs shadow-md">
            {/* Ticket Header */}
            <div className="text-center border-b border-gray-400 pb-2 mb-2">
              <div className="flex items-center justify-center gap-1 text-black font-extrabold text-xs sm:text-sm tracking-wider">
                <span>⚡</span>
                <span>CLUB OORJA // INDUCTION PASS</span>
                <span>⚡</span>
              </div>
              <p className="text-[9px] text-gray-600">ELECTRICAL ENGINEERING SOCIETY // INAUGURAL SESSION</p>
            </div>

            {/* Ticket Details */}
            <div className="space-y-1.5 text-gray-800 text-[11px]">
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-gray-500">PASS ID:</span>
                <span className="font-bold text-black">{receipt.id}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-gray-500">STUDENT NAME:</span>
                <span className="font-bold text-black uppercase">{receipt.name}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-gray-500">ROLL NUMBER:</span>
                <span className="font-bold text-blue-900">{receipt.rollNo}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-1">
                <span className="text-gray-500">TIME OF INDUCTION:</span>
                <span className="text-black">{new Date(receipt.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">SECURITY HASH:</span>
                <span className="font-mono text-emerald-800 font-bold">{receipt.securityHash}</span>
              </div>
            </div>

            {/* Retro Barcode effect */}
            <div className="mt-3 pt-2 border-t border-gray-400 text-center">
              <div className="font-mono tracking-widest text-sm text-black font-bold select-none h-6 flex justify-center items-center">
                ||| | |||| | ||||| || | ||| |||| | ||| | ||||
              </div>
              <p className="text-[9px] text-gray-500">OFFICIAL DIGITAL ACCESS TOKEN</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-2">
            <button
              onClick={handleReset}
              className="win-btn w-full sm:w-auto px-4 py-2.5 bg-[#c0c0c0] font-sans font-bold text-xs flex items-center justify-center gap-1.5 active:bg-gray-300"
            >
              <span>↩</span> Check In Another Member
            </button>
            <button
              onClick={() => window.print()}
              className="win-btn w-full sm:w-auto px-4 py-2.5 bg-[#c0c0c0] font-sans font-bold text-xs flex items-center justify-center gap-1.5 active:bg-gray-300"
            >
              <span>🖨️</span> Save / Print Pass
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
