
import React, { useMemo } from 'react';
import { dbService } from '../services/dbService';
import { User } from '../types';

interface AdminReportProps {
  user: User | null;
}

const AdminReport: React.FC<AdminReportProps> = ({ user }) => {
  // Access Restriction Check
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fadeIn">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h2 className="text-2xl font-bold font-heading text-white mb-2">Access Restricted</h2>
        <p className="text-slate-500 text-sm max-w-xs">You do not have permission to view this report.</p>
      </div>
    );
  }

  const reportData = useMemo(() => {
    const allUsers = dbService.getAllUsers();
    const allRoadmaps = dbService.getAllRoadmaps();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayUsers = allUsers.filter(u => new Date(u.created_at) >= today);
    const todayRoadmaps = allRoadmaps.filter(r => new Date(r.created_at) >= today);

    // Roadmap breakdown
    const roadmapCounts: Record<string, number> = {};
    todayRoadmaps.forEach(rm => {
      roadmapCounts[rm.skill_name] = (roadmapCounts[rm.skill_name] || 0) + 1;
    });

    const sortedRoadmaps = Object.entries(roadmapCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Gender breakdown
    const maleCount = todayUsers.filter(u => u.gender === 'Male').length;
    const femaleCount = todayUsers.filter(u => u.gender === 'Female').length;

    const topRoadmap = sortedRoadmaps[0]?.[0] || "general skills";

    return {
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      totalUsers: todayUsers.length,
      totalRoadmaps: todayRoadmaps.length,
      topRoadmaps: sortedRoadmaps,
      male: maleCount,
      female: femaleCount,
      insight: `User interest is shifting towards ${topRoadmap}.`
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn py-8 px-2 font-mono text-sm leading-relaxed text-slate-300">
      <div className="border-b border-slate-800 pb-4 mb-4">
        <h2 className="text-xl font-bold text-white mb-1">Daily Activity Report</h2>
        <p className="text-slate-500">{reportData.date}</p>
      </div>

      <div className="space-y-6">
        <section>
          <div className="text-white font-bold mb-2">--------------------------------</div>
          <div className="text-white font-bold mb-2">Daily Report – {reportData.date}</div>
          
          <ul className="list-none space-y-1">
            <li>• Total users today: {reportData.totalUsers}</li>
            <li>• Total roadmaps generated today: {reportData.totalRoadmaps}</li>
          </ul>
        </section>

        <section>
          <div className="text-white font-bold mb-2">Most selected roadmaps today:</div>
          <ol className="list-none space-y-1">
            {reportData.topRoadmaps.length > 0 ? reportData.topRoadmaps.map(([name, count], i) => (
              <li key={i}>{i + 1}) {name} – {count} users</li>
            )) : (
              <li>No roadmaps generated today yet.</li>
            )}
          </ol>
        </section>

        <section>
          <div className="text-white font-bold mb-2">User breakdown:</div>
          <ul className="list-none space-y-1">
            <li>• Male: {reportData.male}</li>
            <li>• Female: {reportData.female}</li>
          </ul>
          <div className="text-white font-bold mt-2">--------------------------------</div>
        </section>

        <section className="pt-4 italic text-slate-400">
          “{reportData.insight}”
        </section>
      </div>

      <div className="mt-12 text-center">
        <button 
          onClick={() => window.print()}
          className="text-[10px] uppercase tracking-widest font-bold text-slate-600 hover:text-slate-400"
        >
          Print Report
        </button>
      </div>
    </div>
  );
};

export default AdminReport;
