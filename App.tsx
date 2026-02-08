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
    // 1. Handle potential Google Redirect (essential for mobile/web flow)
    authService.handleRedirectResult().catch(err => console.error("Redirect check failed:", err));

    // 2. Setup standard Auth listener - This is the "Heartbeat" of the app
    const unsubscribe = authService.onAuthUpdate(async (fbUser) => {
      if (fbUser) {
        try {
          // If Firebase says we have a user, check our database for their profile
          let profile = await dbService.getUserProfile(fbUser.uid);
          
          if (!profile) {
            // If they are logged into Firebase but don't have a DB record yet (happens on first Google login)
            profile = await dbService.createProfile(
              fbUser.uid, 
              fbUser.displayName || "User", 
              "", 
              "Other"
            );
          }
          
          setUser(profile);
          // Sync with local storage for snappy feel on reloads
          localStorage.setItem('skillshift_current_user', JSON.stringify(profile));
        } catch (err) {
          console.error("Profile sync error:", err);
        }
      } else {
        // User logged out
        setUser(null);
        localStorage.removeItem('skillshift_current_user');
      }
      
      // Crucial: Only set isLoaded to true AFTER the initial check is complete
      setIsLoaded(true);
    });

    // Admin Route detection (Optional - if URL contains specific segments)
    const path = window.location.pathname;
    if (path.includes('admin-overview')) setCurrentPage(Page.ADMIN_DASHBOARD);
    if (path.includes('admin-daily-report')) setCurrentPage(Page.ADMIN_REPORT);

    return () => unsubscribe();
  }, []); 

  const handlePageChange = (page: Page, message?: string) => {
    // Prevent unauthorized access to sensitive pages
    if (page === Page.ROADMAPS && !user) {
      setAuthRedirectMessage(message || "Roadmap dekhne ke liye pehle login karein.");
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
              // After manual login, take them to the preparing screen
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
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center z-[100]">
        <ProgressRing size="w-16 h-16" />
        <div className="mt-8 flex flex-col items-center gap-2 animate-pulse">
          <h1 className="text-3xl font-bold font-heading text-white tracking-widest uppercase">SkillShift</h1>
          <p className="text-slate-500 text-[10px] font-bold tracking-[0.4em] uppercase">Syncing Security</p>
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