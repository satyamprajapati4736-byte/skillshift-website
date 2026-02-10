
import React, { useEffect } from 'react';
import { User } from '../types';
import { ProgressRing } from '../App';

interface PreparingRoadmapProps {
  user?: User | null;
  onComplete: () => void;
}

const PreparingRoadmap: React.FC<PreparingRoadmapProps> = ({ user, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-6 animate-fadeIn">
      <div className="flex flex-col gap-2 mb-12">
        <h2 className="text-3xl font-bold font-heading text-white">
          {user ? `Hi ${user.name.split(' ')[0]} 👋` : "Hi Explorer 👋"}
        </h2>
        <p className="text-slate-400 text-sm font-medium">
          Bas ek chhota sa step aur, phir start karte hain.
        </p>
      </div>

      <div className="flex flex-col items-center gap-10 py-10">
        <div className="relative">
          <ProgressRing size="w-24 h-24" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">
            ✨
          </div>
        </div>

        <div className="flex flex-col gap-3 max-w-xs">
          <p className="text-xl font-bold text-slate-100 leading-snug">
            Main tumhare answers ke basis par tumhare liye best roadmap bana raha hoon.
          </p>
          <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold">
            Ismein 10–15 seconds lag sakte hain.
          </p>
        </div>
      </div>

      <div className="w-full mt-10">
        <button
          disabled
          className="w-full py-5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 font-bold text-sm flex items-center justify-center gap-3 opacity-80"
        >
          <div className="w-4 h-4 border-2 border-slate-700 border-t-slate-500 rounded-full animate-spin"></div>
          Preparing your roadmap...
        </button>
      </div>

      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-blue-600/5 blur-[120px] rounded-full"></div>
      </div>
    </div>
  );
};

export default PreparingRoadmap;
