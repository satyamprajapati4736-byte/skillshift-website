
import React, { useState } from 'react';
import { SKILLS, Icons } from '../constants';
import { Skill } from '../types';

const SkillFinder: React.FC = () => {
  const [selections, setSelections] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);

  const options = [
    { id: 'student', label: 'I am a student', emoji: '🎓' },
    { id: 'no-job', label: 'I have no job', emoji: '😕' },
    { id: 'phone-only', label: 'I only have a phone', emoji: '📱' },
    { id: 'failed', label: 'I failed before', emoji: '🔄' },
    { id: 'earning', label: 'I want online earning', emoji: '💸' },
  ];

  const toggleOption = (id: string) => {
    setSelections(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const getRecommendedSkill = () => {
    if (selections.includes('phone-only')) return SKILLS[0]; // Video editing
    if (selections.includes('earning') && selections.includes('student')) return SKILLS[1]; // Content writing
    return SKILLS[2]; // AI prompting
  };

  const recommended = getRecommendedSkill();

  if (showResult) {
    return (
      <div className="flex flex-col gap-6 animate-fadeIn">
        <h2 className="text-2xl font-bold font-heading">Recommended for You</h2>
        <div className="glass-card rounded-3xl p-6 border-pink-500/30 shadow-xl overflow-hidden relative">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-pink-500/10 rounded-full blur-3xl"></div>
          
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-pink-400">{recommended.title}</h3>
            <span className={`px-2 py-1 rounded-lg text-[10px] font-bold tracking-wider uppercase ${
              recommended.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {recommended.difficulty}
            </span>
          </div>
          
          <p className="text-slate-300 text-sm mb-6 leading-relaxed">
            {recommended.description}
          </p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-slate-900/50 p-3 rounded-xl">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Time to start</div>
              <div className="text-sm font-semibold">{recommended.timeToStart}</div>
            </div>
            <div className="bg-slate-900/50 p-3 rounded-xl">
              <div className="text-[10px] text-slate-500 uppercase font-bold mb-1">Phone required</div>
              <div className="text-sm font-semibold">{recommended.phoneRequired ? 'Yes, works' : 'Laptop better'}</div>
            </div>
          </div>

          <button 
            onClick={() => setShowResult(false)}
            className="w-full py-3 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors"
          >
            Try different options
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold font-heading">Skill Finder</h2>
        <p className="text-slate-400 text-sm">Select whatever describes you best right now.</p>
      </div>

      <div className="flex flex-col gap-3">
        {options.map(opt => (
          <button
            key={opt.id}
            onClick={() => toggleOption(opt.id)}
            className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${
              selections.includes(opt.id)
                ? 'bg-pink-500/10 border-pink-500 text-white shadow-lg'
                : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <span className="font-medium text-sm">{opt.label}</span>
            {selections.includes(opt.id) && (
              <div className="ml-auto bg-pink-500 rounded-full p-1">
                <Icons.Check />
              </div>
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => selections.length > 0 && setShowResult(true)}
        disabled={selections.length === 0}
        className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
          selections.length > 0 
            ? 'bg-blue-600 text-white neon-glow-blue' 
            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
        }`}
      >
        <span>Show Result</span>
        <Icons.ArrowRight />
      </button>
    </div>
  );
};

export default SkillFinder;
