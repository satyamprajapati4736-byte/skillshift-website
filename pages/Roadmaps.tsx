
import React, { useState, useEffect, useRef } from 'react';
import { Icons, SKILLS } from '../constants';
import { generateDetailedRoadmap } from '../services/geminiService';
import { ProgressRing } from '../App';
import { User, RoadmapRecord } from '../types';
import { dbService } from '../services/dbService';
import { sheetService } from '../services/sheetService';
import { jsPDF } from 'jspdf';

enum EngineState {
  INTRO,
  QUESTIONNAIRE,
  LIBRARY,
  GENERATING,
  PREVIEW
}

const QUESTIONS = [
  { key: 'age', text: "Pehle apni age batao? (e.g. 21)" },
  { key: 'status', text: "Abhi kya kar rahe ho? (Student / Jobless / Working / Dropout)" },
  { key: 'device', text: "Kaam ke liye kya device hai? (Only Phone / Laptop / Both)" },
  { key: 'interest', text: "Kis cheez mein thoda interest hai? (Editing / Writing / AI / Social Media / Unsure)" },
  { key: 'goal', text: "Main goal kya hai? (Skill seekhna / First earning / Freelancing / Confidence)" }
];

interface RoadmapsProps {
  user: User | null;
  onAuthRequired: (message?: string) => void;
}

const Roadmaps: React.FC<RoadmapsProps> = ({ user, onAuthRequired }) => {
  const [state, setState] = useState<EngineState>(EngineState.INTRO);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [inputValue, setInputValue] = useState('');
  const [generatedData, setGeneratedData] = useState<any>(null);
  const [activeRoadmapRecord, setActiveRoadmapRecord] = useState<RoadmapRecord | null>(null);
  const [chatHistory, setChatHistory] = useState<{ role: 'ai' | 'user', text: string }[]>([]);
  const [generationStep, setGenerationStep] = useState(0);
  const [downloading, setDownloading] = useState(false);
  const [notification, setNotification] = useState<{ show: boolean; message: string; type: 'success' | 'error' } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const steps = [
    "Analyzing profile data",
    "Mapping skills to interests",
    "Crafting 30-day curriculum",
    "Configuring earning modules",
    "Finalizing custom roadmap"
  ];

  useEffect(() => {
    const cached = localStorage.getItem('skillshift_active_roadmap');
    if (cached) {
      const data = JSON.parse(cached);
      setGeneratedData(data);
      setState(EngineState.PREVIEW);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, state]);

  useEffect(() => {
    if (notification?.show) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    let interval: any;
    if (state === EngineState.GENERATING) {
      interval = setInterval(() => {
        setGenerationStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
      }, 1800);
    }
    return () => clearInterval(interval);
  }, [state]);

  const startEngine = () => {
    // Bina login ke bhi chalega
    setState(EngineState.QUESTIONNAIRE);
    setChatHistory([{ role: 'ai', text: QUESTIONS[0].text }]);
  };

  const openLibrary = () => {
    // Skill library is public now
    setState(EngineState.LIBRARY);
  };

  const syncToSheet = async (roadmapName: string) => {
    if (!user) return; // Only sync if user is logged in
    const res = await sheetService.syncToGoogleSheet(user, roadmapName);
    if (res.success) {
      setNotification({ show: true, message: "Your roadmap is saved.", type: 'success' });
    }
  };

  const handleNewRoadmap = (roadmap: any) => {
    setGeneratedData(roadmap);
    localStorage.setItem('skillshift_active_roadmap', JSON.stringify(roadmap));
    setState(EngineState.PREVIEW);
  };

  const selectSkillFromLibrary = async (skillName: string) => {
    setState(EngineState.GENERATING);
    setGenerationStep(0);
    const roadmap = await generateDetailedRoadmap(skillName);
    if (roadmap) {
      handleNewRoadmap(roadmap);
      if (user) {
        try {
          const record = await dbService.saveRoadmap(user.id, roadmap);
          setActiveRoadmapRecord(record);
          await syncToSheet(roadmap.skillName);
        } catch (e) {
          console.warn("Guest roadmap not saved to DB");
        }
      }
    } else {
      setNotification({ show: true, message: "Engine stuck! Retry karein.", type: 'error' });
      setState(EngineState.INTRO);
    }
  };

  const handleAnswer = async () => {
    if (!inputValue.trim()) return;

    const currentKey = QUESTIONS[currentQuestionIndex].key;
    const newAnswers = { ...answers, [currentKey]: inputValue };
    setAnswers(newAnswers);
    
    const newHistory = [...chatHistory, { role: 'user' as const, text: inputValue }];
    setChatHistory(newHistory);
    setInputValue('');

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: 'ai', text: QUESTIONS[nextIndex].text }]);
      }, 400);
    } else {
      setState(EngineState.GENERATING);
      setGenerationStep(0);
      const roadmap = await generateDetailedRoadmap(newAnswers);
      if (roadmap) {
        handleNewRoadmap(roadmap);
        if (user) {
          try {
            const record = await dbService.saveRoadmap(user.id, roadmap);
            setActiveRoadmapRecord(record);
            await syncToSheet(roadmap.skillName);
          } catch (e) {
            console.warn("Guest roadmap not saved to DB");
          }
        }
      } else {
        setNotification({ show: true, message: "Failed to generate. Retry.", type: 'error' });
        setState(EngineState.INTRO);
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (!generatedData) return;
    setDownloading(true);

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      let y = 20;

      const checkPageBreak = (needed: number) => {
        if (y + needed > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
      };

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(59, 130, 246);
      doc.text("SkillShift Roadmap", margin, y);
      y += 12;

      doc.setFontSize(18);
      doc.setTextColor(236, 72, 153);
      doc.text(generatedData.skillName || "Custom Roadmap", margin, y);
      y += 10;

      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.setFont("helvetica", "normal");
      doc.text(`User: ${user ? user.name : "Guest Explorer"} | Goal: ${generatedData.userGoal}`, margin, y);
      y += 15;

      // Overview
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text("Overview", margin, y);
      y += 7;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const overviewLines = doc.splitTextToSize(generatedData.whyThisSkill || generatedData.overview || "Your journey starts here.", contentWidth);
      doc.text(overviewLines, margin, y);
      y += (overviewLines.length * 5) + 12;

      // Daily Plan
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(59, 130, 246);
      doc.text("30-Day Step-by-Step Plan", margin, y);
      y += 10;

      if (generatedData.dailyPlan && Array.isArray(generatedData.dailyPlan)) {
        for (const day of generatedData.dailyPlan) {
          checkPageBreak(35);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(11);
          doc.setTextColor(0);
          doc.text(`Day ${day.day}: ${day.title}`, margin, y);
          y += 6;

          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          doc.setTextColor(80);
          const taskText = `Mission: ${day.task}`;
          const taskLines = doc.splitTextToSize(taskText, contentWidth - 5);
          doc.text(taskLines, margin + 5, y);
          y += (taskLines.length * 4) + 2;

          const learnText = `To Learn: ${day.learn}`;
          const learnLines = doc.splitTextToSize(learnText, contentWidth - 5);
          doc.text(learnLines, margin + 5, y);
          y += (learnLines.length * 4) + 6;
        }
      }

      // Final Earning Guide
      checkPageBreak(40);
      y += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.setTextColor(16, 185, 129);
      doc.text("First Earning Guide", margin, y);
      y += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(0);
      const earningDesc = `Ready around Day ${generatedData.firstEarningGuide?.readyAfterDays || 15}. Pricing: ${generatedData.firstEarningGuide?.beginnerPricing || 'Market Rates'}`;
      const earningLines = doc.splitTextToSize(earningDesc, contentWidth);
      doc.text(earningLines, margin, y);
      y += (earningLines.length * 5) + 12;

      checkPageBreak(25);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(236, 72, 153);
      doc.text("Important Notice", margin, y);
      y += 7;
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(100);
      const finalLines = doc.splitTextToSize(generatedData.finalNote || "Patience and practice lead to success.", contentWidth);
      doc.text(finalLines, margin, y);

      const fileName = `SkillShift_${(generatedData.skillName || 'Roadmap').replace(/\s+/g, '_')}.pdf`;
      doc.save(fileName);

    } catch (err) {
      console.error("PDF failure:", err);
      setNotification({ show: true, message: "PDF issue. Retry karein.", type: 'error' });
    } finally {
      setDownloading(false);
    }
  };

  const resetEngine = () => {
    localStorage.removeItem('skillshift_active_roadmap');
    setGeneratedData(null);
    setState(EngineState.INTRO);
  };

  return (
    <>
      {notification && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] animate-slideDown px-4 w-full max-w-sm">
          <div className={`p-4 rounded-2xl shadow-2xl backdrop-blur-md border border-white/10 flex items-center gap-3 ${
            notification.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
          }`}>
            <div className={`p-2 rounded-full ${notification.type === 'success' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              {notification.type === 'success' ? <Icons.Check /> : <Icons.Zap />}
            </div>
            <p className="text-sm font-bold">{notification.message}</p>
          </div>
        </div>
      )}

      {state === EngineState.INTRO && (
        <div className="flex flex-col gap-8 animate-fadeIn">
          <div className="flex flex-col gap-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-3xl bg-blue-600/10 flex items-center justify-center text-blue-500 mb-2">
              <Icons.Map />
            </div>
            <h2 className="text-3xl font-bold font-heading text-white">Roadmap Engine</h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Apna custom roadmap banao. <br/>
              No login required. Bas chhota sa quiz aur tera path ready.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <button 
              onClick={startEngine}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl font-bold shadow-lg neon-glow-blue flex items-center justify-center gap-3 active:scale-95 transition-all text-white"
            >
              <span>Start AI Quiz</span>
              <Icons.ArrowRight />
            </button>

            <button 
              onClick={openLibrary}
              className="w-full py-5 bg-slate-800/50 border border-slate-700 rounded-2xl font-bold flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-slate-700/50 text-white"
            >
              <span>Browse Skill Library</span>
              <Icons.Book />
            </button>
          </div>
        </div>
      )}

      {state === EngineState.LIBRARY && (
        <div className="flex flex-col gap-6 animate-fadeIn">
          <div className="flex items-center gap-3">
            <button onClick={() => setState(EngineState.INTRO)} className="p-2 bg-slate-800 rounded-xl text-white"><div className="rotate-180"><Icons.ArrowRight /></div></button>
            <h2 className="text-xl font-bold font-heading text-white">Skill Library</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {SKILLS.map(skill => (
              <button
                key={skill.id}
                onClick={() => selectSkillFromLibrary(skill.title)}
                className="flex items-center justify-between p-5 rounded-2xl glass-card border-slate-800 hover:border-blue-500/50 transition-all text-left group"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{skill.title}</span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{skill.difficulty} • {skill.timeToStart}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900 text-slate-500 group-hover:text-blue-400 transition-all">
                  <Icons.ArrowRight />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {state === EngineState.QUESTIONNAIRE && (
        <div className="flex flex-col h-[calc(100vh-220px)]">
          <div className="flex items-center gap-2 mb-4 text-slate-500">
            <button onClick={() => setState(EngineState.INTRO)} className="p-1"><div className="rotate-180"><Icons.ArrowRight /></div></button>
            <span className="text-xs font-bold uppercase tracking-wider">Question {currentQuestionIndex + 1}</span>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${
                  msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' : 'glass-card border-slate-800 text-slate-200 rounded-tl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <input 
              type="text" 
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAnswer()}
              placeholder="Type your answer..."
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all text-white"
            />
            <button 
              onClick={handleAnswer}
              className="p-3 bg-blue-600 text-white rounded-xl shadow-lg active:scale-95 transition-all"
            >
              <Icons.ArrowRight />
            </button>
          </div>
        </div>
      )}

      {state === EngineState.GENERATING && (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-220px)] gap-10">
          <ProgressRing size="w-16 h-16" />
          <div className="text-center space-y-6">
            <h3 className="text-xl font-semibold text-white font-heading opacity-90 tracking-tight">Designing Roadmap</h3>
            <div className="flex flex-col gap-2">
              {steps.map((step, idx) => (
                <p key={idx} className={`text-[11px] uppercase tracking-widest font-medium transition-all duration-500 ${idx === generationStep ? 'text-blue-400' : idx < generationStep ? 'text-slate-500' : 'text-slate-800'}`}>
                  {step}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {state === EngineState.PREVIEW && generatedData && (
        <div className="flex flex-col animate-fadeIn">
          <div className="no-print sticky top-16 z-40 bg-slate-950/95 backdrop-blur-md py-4 border-b border-slate-800 -mx-5 px-5 mb-8 flex items-center justify-between">
            <button 
              onClick={resetEngine} 
              className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-slate-300 transition-colors"
            >
              <div className="rotate-180 scale-75"><Icons.ArrowRight /></div> 
              New Quiz
            </button>
            <button 
              onClick={handleDownloadPDF} 
              disabled={downloading}
              className="px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 bg-pink-600 text-white neon-glow-pink disabled:opacity-50"
            >
              {downloading ? (
                <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : <Icons.Zap />}
              {downloading ? 'Preparing...' : 'Download PDF'}
            </button>
          </div>

          <div className="glass-card rounded-[2.5rem] p-6 border-blue-500/20 mb-20 relative overflow-hidden">
            <div className="mb-10 text-center border-b border-slate-800/50 pb-10">
                <h1 className="text-3xl font-bold font-heading mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500 uppercase">
                  {generatedData.skillName}
                </h1>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">
                  30-Day Custom Roadmap
                </p>
            </div>

            <div className="space-y-12">
                {generatedData.dailyPlan?.map((day: any) => (
                  <div key={day.day} className="flex gap-4 relative break-inside-avoid">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-blue-400 border border-slate-800 flex-shrink-0">
                      {day.day}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-bold text-white mb-3">{day.title}</h4>
                      <p className="text-sm text-slate-400 mb-4">{day.task}</p>
                      <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10">
                         <span className="text-[10px] text-blue-500 font-bold uppercase block mb-1">Method</span>
                         <p className="text-xs text-slate-300">{day.learn}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Roadmaps;
