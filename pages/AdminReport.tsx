
import React, { useMemo, useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { User, RoadmapRecord } from '../types';

interface AdminReportProps {
  user: User | null;
}

const AdminReport: React.FC<AdminReportProps> = ({ user }) => {
  const [data, setData] = useState<{users: User[], roadmaps: RoadmapRecord[]} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.role === 'admin') {
        try {
          // Optimized: Only fetching today's activity from server
          const activity = await dbService.getRecentActivity(1);
          setData(activity);
        } catch (error) {
          console.error("Report data fetch failed:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h2 className="text-2xl font-bold font-heading text-white mb-2">Access Restricted</h2>
      </div>
    );
  }

  const reportData = useMemo(() => {
    if (!data) return null;
    
    const roadmapCounts: Record<string, number> = {};
    data.roadmaps.forEach(rm => {
      roadmapCounts[rm.skill_name] = (roadmapCounts[rm.skill_name] || 0) + 1;
    });

    const sortedRoadmaps = Object.entries(roadmapCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const maleCount = data.users.filter(u => u.gender === 'Male').length;
    const femaleCount = data.users.filter(u => u.gender === 'Female').length;

    return {
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      totalUsers: data.users.length,
      totalRoadmaps: data.roadmaps.length,
      topRoadmaps: sortedRoadmaps,
      male: maleCount,
      female: femaleCount,
      insight: sortedRoadmaps[0] ? `User interest is peaking in ${sortedRoadmaps[0][0]}.` : "Collecting initial data..."
    };
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Compiling Edge Logs...</p>
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn py-8 px-2 font-mono text-xs leading-relaxed text-slate-400">
      <div className="border-b border-slate-800 pb-4 mb-4">
        <h2 className="text-xl font-bold text-white mb-1 font-heading">Daily Scale Report</h2>
        <p className="text-slate-600 uppercase tracking-widest font-black text-[9px]">Status: Systems Operational</p>
      </div>

      <div className="space-y-6">
        <section>
          <div className="text-slate-600 mb-1">LOG_DATE: {reportData.date}</div>
          <div className="text-white font-bold mb-4">--------------------------------</div>
          
          <ul className="list-none space-y-1">
            <li>[+] NEW_USERS_24H: {reportData.totalUsers}</li>
            <li>[+] NEW_ROADMAPS_24H: {reportData.totalRoadmaps}</li>
          </ul>
        </section>

        <section>
          <div className="text-white font-bold mb-2 uppercase tracking-tighter">Market_Sentiment:</div>
          <ol className="list-none space-y-1">
            {reportData.topRoadmaps.map(([name, count], i) => (
              <li key={i}>{i + 1}) {name.padEnd(20, '.')} {count} HIT</li>
            ))}
          </ol>
        </section>

        <section>
          <div className="text-white font-bold mb-2 uppercase tracking-tighter">User_Demographics:</div>
          <ul className="list-none space-y-1">
            <li>• SEGMENT_MALE: {reportData.male}</li>
            <li>• SEGMENT_FEMALE: {reportData.female}</li>
          </ul>
          <div className="text-white font-bold mt-4">--------------------------------</div>
        </section>

        <section className="pt-4 italic text-blue-500/80">
          “ANALYSIS: {reportData.insight}”
        </section>
      </div>

      <div className="mt-12 text-center no-print">
        <button 
          onClick={() => window.print()}
          className="px-6 py-2 bg-slate-900 border border-slate-800 rounded-full text-[9px] uppercase tracking-[0.2em] font-black text-slate-500 hover:text-white transition-all"
        >
          Print System Log
        </button>
      </div>
    </div>
  );
};

export default AdminReport;
