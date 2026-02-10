
import React, { useState, useEffect } from 'react';
import { Page, User } from './types';
import Layout from './components/Layout';
import Home from './pages/Home';
import MentorChat from './pages/MentorChat';
import SkillFinder from './pages/SkillFinder';
import Roadmaps from './pages/Roadmaps';
import DailyBoost from './pages/DailyBoost';
import ProfileEntry from './pages/ProfileEntry';
import PreparingRoadmap from './pages/PreparingRoadmap';
import AdminDashboard from './pages/AdminDashboard';
import AdminReport from './pages/AdminReport';
import AdminWeeklyReport from './pages/AdminWeeklyReport';
import AdminMonthlyReport from './pages/AdminMonthlyReport';
import { authService } from './services/authService';
import { dbService } from './services/dbService';

export const ProgressRing = ({ size = "w-12 h-12" }: { size?: string }) => (
  <div className={`relative ${size} flex items-center justify-center`}>
    <svg className="w-full h-full animate-spin" viewBox="0 0 50 50">
      <circle className="opacity-10" cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle className="text-blue-500" cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="80" strokeDashoffset="60" strokeLinecap="round" />
    </svg>
    <div className="absolute inset-0 bg-blue-500/5 rounded-full blur-xl"></div>
  </div>
);

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.HOME);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authRedirectMessage, setAuthRedirectMessage] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = authService.onAuthUpdate(async (fbUser) => {
      if (!isMounted) return;
      
      if (fbUser) {
        try {
          const profile = await dbService.getUserProfile(fbUser.uid);
          if (profile) {
            setUser(profile);
            setPermissionError(false);
          } else {
            setUser(null);
          }
        } catch (err: any) {
          console.error("Firestore Sync Error:", err);
          if (err.code === 'permission-denied' || err.message?.includes('permission')) {
            setPermissionError(true);
          }
        }
      } else {
        setUser(null);
      }
      setIsLoaded(true);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []); 

  const handlePageChange = (page: Page, message?: string) => {
    // Roadmaps are now accessible without login
    setAuthRedirectMessage(null);
    setCurrentPage(page);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setCurrentPage(Page.HOME);
  };

  if (permissionError) {
    return (
      <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center z-[200] p-8 text-center animate-fadeIn">
        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center text-4xl mb-6 shadow-2xl">🔒</div>
        <h1 className="text-2xl font-bold text-white mb-2 font-heading">Database Locked</h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed max-w-xs">
          Bhai, Firestore rules change karne honge. <br/>
          Go to **Firebase Console > Firestore > Rules** and paste this:
        </p>
        <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 text-left font-mono text-[10px] text-blue-400 overflow-x-auto w-full max-w-sm mb-8">
          rules_version = '2';<br/>
          service cloud.firestore &#123;<br/>
          &nbsp;&nbsp;match /databases/&#123;database&#125;/documents &#123;<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;match /&#123;document=**&#125; &#123;<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;allow read, write: if request.auth != null;<br/>
          &nbsp;&nbsp;&nbsp;&nbsp;&#125;<br/>
          &nbsp;&nbsp;&#125;<br/>
          &#125;
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="w-full max-w-sm py-4 bg-blue-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all"
        >
          Check Again (Reload)
        </button>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case Page.HOME: return <Home onNavigate={handlePageChange} user={user} />;
      case Page.MENTOR: return <MentorChat />;
      case Page.FINDER: return <SkillFinder />;
      case Page.ROADMAPS: return <Roadmaps user={user} onAuthRequired={(msg) => handlePageChange(Page.PROFILE_ENTRY, msg)} />;
      case Page.BOOST: return <DailyBoost />;
      case Page.PROFILE_ENTRY:
        return (
          <ProfileEntry 
            redirectMessage={authRedirectMessage}
            onSuccess={(u) => {
              setUser(u);
              setAuthRedirectMessage(null);
              setCurrentPage(Page.PREPARING);
            }} 
            onBack={() => handlePageChange(Page.HOME)} 
          />
        );
      case Page.PREPARING:
        return user ? (
          <PreparingRoadmap user={user} onComplete={() => setCurrentPage(Page.ROADMAPS)} />
        ) : <Home onNavigate={handlePageChange} user={null} />;
      case Page.ADMIN_DASHBOARD: return <AdminDashboard user={user} />;
      case Page.ADMIN_REPORT: return <AdminReport user={user} />;
      case Page.ADMIN_WEEKLY_REPORT: return <AdminWeeklyReport user={user} />;
      case Page.ADMIN_MONTHLY_REPORT: return <AdminMonthlyReport user={user} />;
      default: return <Home onNavigate={handlePageChange} user={user} />;
    }
  };

  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-[#020617] flex flex-col items-center justify-center z-[100]">
        <ProgressRing size="w-16 h-16" />
        <div className="mt-8 flex flex-col items-center gap-2">
          <h1 className="text-3xl font-bold font-heading text-white tracking-widest uppercase animate-pulse">SkillShift</h1>
          <p className="text-slate-500 text-[10px] font-bold tracking-[0.4em] uppercase">Syncing Data</p>
        </div>
      </div>
    );
  }

  // Fix: Removed undefined 'children' variable on line 155 which was causing the error
  return (
    <Layout currentPage={currentPage} onPageChange={handlePageChange} user={user} onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  );
};

export default App;
