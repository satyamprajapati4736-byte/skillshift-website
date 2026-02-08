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

    return {
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }),
      totalUsers: data.users.length,
      totalRoadmaps: data.roadmaps.length,
      topRoadmaps: sortedRoadmaps,
    };
  }, [data]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Generating Report...</p>
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn py-8 px-2 text-sm text-slate-400">
      <div className="border-b border-slate-800 pb-4 mb-4">
        <h2 className="text-xl font-bold text-white mb-1 font-heading">Daily Summary</h2>
        <p className="text-slate-600 uppercase tracking-widest font-bold text-[9px]">{reportData.date}</p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
             <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">New Users</div>
             <div className="text-xl font-bold text-white">{reportData.totalUsers}</div>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
             <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">New Roadmaps</div>
             <div className="text-xl font-bold text-white">{reportData.totalRoadmaps}</div>
          </div>
        </div>

        <div>
          <h3 className="text-white font-bold mb-3 uppercase text-xs">Trending Skills</h3>
          <div className="space-y-2">
            {reportData.topRoadmaps.map(([name, count], i) => (
              <div key={i} className="flex justify-between items-center p-3 bg-slate-900/30 rounded-xl border border-slate-800/50">
                <span>{name}</span>
                <span className="font-bold text-blue-400">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <button 
          onClick={() => window.print()}
          className="text-[10px] uppercase tracking-widest font-bold text-slate-500 hover:text-white"
        >
          Print Report
        </button>
      </div>
    </div>
  );
};

export default AdminReport;