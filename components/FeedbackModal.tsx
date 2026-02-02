
import React, { useState } from 'react';
import { Icons } from '../constants';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [feedback, setFeedback] = useState('');
  const [contact, setContact] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Feedback Received:', {
      feedback,
      contact: contact || 'Not provided',
      timestamp: new Date().toISOString()
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFeedback('');
      setContact('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-fadeIn">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-sm glass-card rounded-[2.5rem] p-8 border-slate-800 shadow-2xl animate-slideUp">
        {submitted ? (
          <div className="flex flex-col items-center py-10 text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 text-2xl mb-2">
              <Icons.Check />
            </div>
            <h3 className="text-xl font-bold font-heading">Thanks for the vibe check!</h3>
            <p className="text-slate-400 text-sm">Tumhari feedback se hum system fix karenge. ✨</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-2xl font-bold font-heading text-white">Feedback</h3>
                <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-bold">Fix our system</p>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-500 hover:text-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 tracking-widest">Kya feel ho raha hai?</label>
                <textarea
                  required
                  autoFocus
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="App kaisa laga? Ya koi bug mila?"
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-all text-white placeholder:text-slate-600"
                ></textarea>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 tracking-widest">Contact Number (Optional)</label>
                <input
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="98765..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-slate-600"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg neon-glow-blue flex items-center justify-center gap-2 active:scale-95 transition-all mt-2"
              >
                <span>Submit Feedback</span>
                <Icons.ArrowRight />
              </button>
            </form>
          </>
        )}
      </div>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default FeedbackModal;
