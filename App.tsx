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
    // 1. Instant UI: Load from localStorage if exists
    const cachedUser = authService.getCurrentUser();
    if (cachedUser) {
      setUser(cachedUser);
    }

    // 2. Handle Google Login Redirect (if we just came back from Google)
    const handleAuth = async () => {
      try {
        const redirectedUser = await authService.handleRedirectResult();
        if (redirectedUser) {
          setUser(redirectedUser);
        }
      } catch (err) {
        console.error("Redirect Error:", err);
      }
    };
    handleAuth();

    // 3. Listen for Firebase Auth changes (Single source of truth)
    const unsubscribe = authService.onAuthUpdate(async (fbUser) => {
      if (fbUser) {
        try {
          // If Firebase says we are logged in, get the actual Firestore profile
          const profile = await dbService.getUserProfile(fbUser.uid);
          if (profile) {
            setUser(profile);
            localStorage.setItem('skillshift_current_user', JSON.stringify(profile));
          } else {
            // If user is authed but no DB profile, create a basic one
            const newProfile = await dbService.createProfile(
              fbUser.uid, 
              fbUser.displayName || "User", 
              "", 
              "Other"
            );
            setUser(newProfile);
          }
        } catch (err) {
          console.error("Auth sync error:", err);
        }
      } else {
        // Not logged in or logged out
        setUser(null);
        localStorage.removeItem('skillshift_current_user');
      }
      setIsLoaded(true);
    });

    // Admin detection
    const path = window.location.pathname;
    if (path.includes('admin-overview')) setCurrentPage(Page.ADMIN_DASHBOARD);
    if (path.includes('admin-daily-report')) setCurrentPage(Page.ADMIN_REPORT);

    return () => unsubscribe();
  }, []); 

  const handlePageChange = (page: Page, message?: string) => {
    if (page === Page.ROADMAPS && !user) {
      setAuthRedirectMessage(message || "Roadmap dekhne ke liye login karein.");
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
        <h1 className="mt-6 text-2xl font-bold font-heading text-white">SkillShift</h1>
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