import React from 'react';
import { retroSound } from '../utils/audio';
import { Zap } from 'lucide-react';

interface TitleBarProps {
  title: string;
  icon?: string;
  active?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
}

export const TitleBar: React.FC<TitleBarProps> = ({
  title,
  icon = '⚡',
  active = true,
  onClose,
  onMinimize,
  onMaximize,
}) => {
  return (
    <div
      className={`px-2 py-1.5 flex items-center justify-between text-white font-bold select-none text-xs tracking-wide border-b border-black/40 ${
        active
          ? 'bg-gradient-to-r from-[#000066] via-[#0d214f] to-[#002244]'
          : 'bg-[#4b5563]'
      }`}
    >
      <div className="flex items-center gap-1.5 overflow-hidden">
        <span className="text-yellow-400 text-sm animate-pulse">{icon}</span>
        <span className="truncate drop-shadow text-[11px] sm:text-xs font-mono uppercase text-yellow-300">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-1 ml-2 shrink-0">
        <button
          onClick={() => {
            retroSound.playClick();
            onMinimize?.();
          }}
          className="win-btn w-6 h-6 sm:w-5 sm:h-5 bg-[#c0c0c0] text-black font-mono font-bold text-xs flex items-center justify-center leading-none active:scale-95"
          title="Minimize"
          aria-label="Minimize"
        >
          _
        </button>
        <button
          onClick={() => {
            retroSound.playClick();
            onMaximize?.();
          }}
          className="win-btn w-6 h-6 sm:w-5 sm:h-5 bg-[#c0c0c0] text-black font-mono font-bold text-xs flex items-center justify-center leading-none active:scale-95"
          title="Maximize"
          aria-label="Maximize"
        >
          □
        </button>
        <button
          onClick={() => {
            retroSound.playClick();
            onClose?.();
          }}
          className="win-btn w-6 h-6 sm:w-5 sm:h-5 bg-[#c0c0c0] text-black font-mono font-bold text-xs flex items-center justify-center leading-none hover:bg-red-300 active:scale-95"
          title="Close / Toggle View"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
