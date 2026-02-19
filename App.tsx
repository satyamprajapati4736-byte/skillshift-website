
import React, { useState } from 'react';
import { Page } from './types';
import Layout from './components/Layout';
import Home from './pages/Home';
import MentorChat from './pages/MentorChat';
import SkillFinder from './pages/SkillFinder';
import Roadmaps from './pages/Roadmaps';
import DailyBoost from './pages/DailyBoost';

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

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case Page.HOME: return <Home onNavigate={handlePageChange} />;
      case Page.MENTOR: return <MentorChat />;
      case Page.FINDER: return <SkillFinder />;
      case Page.ROADMAPS: return <Roadmaps />;
      case Page.BOOST: return <DailyBoost />;
      default: return <Home onNavigate={handlePageChange} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={handlePageChange}>
      {renderPage()}
    </Layout>
  );
};

export default App;
