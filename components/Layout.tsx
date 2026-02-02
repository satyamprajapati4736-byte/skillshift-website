
import React, { useState } from 'react';
import { Page, User } from '../types';
import { Icons } from '../constants';
import FeedbackModal from './FeedbackModal';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: Page;
  onPageChange: (page: Page) => void;
  user: User | null;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, currentPage, onPageChange, user, onLogout }) => {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const navItems = [
    { id: Page.HOME, label: 'Home', icon: Icons.Home },
    { id: Page.MENTOR, label: 'Mentor', icon: Icons.Chat },
    { id: Page.FINDER, label: 'Finder', icon: Icons.Search },
    { id: Page.ROADMAPS, label: 'Roadmaps', icon: Icons.Map },
    { id: Page.BOOST, label: 'Boost', icon: Icons.Zap },
  ];

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto relative shadow-2xl bg-slate-950 overflow-hidden border-x border-slate-800">
      {/* Top Header */}
      <header className="h-20 px-6 flex items-center justify-between border-b border-slate-800 sticky top-0 bg-slate-950/90 backdrop-blur-xl z-[60]">
        <h1 
          className="text-2xl font-bold font-heading text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500 cursor-pointer"
          onClick={() => onPageChange(Page.HOME)}
        >
          SkillShift
        </h1>
        <div className="flex items-center gap-3">
           {user ? (
             <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                   <div className="flex items-center gap-1.5">
                     <span className="text-xs text-slate-200 font-bold leading-tight">Hi, {user.name.split(' ')[0]}</span>
                   </div>
                   <button 
                     onClick={onLogout}
                     className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-red-400 transition-colors"
                   >
                     Exit
                   </button>
                </div>
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-pink-600 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  {user.name[0]}
                </div>
             </div>
           ) : (
             <button 
              onClick={() => onPageChange(Page.PROFILE_ENTRY)}
              className="px-4 py-2 bg-blue-600/10 text-blue-400 border border-blue-500/30 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600/20 transition-all"
             >
               Join Now
             </button>
           )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 pb-24 overflow-y-auto scroll-smooth">
        <div className="px-5 py-6">
          {children}
        </div>
        
        {/* Simple Footer inside scroll area */}
        <footer className="mt-8 mb-12 px-6 flex flex-col items-center gap-4 opacity-40">
           <div className="h-px w-full bg-slate-800"></div>
           <button 
             onClick={() => setIsFeedbackOpen(true)}
             className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-all py-2"
           >
             Give Feedback
           </button>
           <p className="text-[9px] font-medium text-slate-600 text-center">
             Built for the next generation. ⚡️ SkillShift © 2025
           </p>
        </footer>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full max-w-md bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 pb-safe-area-inset-bottom z-50">
        <div className="flex justify-around items-center h-20 px-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center justify-center gap-1.5 transition-all duration-300 w-full ${
                currentPage === item.id 
                  ? 'text-pink-500' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className={`p-2 rounded-xl transition-all ${currentPage === item.id ? 'bg-pink-500/10 scale-110 shadow-sm' : ''}`}>
                <item.icon />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider transition-all ${currentPage === item.id ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Modal Integration */}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </div>
  );
};

export default Layout;
