
import React, { useState, useMemo } from 'react';
import { dbService } from '../services/dbService';
import { User, RoadmapRecord, Page } from '../types';

interface AdminDashboardProps {
  user: User | null;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [filterType, setFilterType] = useState<'all' | 'today' | 'week'>('all');
  const [searchSkill, setSearchSkill] = useState('');

  // Access Restriction Check
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-fadeIn">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </div>
        <h2 className="text-2xl font-bold font-heading text-white mb-2">Access Restricted</h2>
        <p className="text-slate-500 text-sm max-w-xs">You do not have permission to view this panel.</p>
      </div>
    );
  }

  const users = useMemo(() => dbService.getAllUsers(), []);
  const roadmaps = useMemo(() => dbService.getAllRoadmaps(), []);

  const stats = useMemo(() => {
    const now = new Date();
    const today = new Date(now.setHours(0, 0, 0, 0));
    
    return {
      totalUsers: users.length,
      todayUsers: users.filter(u => new Date(u.created_at) >= today).length,
      totalRoadmaps: roadmaps.length
    };
  }, [users, roadmaps]);

  const skillUsage = useMemo(() => {
    const summary: Record<string, number> = {};
    roadmaps.forEach(rm => {
      summary[rm.skill_name] = (summary[rm.skill_name] || 0) + 1;
    });
    return Object.entries(summary).sort((a, b) => b[1] - a[1]);
  }, [roadmaps]);

  const filteredData = useMemo(() => {
    let result = roadmaps.map(rm => {
      const u = users.find(usr => usr.id === rm.user_id);
      return {
        userName: u?.name || 'Unknown',
        contact: u?.phone || 'N/A',
        gender: u?.gender || 'N/A',
        skill: rm.skill_name,
        date: new Date(rm.created_at)
      };
    });

    if (filterType === 'today') {
      const today = new Date(new Date().setHours(0, 0, 0, 0));
      result = result.filter(r => r.date >= today);
    } else if (filterType === 'week') {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      result = result.filter(r => r.date >= weekAgo);
    }

    if (searchSkill.trim()) {
      result = result.filter(r => r.skill.toLowerCase().includes(searchSkill.toLowerCase()));
    }

    return result.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [roadmaps, users, filterType, searchSkill]);

  return (
    <div className="flex flex-col gap-8 animate-fadeIn py-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold font-heading">Admin Dashboard</h2>
        <p className="text-slate-400 text-sm italic">Confidential activity log.</p>
      </div>

      {/* Secret Report Links Section */}
      <div className="grid grid-cols-2 gap-3 no-print">
        <button 
          onClick={() => window.location.pathname = '/admin-daily-report'}
          className="p-4 glass-card rounded-2xl border-slate-800 text-[10px] font-bold text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2 uppercase tracking-tighter"
        >
          📄 Daily
        </button>
        <button 
          onClick={() => window.location.pathname = '/admin-weekly-report'}
          className="p-4 glass-card rounded-2xl border-slate-800 text-[10px] font-bold text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2 uppercase tracking-tighter"
        >
          📊 Weekly
        </button>
        <button 
          onClick={() => window.location.pathname = '/admin-monthly-report'}
          className="col-span-2 p-4 glass-card rounded-2xl border-slate-800 text-[10px] font-bold text-slate-400 hover:text-white transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
        >
          🗓️ Monthly WhatsApp Summary
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4">
        <div className="glass-card p-6 rounded-3xl flex justify-between items-center border-slate-800">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Users Entered</div>
          <div className="text-3xl font-bold text-blue-400">{stats.totalUsers}</div>
        </div>
        <div className="glass-card p-6 rounded-3xl flex justify-between items-center border-slate-800">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Today's Users</div>
          <div className="text-3xl font-bold text-pink-400">{stats.todayUsers}</div>
        </div>
        <div className="glass-card p-6 rounded-3xl flex justify-between items-center border-slate-800">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Roadmaps Generated</div>
          <div className="text-3xl font-bold text-green-400">{stats.totalRoadmaps}</div>
        </div>
      </div>

      {/* Usage Summary */}
      <div className="flex flex-col gap-4">
        <h3 className="text-lg font-bold font-heading">Most Used Roadmaps</h3>
        <div className="flex flex-col gap-2">
          {skillUsage.map(([skill, count]) => (
            <div key={skill} className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex justify-between items-center">
              <span className="text-sm font-medium text-slate-300">{skill}</span>
              <span className="text-blue-400 font-bold">{count}</span>
            </div>
          ))}
          {skillUsage.length === 0 && <p className="text-slate-600 text-xs italic">No roadmaps generated yet.</p>}
        </div>
      </div>

      {/* Activity Table */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold font-heading">User Details</h3>
          <div className="flex gap-2">
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value as any)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs font-bold text-slate-300 focus:outline-none"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {filteredData.map((row, i) => (
            <div key={i} className="glass-card p-5 rounded-2xl border-slate-800 flex flex-col gap-2">
              <div className="flex justify-between items-start">
                <div className="font-bold text-slate-100">{row.userName}</div>
                <div className="text-[10px] text-slate-500 font-mono">{row.date.toLocaleDateString()}</div>
              </div>
              <div className="text-xs text-blue-400 font-medium">{row.skill}</div>
              <div className="flex justify-between items-center mt-2 border-t border-slate-800/50 pt-2">
                <span className="text-[11px] text-slate-500 font-mono">{row.contact}</span>
                <span className={`text-[9px] font-bold uppercase tracking-widest ${
                  row.gender === 'Male' ? 'text-blue-500' : 'text-pink-500'
                }`}>
                  {row.gender}
                </span>
              </div>
            </div>
          ))}
          {filteredData.length === 0 && (
            <div className="text-center py-12 text-slate-600 italic text-sm">No activity recorded.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
