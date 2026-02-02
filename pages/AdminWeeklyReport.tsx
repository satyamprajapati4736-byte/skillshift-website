
import React, { useMemo, useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { User } from '../types';

interface AdminWeeklyReportProps {
  user: User | null;
}

const AdminWeeklyReport: React.FC<AdminWeeklyReportProps> = ({ user }) => {
  const WHATSAPP_NUMBER = "7991500823";
  const [reportSent, setReportSent] = useState(false);

  useEffect(() => {
    const lastSent = localStorage.getItem('skillshift_weekly_report_sent');
    if (lastSent) {
      const lastSentDate = new Date(lastSent);
      const now = new Date();
      // Check if sent in the last 7 days
      const diffTime = Math.abs(now.getTime() - lastSentDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays < 7) {
        setReportSent(true);
      }
    }
  }, []);

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
    
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    weekAgo.setHours(0, 0, 0, 0);

    const weeklyUsers = allUsers.filter(u => new Date(u.created_at) >= weekAgo);
    const weeklyRoadmaps = allRoadmaps.filter(r => new Date(r.created_at) >= weekAgo);

    // Roadmap breakdown
    const roadmapCounts: Record<string, number> = {};
    weeklyRoadmaps.forEach(rm => {
      roadmapCounts[rm.skill_name] = (roadmapCounts[rm.skill_name] || 0) + 1;
    });

    const sortedRoadmaps = Object.entries(roadmapCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    // Gender breakdown
    const maleCount = weeklyUsers.filter(u => u.gender === 'Male').length;
    const femaleCount = weeklyUsers.filter(u => u.gender === 'Female').length;

    const topRoadmap = sortedRoadmaps[0]?.[0] || "skills";
    
    const startDate = weekAgo.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const endDate = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    const reportText = `--------------------------------
Weekly Report – ${startDate} to ${endDate}

• Total users this week: ${weeklyUsers.length}
• Total roadmaps generated: ${weeklyRoadmaps.length}

Most used roadmaps this week:
${sortedRoadmaps.length > 0 ? sortedRoadmaps.map(([name, count], i) => `${i + 1}) ${name} – ${count} users`).join('\n') : "No data yet."}

Gender overview:
• Male users: ${maleCount}
• Female users: ${femaleCount}

Insight:
“Is week users ka interest zyada ${topRoadmap} ki taraf raha.”
--------------------------------`;

    return {
      range: `${startDate} - ${endDate}`,
      text: reportText,
      topRoadmap
    };
  }, []);

  const sendToWhatsApp = () => {
    const encodedText = encodeURIComponent(reportData.text);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedText}`;
    window.open(url, '_blank');
    
    // Mark as sent for this week
    localStorage.setItem('skillshift_weekly_report_sent', new Date().toISOString());
    setReportSent(true);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn py-8 px-2">
      <div className="flex flex-col gap-2 mb-4">
        <h2 className="text-2xl font-bold font-heading text-white">Weekly Report</h2>
        <p className="text-slate-500 text-sm">Send this summary to the project head via WhatsApp.</p>
      </div>

      {reportSent && (
        <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-2xl flex items-center gap-3 text-green-400 text-xs font-medium">
          <span>✅</span>
          Report for this week has already been generated/sent.
        </div>
      )}

      <div className="glass-card rounded-3xl p-6 border-slate-800 font-mono text-sm whitespace-pre-wrap leading-relaxed text-slate-300">
        {reportData.text}
      </div>

      <div className="flex flex-col gap-3 mt-4">
        <button 
          onClick={sendToWhatsApp}
          className="w-full py-5 bg-[#25D366] text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:brightness-110 transition-all active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
          Send via WhatsApp
        </button>
        <button 
          onClick={() => window.history.back()}
          className="w-full py-4 text-slate-500 font-bold text-xs uppercase tracking-widest"
        >
          Go Back
        </button>
      </div>

      <div className="mt-8 text-[10px] text-slate-600 italic text-center leading-relaxed">
        * Weekly reports are meant to be shared only once every 7 days.<br/>
        Sharing again will update the "last sent" timestamp locally.
      </div>
    </div>
  );
};

export default AdminWeeklyReport;
