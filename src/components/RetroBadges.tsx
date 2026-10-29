import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';

export const RetroBadges: React.FC = () => {
  const [visitorCount, setVisitorCount] = useState<number>(4289);

  useEffect(() => {
    const stored = localStorage.getItem('oorja_visitor_count');
    let count = stored ? parseInt(stored, 10) : 4289;
    count += 1;
    localStorage.setItem('oorja_visitor_count', count.toString());
    setVisitorCount(count);
  }, []);

  const formattedDigits = visitorCount.toString().padStart(6, '0').split('');

  return (
    <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2 sm:gap-4 py-3 px-2 text-xs font-mono text-gray-800">
      {/* Power Grid Counter */}
      <div className="flex items-center gap-2 win-inset px-2.5 py-1 bg-black text-yellow-400 font-bold tracking-widest shadow-inner">
        <span className="text-[9px] text-gray-400 uppercase font-sans flex items-center gap-1">
          <Zap className="w-3 h-3 text-yellow-400 fill-yellow-400 animate-pulse" /> GRID METER:
        </span>
        <div className="flex gap-0.5">
          {formattedDigits.map((digit, i) => (
            <span
              key={i}
              className="bg-[#111] border border-[#444] text-yellow-400 px-1 py-0.5 text-xs font-pixel rounded-none"
            >
              {digit}
            </span>
          ))}
        </div>
      </div>

      {/* Electrical Badges */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center text-[10px]">
        <div className="border border-black bg-yellow-400 px-1.5 py-0.5 font-bold text-black shadow-sm flex items-center gap-1">
          <span>⚡</span> 440V HIGH VOLTAGE
        </div>

        <div className="border border-black bg-blue-900 text-yellow-300 px-1.5 py-0.5 font-bold shadow-sm flex items-center gap-1">
          <span>🏛️</span> CLUB OORJA
        </div>

        <div className="border border-black bg-[#ffffcc] px-1.5 py-0.5 font-bold text-red-800 shadow-sm flex items-center gap-1">
          <span>✓</span> INAUGURATION 2026
        </div>

        <div className="border border-black bg-emerald-800 text-white px-1.5 py-0.5 font-bold shadow-sm flex items-center gap-1">
          <span>⚡</span> 50 Hz GRID STABLE
        </div>
      </div>
    </div>
  );
};
