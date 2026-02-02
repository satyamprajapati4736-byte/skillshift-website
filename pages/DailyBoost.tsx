
import React from 'react';
import { Icons } from '../constants';

const DailyBoost: React.FC = () => {
  const date = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' });

  return (
    <div className="flex flex-col gap-8 animate-fadeIn pt-4">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold font-heading">Daily Boost</h2>
          <p className="text-slate-500 text-xs font-medium">{date}</p>
        </div>
        <div className="bg-pink-500/10 p-2 rounded-xl text-pink-500">
           <Icons.Zap />
        </div>
      </div>

      {/* Motivation Card */}
      <div className="glass-card rounded-3xl p-8 border-pink-500/20 relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-24 h-24 bg-pink-500/5 rounded-full -translate-x-12 -translate-y-12"></div>
        <p className="text-xl font-heading font-medium leading-relaxed text-slate-100 italic">
          "Pehle din se perfection mat dhoondo. Sirf pehla step lo. Baaki sab raste mein seekh jaoge. Stop scrolling, start doing."
        </p>
      </div>

      {/* Task Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
           <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Today's Mission</h3>
           <span className="text-[10px] bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full border border-blue-600/30 font-bold uppercase">Action Only</span>
        </div>
        
        <div className="glass-card rounded-2xl p-5 flex items-start gap-4 border-blue-500/10">
          <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400 flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12s-3 7-10 7-10-7-10-7 3-7 10-7 10 7 10 7z"/><circle cx="12" cy="12" r="3"/></svg>
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm mb-1">Watch 1 Video</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Open YouTube. Search "Basic video editing VN" or "How to write tweets". Watch only 1 tutorial. No binge-watching.
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5 flex items-start gap-4 border-slate-800">
          <div className="p-3 bg-green-500/20 rounded-xl text-green-400 flex-shrink-0">
             <Icons.Check />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-sm mb-1">Try 1 Thing</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tutorial khatam hone ke baad, app kholo aur vahi same cheez copy karo. Don't worry if it looks bad. Just do it.
            </p>
          </div>
        </div>
      </div>

      {/* Habit Tracker Placeholder */}
      <div className="mt-4 p-5 glass-card rounded-2xl border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Consistency Strike</h3>
          <span className="text-xs text-pink-500 font-bold flex items-center gap-1">
            4 Days <span className="text-lg">🔥</span>
          </span>
        </div>
        <div className="flex justify-between gap-2">
          {[1,2,3,4,5,6,7].map(d => (
            <div 
              key={d} 
              className={`flex-1 h-2 rounded-full transition-all duration-700 ${
                d <= 4 
                  ? 'bg-gradient-to-r from-pink-500 to-blue-500 shadow-[0_0_12px_rgba(236,72,153,0.4)]' 
                  : 'bg-slate-800'
              }`}
            ></div>
          ))}
        </div>
        <p className="text-[10px] text-slate-500 mt-4 text-center">Keep going. Don't break the streak today.</p>
      </div>
    </div>
  );
};

export default DailyBoost;
