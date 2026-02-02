
import React, { useState } from 'react';
import { Icons } from '../constants';
import { authService } from '../services/authService';
import { User, Gender } from '../types';

interface ProfileEntryProps {
  onSuccess: (user: User) => void;
  onBack: () => void;
  redirectMessage?: string | null;
}

const ProfileEntry: React.FC<ProfileEntryProps> = ({ onSuccess, onBack, redirectMessage }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (phone.length !== 10) {
      setError("Enter a 10-digit number.");
      return;
    }
    if (!gender) {
      setError("Please select your gender.");
      return;
    }

    setError('');
    setLoading(true);
    try {
      const user = await authService.saveProfile(name, phone, gender);
      onSuccess(user);
    } catch (err: any) {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 animate-fadeIn py-8 px-2">
      {/* Header & Optional Redirect Message */}
      <div className="flex flex-col gap-3 text-center">
        {redirectMessage && (
          <div className="mb-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-center justify-center gap-3 animate-slideDown">
             <span className="text-xl">✨</span>
             <p className="text-sm font-medium text-blue-300 leading-tight">
               {redirectMessage}
             </p>
          </div>
        )}
        <h2 className="text-4xl font-bold font-heading tracking-tight text-white">Let's Get Started</h2>
        <p className="text-slate-400 text-base">Enter your details to continue.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-2xl text-sm font-medium animate-shake text-center">
            {error}
          </div>
        )}

        {/* Name Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-bold text-slate-500 ml-1 tracking-widest">Full Name</label>
          <input
            type="text"
            required
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-6 py-5 text-lg font-medium focus:outline-none focus:border-blue-500 transition-all text-white placeholder:text-slate-700 shadow-inner"
            placeholder="Rahul Sharma"
          />
        </div>

        {/* Phone Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-bold text-slate-500 ml-1 tracking-widest">Contact Number</label>
          <div className="relative">
            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">+91</span>
            <input
              type="tel"
              required
              maxLength={10}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
              className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl pl-16 pr-6 py-5 text-lg font-medium focus:outline-none focus:border-blue-500 transition-all text-white tracking-[0.2em] shadow-inner"
              placeholder="9876543210"
            />
          </div>
        </div>

        {/* Gender Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase font-bold text-slate-500 ml-1 tracking-widest">Gender</label>
          <div className="flex gap-4 mt-1">
            {(['Male', 'Female'] as Gender[]).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setGender(g)}
                className={`flex-1 py-5 rounded-2xl border-2 text-base font-bold transition-all flex items-center justify-center gap-2 ${
                  gender === g 
                    ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.4)]' 
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl font-bold text-xl shadow-xl neon-glow-blue flex items-center justify-center gap-4 active:scale-95 transition-all mt-6"
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span>Continue</span>
              <Icons.ArrowRight />
            </>
          )}
        </button>
      </form>

      <button
        onClick={onBack}
        className="text-xs font-bold text-slate-600 uppercase tracking-[0.3em] text-center hover:text-slate-400 transition-colors py-4"
      >
        Go Back
      </button>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
        
        @keyframes slideDown {
          from { transform: translateY(-10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slideDown { animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
      `}</style>
    </div>
  );
};

export default ProfileEntry;
