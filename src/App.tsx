import React, { useState, useEffect } from 'react';
import { TitleBar } from './components/TitleBar';
import { StudentPortal } from './components/StudentPortal';
import { AdminSpreadsheet } from './components/AdminSpreadsheet';
import { RetroBadges } from './components/RetroBadges';
import { RetroTaskbar } from './components/RetroTaskbar';
import { AboutDialog } from './components/AboutDialog';
import { SessionConfig } from './types';
import { retroSound } from './utils/audio';
import { Zap, BatteryCharging, Radio } from 'lucide-react';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'student' | 'admin'>('student');
  const [session, setSession] = useState<SessionConfig | null>(null);
  const [loadingSession, setLoadingSession] = useState<boolean>(true);
  const [crtFilter, setCrtFilter] = useState<boolean>(false); // default off on mobile for crisp text
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);

  // Fetch session data
  const loadSession = async () => {
    try {
      setLoadingSession(true);
      const res = await fetch('/api/session');
      if (res.ok) {
        const data = await res.json();
        setSession(data);
      }
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setLoadingSession(false);
    }
  };

  useEffect(() => {
    loadSession();
    const timer = setInterval(loadSession, 20000);
    return () => clearInterval(timer);
  }, []);

  const handleSessionUpdated = (newConfig: SessionConfig) => {
    setSession(newConfig);
  };

  return (
    <div className="relative min-h-screen bg-oorja-circuit text-black font-sans pb-16 flex flex-col items-center">
      {/* CRT Scanline Filter Overlay */}
      {crtFilter && <div className="fixed inset-0 crt-scanlines z-30 pointer-events-none" />}

      {/* Top Retro Electrical Header - Phone Optimized */}
      <header className="w-full max-w-5xl pt-2 sm:pt-4 px-2 sm:px-4">
        <div className="flex items-center justify-between text-white font-mono text-xs pb-2 gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-pulse shrink-0" />
            <span className="font-extrabold tracking-wider uppercase font-pixel text-yellow-300 text-[11px] sm:text-xs">
              CLUB OORJA &apos;26
            </span>
            <span className="hidden sm:inline text-cyan-300 text-[10px]">
              | Electrical Engineering Society
            </span>
          </div>

          {/* Quick Mobile Mode Toggle */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                retroSound.playClick();
                setActiveView('student');
              }}
              className={`win-btn px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold transition-all active:scale-95 ${
                activeView === 'student' ? 'bg-yellow-300 text-black border-2' : 'bg-[#c0c0c0] text-black'
              }`}
            >
              ⚡ Student Pass
            </button>
            <button
              onClick={() => {
                retroSound.playClick();
                setActiveView('admin');
              }}
              className={`win-btn px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold transition-all active:scale-95 ${
                activeView === 'admin' ? 'bg-yellow-300 text-black border-2' : 'bg-[#c0c0c0] text-black'
              }`}
            >
              📊 Admin Sheet
            </button>
          </div>
        </div>
      </header>

      {/* Main Retro OS Window */}
      <main className="w-full max-w-5xl px-1.5 sm:px-4 flex-1">
        <div className="win-box w-full shadow-2xl overflow-hidden mb-4">
          {/* Active Window TitleBar */}
          <TitleBar
            title={
              activeView === 'student'
                ? '⚡ CLUB OORJA: INAUGURATION ATTENDANCE & PASS PORTAL'
                : '⚡ OORJA SUBSTATION: MASTER SHEET & MEETING GATE'
            }
            icon="⚡"
            onClose={() => {
              setActiveView(activeView === 'student' ? 'admin' : 'student');
            }}
          />

          {/* Window Body */}
          <div className="bg-[#c0c0c0] min-h-[460px]">
            {activeView === 'student' ? (
              <StudentPortal
                session={session}
                loadingSession={loadingSession}
                onRefreshSession={loadSession}
                onOpenAdmin={() => {
                  retroSound.playClick();
                  setActiveView('admin');
                }}
              />
            ) : (
              <AdminSpreadsheet
                currentSession={session}
                onSessionUpdated={handleSessionUpdated}
                onClose={() => {
                  retroSound.playClick();
                  setActiveView('student');
                }}
              />
            )}
          </div>
        </div>

        {/* Electrical Badges & Live Meter */}
        <RetroBadges />
      </main>

      {/* About Modal */}
      {aboutOpen && <AboutDialog onClose={() => setAboutOpen(false)} />}

      {/* Retro Taskbar */}
      <RetroTaskbar
        activeView={activeView}
        setActiveView={setActiveView}
        crtFilter={crtFilter}
        setCrtFilter={setCrtFilter}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        onOpenAbout={() => setAboutOpen(true)}
      />
    </div>
  );
};

export default App;
