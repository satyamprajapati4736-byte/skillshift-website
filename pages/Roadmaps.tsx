
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
  const scrollRef = useRef<HTMLDivElement>(null);

  const steps = [
    "Analyzing profile data",
    "Mapping skills to interests",
    "Crafting 30-day curriculum",
    "Configuring earning modules",
    "Finalizing custom roadmap"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, state]);

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
    if (!user) {
      onAuthRequired("Roadmap dekhne ke liye pehle apni basic details bharo.");
      return;
    }
    setState(EngineState.QUESTIONNAIRE);
    setChatHistory([{ role: 'ai', text: QUESTIONS[0].text }]);
  };

  const openLibrary = () => {
    if (!user) {
      onAuthRequired("Skill Library dekhne ke liye pehle apni basic details bharo.");
      return;
    }
    setState(EngineState.LIBRARY);
  };

  const syncToSheet = async (roadmapName: string) => {
    if (!user) return;
    const res = await sheetService.syncToGoogleSheet(user, roadmapName);
    if (res.success) {
      alert("Your roadmap is ready.");
    } else {
      alert("Something went wrong. Please try again.");
    }
  };

  const selectSkillFromLibrary = async (skillName: string) => {
    setState(EngineState.GENERATING);
    setGenerationStep(0);
    const roadmap = await generateDetailedRoadmap(skillName);
    if (roadmap) {
      setGeneratedData(roadmap);
      if (user) {
        const record = await dbService.saveRoadmap(user.id, roadmap);
        setActiveRoadmapRecord(record);
        await syncToSheet(roadmap.skillName);
      }
      setState(EngineState.PREVIEW);
    } else {
      alert("Something went wrong. Please try again.");
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
        setGeneratedData(roadmap);
        if (user) {
          const record = await dbService.saveRoadmap(user.id, roadmap);
          setActiveRoadmapRecord(record);
          await syncToSheet(roadmap.skillName);
        }
        setState(EngineState.PREVIEW);
      } else {
        alert("Something went wrong. Please try again.");
        setState(EngineState.INTRO);
      }
    }
  };

  const handleDownloadPDF = async () => {
    if (!user || !generatedData) return;
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

      // Header
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
      doc.text(`User: ${user.name} | Goal: ${generatedData.userGoal}`, margin, y);
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

      // Final Note
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
      console.error("PDF generation failed:", err);
      alert("PDF generate nahi ho pa rahi. Page refresh karo.");
    } finally {
      setDownloading(false);
    }
  };

  if (state === EngineState.INTRO) {
    return (
      <div className="flex flex-col gap-8 animate-fadeIn">
        <div className="flex flex-col gap-4 text-center">
          <div className="mx-auto w-16 h-16 rounded-3xl bg-blue-600/10 flex items-center justify-center text-blue-500 mb-2">
            <Icons.Map />
          </div>
          <h2 className="text-3xl font-bold font-heading text-white">Roadmap Engine</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Confused ho? Apna custom roadmap banao. <br/>
            Bas chhota sa questionnaire aur tera path ready.
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

        <div className="grid grid-cols-2 gap-4 mt-4">
           <div className="glass-card p-4 rounded-xl text-center border-slate-800">
              <div className="text-lg mb-1">🎯</div>
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Personalized</div>
           </div>
           <div className="glass-card p-4 rounded-xl text-center border-slate-800">
              <div className="text-lg mb-1">📄</div>
              <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Save as PDF</div>
           </div>
        </div>
      </div>
    );
  }

  if (state === EngineState.LIBRARY) {
    return (
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
    );
  }

  if (state === EngineState.QUESTIONNAIRE) {
    return (
      <div className="flex flex-col h-[calc(100vh-220px)]">
        <div className="flex items-center gap-2 mb-4 text-slate-500">
           <button onClick={() => setState(EngineState.INTRO)} className="p-1"><div className="rotate-180"><Icons.ArrowRight /></div></button>
           <span className="text-xs font-bold uppercase tracking-wider">Step {currentQuestionIndex + 1} of 5</span>
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
    );
  }

  if (state === EngineState.GENERATING) {
    return (
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
    );
  }

  if (state === EngineState.PREVIEW && generatedData) {
    return (
      <div className="flex flex-col animate-fadeIn">
        {/* Sticky Toolbar */}
        <div className="no-print sticky top-16 z-40 bg-slate-950/95 backdrop-blur-md py-4 border-b border-slate-800 -mx-5 px-5 mb-8 flex items-center justify-between">
           <button 
            onClick={() => setState(EngineState.INTRO)} 
            className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest hover:text-slate-300 transition-colors"
           >
             <div className="rotate-180 scale-75"><Icons.ArrowRight /></div> 
             Reset
           </button>
           <div className="flex items-center gap-2">
            <button 
              onClick={handleDownloadPDF} 
              disabled={downloading}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all active:scale-95 bg-pink-600 text-white neon-glow-pink`}
            >
              {downloading ? (
                <div className="w-3 h-3 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : <Icons.Zap />}
              {downloading ? 'Preparing...' : 'Download Custom PDF'}
            </button>
           </div>
        </div>

        {/* Roadmap Content */}
        <div className="print-area glass-card rounded-[2.5rem] p-6 sm:p-8 border-blue-500/20 mb-20 relative overflow-hidden print:bg-white print:text-black print:p-12 print:border-none print:shadow-none print:max-w-none">
           <div className="mb-16 text-center border-b border-slate-800/50 print:border-gray-200 pb-10 pt-4 animate-slideUp">
              <h1 className="text-3xl sm:text-4xl font-bold font-heading mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-pink-500 leading-[1.2] print:text-black print:bg-none print:text-5xl uppercase tracking-tight break-words">
                {generatedData.skillName}
              </h1>
              <p className="text-slate-500 print:text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
                30-Day Custom Roadmap
              </p>
              
              <div className="p-5 bg-slate-900/60 rounded-3xl border border-slate-800 text-left print:bg-gray-50 print:border-gray-300">
                <div className="flex flex-col gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] block mb-2">Goal: {generatedData.userGoal}</span>
                    <p className="text-sm text-slate-200 print:text-black font-medium leading-relaxed italic">"{generatedData.whyThisSkill || generatedData.overview}"</p>
                  </div>
                </div>
              </div>
           </div>

           <div className="space-y-16">
              {generatedData.dailyPlan?.map((day: any, idx: number) => {
                const isWeeklyReview = (idx + 1) % 7 === 0;
                const weekNum = (idx + 1) / 7;
                const weekReview = generatedData.weeklyReview?.find((r: any) => r.week === weekNum);

                return (
                  <React.Fragment key={day.day}>
                    <div className="flex gap-6 sm:gap-8 relative group break-inside-avoid">
                      <div className="flex flex-col items-center">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl sm:rounded-3xl bg-slate-900 flex items-center justify-center font-bold text-blue-400 border border-slate-800 print:border-gray-400 print:text-black print:bg-gray-100 shadow-xl">
                          {day.day}
                        </div>
                        {idx !== generatedData.dailyPlan.length - 1 && <div className="w-px flex-1 bg-slate-800 my-4 print:bg-gray-200 opacity-50"></div>}
                      </div>
                      
                      <div className="flex-1 pb-10">
                        <div className="flex items-start justify-between mb-4">
                           <h4 className="text-lg sm:text-xl font-bold text-white print:text-black leading-tight pr-4">{day.title}</h4>
                           <span className="text-[9px] bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full border border-blue-500/20 font-bold print:bg-gray-100 print:text-black uppercase whitespace-nowrap">{day.timeMinutes}m</span>
                        </div>
                        
                        <div className="space-y-6">
                          <div className="text-[13px] text-slate-400 print:text-gray-700 leading-relaxed">
                            <span className="text-blue-500 font-bold uppercase tracking-widest text-[8px] block mb-1">Concept</span> {day.learn}
                          </div>
                          
                          <div className="p-5 bg-gradient-to-br from-blue-500/10 to-pink-500/5 rounded-2xl border border-blue-500/10 print:bg-gray-50 print:border-gray-200">
                            <span className="text-pink-500 font-bold uppercase tracking-widest text-[8px] block mb-2">Today's Mission</span>
                            <p className="text-[14px] text-slate-100 print:text-black font-semibold leading-relaxed">{day.task}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {isWeeklyReview && weekReview && (
                       <div className="my-10 p-6 rounded-3xl bg-blue-600/5 border border-blue-500/10 break-inside-avoid print:bg-gray-100 print:border-gray-300 animate-fadeIn">
                          <h3 className="text-lg font-bold text-blue-400 mb-5 flex items-center gap-2 print:text-black">
                            <div className="p-1.5 bg-blue-500/10 rounded-lg"><Icons.Check /></div>
                            Week {weekReview.week} Reflection
                          </h3>
                          <div className="flex flex-col gap-2">
                             {weekReview.selfQuestions?.map((q: string, qi: number) => (
                               <p key={qi} className="text-xs text-slate-400 italic">" {q} "</p>
                             ))}
                          </div>
                       </div>
                    )}
                  </React.Fragment>
                );
              })}
           </div>

           {/* Earning Guide Section */}
           {generatedData.firstEarningGuide && (
             <div className="mt-20 p-8 sm:p-10 rounded-[2.5rem] bg-slate-950/50 border border-green-500/20 break-inside-avoid print:bg-gray-50 print:border-gray-300 print:text-black">
                <div className="flex items-center gap-5 mb-10">
                   <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center text-2xl text-green-500">💰</div>
                   <div>
                      <h3 className="text-2xl font-bold text-white print:text-black font-heading">First Earning</h3>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Ready around Day {generatedData.firstEarningGuide.readyAfterDays}</p>
                   </div>
                </div>
                <div className="space-y-4">
                   <div className="text-sm text-slate-300">
                     <span className="text-green-500 font-bold uppercase text-[9px] block mb-1">Pricing</span>
                     {generatedData.firstEarningGuide.beginnerPricing}
                   </div>
                </div>
             </div>
           )}

           <div className="mt-16 pt-12 text-center border-t border-slate-900/50 print:border-gray-200">
              <div className="text-[10px] font-bold text-pink-500 uppercase tracking-widest mb-4">Important Notice</div>
              <p className="text-lg font-medium text-slate-300 italic mb-10 max-w-lg mx-auto leading-relaxed print:text-black">
                "{generatedData.finalNote || "Be patient, practice daily, and stay consistent."}"
              </p>
           </div>
        </div>

        <style>{`
          @media print {
            .no-print { display: none !important; }
            body { background: white !important; color: black !important; padding: 0 !important; margin: 0 !important; }
            #root { max-width: none !important; border: none !important; box-shadow: none !important; margin: 0 !important; width: 100% !important; }
            main { padding: 0 !important; overflow: visible !important; width: 100% !important; }
            .print-area { border: none !important; background: transparent !important; padding: 0 !important; width: 100% !important; margin: 0 !important; border-radius: 0 !important; }
            header, nav { display: none !important; }
            .break-inside-avoid { break-inside: avoid; }
            @page { margin: 1cm; size: A4; }
          }
          .custom-scrollbar::-webkit-scrollbar { width: 4px; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
          
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
          .animate-slideUp { animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        `}</style>
      </div>
    );
  }

  return null;
};

export default Roadmaps;
