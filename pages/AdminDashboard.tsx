import React, { useState, useEffect, useMemo } from 'react';
import { dbService } from '../services/dbService';
import { User, RoadmapRecord } from '../types';
import { ProgressRing } from '../App';

interface AdminDashboardProps {
  user: User | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalRoadmaps: number;
    recentUsers: User[];
    recentRoadmaps: RoadmapRecord[];
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.role === 'admin') {
        try {
          const globalStats = await dbService.getGlobalStats();
          setStats(globalStats);
        } catch (err) {
          console.error("Dashboard error:", err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fadeIn">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h2 className="text-2xl font-bold font-heading text-white mb-2">Access Restricted</h2>
        <p className="text-slate-500 text-sm max-w-xs">Admin access required to view dashboard.</p>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <ProgressRing size="w-12 h-12" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Loading stats...</p>
      </div>
    );
  }

  const skillSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    stats.recentRoadmaps.forEach(r => counts[r.skill_name] = (counts[r.skill_name] || 0) + 1);
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [stats.recentRoadmaps]);

  return (
    <div className="flex flex-col gap-8 animate-fadeIn py-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold font-heading text-white">Admin Panel</h2>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Platform Overview</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-6 rounded-[2rem] flex flex-col gap-2 border-slate-800 shadow-xl overflow-hidden relative group">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Total Users</span>
          <span className="text-3xl font-bold text-blue-400 font-heading">{stats.totalUsers.toLocaleString()}</span>
        </div>
        <div className="glass-card p-6 rounded-[2rem] flex flex-col gap-2 border-slate-800 shadow-xl overflow-hidden relative group">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Roadmaps</span>
          <span className="text-3xl font-bold text-pink-400 font-heading">{stats.totalRoadmaps.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Popular Skills</h3>
        <div className="flex flex-col gap-2">
          {skillSummary.slice(0, 5).map(([name, count]) => (
            <div key={name} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
              <span className="text-sm font-medium text-slate-300">{name}</span>
              <span className="bg-blue-600/10 text-blue-400 px-2 py-0.5 rounded-lg text-[10px] font-bold">{count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
         <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Recent Users</h3>
         </div>
         <div className="space-y-3">
           {stats.recentUsers.map((u, i) => (
             <div key={i} className="glass-card p-4 rounded-2xl border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                     {u.name[0]}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-bold text-white leading-none">{u.name}</span>
                      <span className="text-[9px] text-slate-600 mt-1">{u.phone}</span>
                   </div>
                </div>
                <div className="text-right text-[10px] text-slate-500">
                   {new Date(u.created_at).toLocaleDateString()}
                </div>
             </div>
           ))}
         </div>
      </div>
    </div>
  );
};

export default AdminDashboard;