import React, { useState, useEffect } from 'react';
import { retroSound } from '../utils/audio';
import { Volume2, VolumeX, Tv, Clock, Zap } from 'lucide-react';

interface RetroTaskbarProps {
  activeView: 'student' | 'admin';
  setActiveView: (view: 'student' | 'admin') => void;
  crtFilter: boolean;
  setCrtFilter: React.Dispatch<React.SetStateAction<boolean>>;
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  onOpenAbout: () => void;
}

export const RetroTaskbar: React.FC<RetroTaskbarProps> = ({
  activeView,
  setActiveView,
  crtFilter,
  setCrtFilter,
  soundEnabled,
  setSoundEnabled,
  onOpenAbout,
}) => {
  const [startOpen, setStartOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    retroSound.enabled = next;
    setSoundEnabled(next);
    if (next) retroSound.playClick();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-11 bg-[#c0c0c0] border-t-2 border-white shadow-[0_-2px_4px_rgba(0,0,0,0.25)] flex items-center justify-between px-1.5 z-40 select-none font-sans">
      {/* Start Button & Window Tabs */}
      <div className="flex items-center gap-1 h-full py-1 overflow-x-auto">
        {/* Start Button */}
        <div className="relative">
          <button
            onClick={() => {
              retroSound.playClick();
              setStartOpen(!startOpen);
            }}
            className={`win-btn h-9 px-2 flex items-center gap-1.5 font-bold text-xs tracking-wider active:scale-95 ${
              startOpen ? 'win-btn-active bg-[#dfdfdf]' : 'bg-[#c0c0c0]'
            }`}
          >
            <div className="flex items-center gap-0.5">
              <span className="w-2.5 h-2.5 bg-yellow-400 block shadow-sm"></span>
              <span className="w-2.5 h-2.5 bg-red-600 block shadow-sm"></span>
              <span className="w-2.5 h-2.5 bg-blue-600 block shadow-sm"></span>
              <span className="w-2.5 h-2.5 bg-green-500 block shadow-sm"></span>
            </div>
            <span className="font-extrabold text-black font-pixel text-[9px] sm:text-[10px]">Start</span>
          </button>

          {/* Start Menu Popup */}
          {startOpen && (
            <div
              className="absolute bottom-11 left-0 w-64 win-box bg-[#c0c0c0] shadow-2xl z-50 p-1 font-mono text-xs"
              onClick={() => setStartOpen(false)}
            >
              <div className="flex">
                <div className="w-8 bg-gradient-to-t from-[#000080] via-[#103070] to-[#002050] text-yellow-300 flex items-end justify-center pb-2 font-pixel text-[9px] tracking-widest writing-vertical-lr transform rotate-180 select-none">
                  OORJA &apos;26
                </div>

                <div className="flex-1 py-1 px-1 space-y-1">
                  <div className="bg-yellow-400 text-black px-2 py-0.5 text-[10px] font-bold">
                    ⚡ ELECTRICAL CLUB PORTAL
                  </div>

                  <button
                    onClick={() => {
                      setActiveView('student');
                      retroSound.playClick();
                    }}
                    className="w-full text-left px-2 py-2 hover:bg-[#000080] hover:text-white flex items-center gap-2"
                  >
                    <span>⚡</span>
                    <span>Student Pass Portal</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveView('admin');
                      retroSound.playClick();
                    }}
                    className="w-full text-left px-2 py-2 hover:bg-[#000080] hover:text-white flex items-center gap-2 font-bold"
                  >
                    <span>📊</span>
                    <span>Admin Sheet & Link</span>
                  </button>

                  <div className="border-t border-gray-400 my-1"></div>

                  <button
                    onClick={toggleSound}
                    className="w-full text-left px-2 py-1.5 hover:bg-[#000080] hover:text-white flex items-center gap-2"
                  >
                    {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-blue-800" /> : <VolumeX className="w-3.5 h-3.5" />}
                    <span>Sound: {soundEnabled ? 'ON' : 'OFF'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setCrtFilter(!crtFilter);
                      retroSound.playClick();
                    }}
                    className="w-full text-left px-2 py-1.5 hover:bg-[#000080] hover:text-white flex items-center gap-2"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>CRT Lines: {crtFilter ? 'ON' : 'OFF'}</span>
                  </button>

                  <div className="border-t border-gray-400 my-1"></div>

                  <button
                    onClick={() => {
                      onOpenAbout();
                      retroSound.playClick();
                    }}
                    className="w-full text-left px-2 py-1.5 hover:bg-[#000080] hover:text-white flex items-center gap-2"
                  >
                    <span>ℹ️</span>
                    <span>About Club Oorja</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Window Tabs in Taskbar */}
        <button
          onClick={() => {
            retroSound.playClick();
            setActiveView('student');
          }}
          className={`win-btn h-9 px-2 sm:px-3 text-xs flex items-center gap-1.5 truncate max-w-[130px] sm:max-w-[170px] active:scale-95 ${
            activeView === 'student' ? 'win-btn-active bg-[#dfdfdf] font-bold' : 'bg-[#c0c0c0]'
          }`}
        >
          <span>⚡</span>
          <span className="truncate">Student Pass</span>
        </button>

        <button
          onClick={() => {
            retroSound.playClick();
            setActiveView('admin');
          }}
          className={`win-btn h-9 px-2 sm:px-3 text-xs flex items-center gap-1.5 truncate max-w-[130px] sm:max-w-[170px] active:scale-95 ${
            activeView === 'admin' ? 'win-btn-active bg-[#dfdfdf] font-bold' : 'bg-[#c0c0c0]'
          }`}
        >
          <span>📊</span>
          <span className="truncate">Admin Sheet</span>
        </button>
      </div>

      {/* System Tray (Clock, Sound, CRT) */}
      <div className="win-inset h-9 px-2 flex items-center gap-2 text-xs font-mono bg-[#c0c0c0] border border-gray-500 shrink-0">
        <button
          onClick={toggleSound}
          title={soundEnabled ? 'Mute' : 'Unmute'}
          className="hover:text-blue-900 active:scale-90"
        >
          {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-red-700" />}
        </button>

        <button
          onClick={() => {
            setCrtFilter(!crtFilter);
            retroSound.playClick();
          }}
          title="Toggle CRT"
          className={`hover:text-blue-900 active:scale-90 ${crtFilter ? 'text-emerald-700 font-bold' : 'text-gray-500'}`}
        >
          <Tv className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-1 text-black font-bold text-[11px] sm:text-xs">
          <span>{currentTime || '12:00'}</span>
        </div>
      </div>
    </div>
  );
};
