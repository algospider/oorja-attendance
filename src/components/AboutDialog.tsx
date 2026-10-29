import React from 'react';
import { TitleBar } from './TitleBar';
import { retroSound } from '../utils/audio';

interface AboutDialogProps {
  onClose: () => void;
}

export const AboutDialog: React.FC<AboutDialogProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-3">
      <div className="win-box w-full max-w-sm sm:max-w-md bg-[#c0c0c0] shadow-2xl">
        <TitleBar title="About CLUB OORJA '26" icon="⚡" onClose={onClose} />

        <div className="p-3 sm:p-4 space-y-3 font-mono text-xs text-black">
          <div className="flex items-center gap-3 border-b border-gray-400 pb-2.5">
            <div className="w-12 h-12 bg-black flex items-center justify-center text-yellow-400 text-2xl font-bold border-2 border-yellow-400 shrink-0">
              ⚡
            </div>
            <div>
              <h2 className="font-extrabold text-sm text-[#000080]">CLUB OORJA // EST. 2026</h2>
              <p className="text-[11px] text-gray-700">The Electrical Engineering Society</p>
            </div>
          </div>

          <div className="win-inset p-2.5 bg-white space-y-2 text-[11px] leading-relaxed">
            <p>
              <strong>⚡ Occasion:</strong> Grand Inauguration Ceremony & Virtual Keynote Address.
            </p>
            <p>
              <strong>📱 Phone First:</strong> Designed with full mobile responsiveness, touch targets, and offline-resilient local sync.
            </p>
            <p>
              <strong>📊 Master Sheet:</strong> Excel 97 / Google Sheets compatible TSV clipboard export & direct CSV download.
            </p>
            <p>
              <strong>🔒 Protected:</strong> Administrative panel access is restricted to authorized faculty and club leads.
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                retroSound.playClick();
                onClose();
              }}
              className="win-btn px-6 py-2 bg-[#c0c0c0] font-bold text-xs"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
