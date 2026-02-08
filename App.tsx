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

  useEffect(() => {
    const initApp = async () => {
      // 1. Handle any redirect result first (completion of Google Auth flow)
      try {
        const redirectedUser = await authService.handleRedirectResult();
        if (redirectedUser) {
          setUser(redirectedUser);
          // Don't set isLoaded yet, let the listener handle final state
        }
      } catch (err) {
        console.error("Redirect Flow Error:", err);
      }

      // 2. Auth state observer
      const unsubscribe = authService.onAuthUpdate(async (fbUser) => {
        if (fbUser) {
          // If logged in via Firebase, fetch the database profile
          const profile = await dbService.getUserProfile(fbUser.uid);
          if (profile) {
            setUser(profile);
            localStorage.setItem('skillshift_current_user', JSON.stringify(profile));
          } else {
            // Profile doesn't exist yet (should have been created by handleRedirectResult or signUp)
            // But we can create a backup stub here if needed.
            const backupProfile = await dbService.createProfile(fbUser.uid, fbUser.displayName || "User", "", "Other");
            setUser(backupProfile);
            localStorage.setItem('skillshift_current_user', JSON.stringify(backupProfile));
          }
        } else {
          setUser(null);
          localStorage.removeItem('skillshift_current_user');
        }
        
        // ONLY mark as loaded once we have successfully determined the profile
        setIsLoaded(true);
      });

      // 3. Admin Route Detection
      const path = window.location.pathname;
      if (path.includes('admin-overview') || path.includes('hidden-admin-panel')) {
        setCurrentPage(Page.ADMIN_DASHBOARD);
      } else if (path.includes('admin-daily-report')) {
        setCurrentPage(Page.ADMIN_REPORT);
      }

      return unsubscribe;
    };

    const unsubscribePromise = initApp();
    return () => {
      unsubscribePromise.then(unsub => unsub?.());
    };
  }, []); 

  const handlePageChange = (page: Page, message?: string) => {
    if (page === Page.ROADMAPS && !user) {
      setAuthRedirectMessage(message || "Roadmap dekhne ke liye pehle login karo.");
      setCurrentPage(Page.PROFILE_ENTRY);
      return;
    }
    if (page !== Page.PROFILE_ENTRY) setAuthRedirectMessage(null);
    setCurrentPage(page);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setCurrentPage(Page.HOME);
    if (window.location.pathname.includes('admin')) {
      window.history.pushState({}, '', '/');
    }
  };

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
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center gap-6 z-[100]">
        <ProgressRing size="w-16 h-16" />
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-3xl font-bold font-heading tracking-tight text-white opacity-90">SkillShift</h1>
          <div className="flex gap-1.5 text-blue-500">
             <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce delay-100"></div>
             <div className="w-1.5 h-1.5 rounded-full bg-current animate-bounce delay-200"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Layout currentPage={currentPage} onPageChange={handlePageChange} user={user} onLogout={handleLogout}>
      {renderPage()}
    </Layout>
  );
};

export default App;