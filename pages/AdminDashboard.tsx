
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
        <p className="text-slate-500 text-sm max-w-xs">Admin access required for global stats.</p>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <ProgressRing size="w-12 h-12" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing Enterprise Metrics...</p>
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
        <div className="flex items-center gap-3">
           <h2 className="text-3xl font-bold font-heading text-white">Scale Panel</h2>
           <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[8px] font-black rounded border border-green-500/20 uppercase tracking-tighter">Live Monitor</span>
        </div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Enterprise Architecture (100k+ Capability)</p>
      </div>

      {/* Cloud Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-6 rounded-[2rem] flex flex-col gap-2 border-blue-500/20 shadow-2xl overflow-hidden relative group">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Global Users</span>
          <span className="text-3xl font-bold text-blue-400 font-heading">{stats.totalUsers.toLocaleString()}</span>
          <div className="text-[8px] text-green-500 font-bold uppercase">Ready to scale</div>
        </div>
        <div className="glass-card p-6 rounded-[2rem] flex flex-col gap-2 border-pink-500/20 shadow-2xl overflow-hidden relative group">
          <div className="absolute -top-4 -right-4 w-20 h-20 bg-pink-500/5 rounded-full blur-2xl group-hover:bg-pink-500/10 transition-all"></div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Roadmaps</span>
          <span className="text-3xl font-bold text-pink-400 font-heading">{stats.totalRoadmaps.toLocaleString()}</span>
          <div className="text-[8px] text-pink-500 font-bold uppercase">AI Engines Active</div>
        </div>
      </div>

      {/* Top Skills Trend */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Interest Distribution (Recent)</h3>
        <div className="flex flex-col gap-2">
          {skillSummary.slice(0, 5).map(([name, count]) => (
            <div key={name} className="bg-slate-900/50 p-4 rounded-2xl border border-slate-800 flex justify-between items-center transition-all hover:bg-slate-900">
              <span className="text-sm font-medium text-slate-300">{name}</span>
              <div className="flex items-center gap-2">
                 <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${(count / stats.recentRoadmaps.length) * 100}%` }}></div>
                 </div>
                 <span className="bg-blue-600/10 text-blue-400 px-2 py-0.5 rounded-lg text-[10px] font-bold">{count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* User Stream */}
      <div className="flex flex-col gap-4">
         <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Recent Traffic Stream</h3>
            <span className="text-[9px] text-green-500 font-bold flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              Latest 50
            </span>
         </div>
         <div className="space-y-3">
           {stats.recentUsers.map((u, i) => (
             <div key={i} className="glass-card p-4 rounded-2xl border-slate-800 flex justify-between items-center hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${u.gender === 'Male' ? 'bg-blue-500/10 text-blue-400' : 'bg-pink-500/10 text-pink-400'}`}>
                     {u.name[0]}
                   </div>
                   <div className="flex flex-col">
                      <span className="text-sm font-bold text-white leading-none">{u.name}</span>
                      <span className="text-[9px] text-slate-600 font-mono mt-1">ID: ...{u.id.slice(-6)}</span>
                   </div>
                </div>
                <div className="text-right">
                   <div className="text-[10px] text-slate-500 font-medium">
                     {new Date(u.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </div>
                </div>
             </div>
           ))}
         </div>
      </div>
      
      <div className="text-center p-8 border-t border-slate-900/50 mt-4 opacity-50">
         <p className="text-[9px] text-slate-500 font-medium leading-relaxed uppercase tracking-widest">
           Firestore Blaze Tier • Gemini Enterprise Pro • Netlify Edge Hosting
         </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
