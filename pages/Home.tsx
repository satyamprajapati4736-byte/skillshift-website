
import React from 'react';
import { Page } from '../types';
import { Icons } from '../constants';

interface HomeProps {
  onNavigate: (page: Page) => void;
}

const Home: React.FC<HomeProps> = ({ onNavigate }) => {
  return (
    <div className="flex flex-col gap-10 animate-fadeIn">
      {/* Hero Section */}
      <div className="flex flex-col gap-4 mt-8">
        <span className="text-blue-400 font-medium tracking-widest text-xs uppercase">Unlock Your Potential</span>
        <h2 className="text-4xl font-bold font-heading leading-tight">
          Hi Explorer,<br />
          <span className="text-pink-500">Confused ho?</span><br />
          Tum akele nahi ho.
        </h2>
        <p className="text-slate-400 leading-relaxed text-sm max-w-[90%]">
          Bas apni situation likho. Hamara intelligent AI tumhein next clear practical step batayega. No login, no judgment, only help.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-4">
        <button 
          onClick={() => onNavigate(Page.MENTOR)}
          className="w-full flex items-center justify-between p-5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 font-semibold shadow-lg neon-glow-blue active:scale-95 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-2 rounded-lg">
              <Icons.Chat />
            </div>
            <span>Talk to AI Mentor</span>
          </div>
          <Icons.ArrowRight />
        </button>

        <button 
          onClick={() => onNavigate(Page.FINDER)}
          className="w-full flex items-center justify-between p-5 rounded-2xl bg-slate-800/50 border border-slate-700 font-semibold active:scale-95 transition-all group hover:bg-slate-700/50"
        >
          <div className="flex items-center gap-4">
             <div className="bg-white/10 p-2 rounded-lg">
              <Icons.Search />
            </div>
            <span>Find My Skill</span>
          </div>
          <Icons.ArrowRight />
        </button>

        <button 
          onClick={() => onNavigate(Page.ROADMAPS)}
          className="w-full flex items-center justify-between p-5 rounded-2xl bg-slate-800/50 border border-slate-700 font-semibold active:scale-95 transition-all group hover:bg-slate-700/50"
        >
          <div className="flex items-center gap-4">
             <div className="bg-white/10 p-2 rounded-lg">
              <Icons.Map />
            </div>
            <span>Free Roadmaps</span>
          </div>
          <Icons.ArrowRight />
        </button>
      </div>

      {/* Floating Card UI Mockup */}
      <div className="glass-card rounded-3xl p-6 mt-4 relative overflow-hidden float-animation">
        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl"></div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 to-blue-500 flex items-center justify-center">
            ✨
          </div>
          <div>
            <div className="text-sm font-bold">Smart Mentor</div>
            <div className="text-[10px] text-green-400 flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-green-400"></div> Online
            </div>
          </div>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-3 text-xs text-slate-300 italic">
          "Pehle batao, laptop hai ya phone? Uske hisaab se best earning skill decide karenge..."
        </div>
      </div>

      {/* Vibe Check */}
      <div className="text-center py-6">
        <p className="text-slate-500 text-xs italic">
          "No fake motivation. Just clear steps."
        </p>
      </div>
    </div>
  );
};

export default Home;
