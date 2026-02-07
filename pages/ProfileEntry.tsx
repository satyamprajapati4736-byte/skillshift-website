
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
  const [mode, setMode] = useState<'CHOICE' | 'EMAIL_SIGNUP' | 'EMAIL_LOGIN'>('CHOICE');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await authService.loginWithGoogle();
      onSuccess(user);
    } catch (err: any) {
      console.error(err);
      if (err.message.includes("Domain Unauthorized")) {
        setError("Setup Needed: Add this Netlify URL to Firebase Console > Authentication > Settings > Authorized Domains.");
      } else {
        setError("Login failed. Check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'EMAIL_SIGNUP') {
        if (!gender) throw new Error("Select gender");
        if (phone.length !== 10) throw new Error("Enter 10-digit phone");
        const user = await authService.signUpWithEmail(email, password, name, gender, phone);
        onSuccess(user);
      } else {
        const user = await authService.signInWithEmail(email, password);
        onSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || "Auth failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-10 animate-fadeIn py-8 px-2">
      <div className="flex flex-col gap-3 text-center">
        {redirectMessage && (
          <div className="mb-4 p-4 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-center justify-center gap-3 animate-slideDown">
             <span className="text-xl">✨</span>
             <p className="text-sm font-medium text-blue-300 leading-tight">{redirectMessage}</p>
          </div>
        )}
        <h2 className="text-4xl font-bold font-heading tracking-tight text-white">
          {mode === 'CHOICE' ? "Join SkillShift" : mode === 'EMAIL_SIGNUP' ? "Create Account" : "Welcome Back"}
        </h2>
        <p className="text-slate-400 text-base">Your future starts with one click.</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-2xl text-xs font-medium animate-shake text-center leading-relaxed">
          {error}
        </div>
      )}

      {mode === 'CHOICE' ? (
        <div className="flex flex-col gap-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-5 bg-white text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button 
            onClick={() => setMode('EMAIL_LOGIN')}
            className="w-full py-5 bg-slate-900 border border-slate-800 rounded-2xl font-bold text-slate-300 flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <span>Login with Email</span>
          </button>
          
          <button 
            onClick={() => setMode('EMAIL_SIGNUP')}
            className="text-xs text-blue-400 font-bold uppercase tracking-widest text-center mt-2"
          >
            New here? Sign Up with Email
          </button>
        </div>
      ) : (
        <form onSubmit={handleEmailAction} className="flex flex-col gap-6">
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-blue-500 transition-all text-white shadow-inner"
          />
          <input
            type="password"
            required
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-blue-500 transition-all text-white shadow-inner"
          />

          {mode === 'EMAIL_SIGNUP' && (
            <>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:border-blue-500 transition-all text-white shadow-inner"
              />
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-lg">+91</span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-900 border-2 border-slate-800 rounded-2xl pl-16 pr-6 py-4 text-lg focus:outline-none focus:border-blue-500 transition-all text-white shadow-inner"
                />
              </div>
              <div className="flex gap-4">
                {(['Male', 'Female'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`flex-1 py-4 rounded-2xl border-2 font-bold transition-all ${
                      gender === g ? 'bg-blue-600 border-blue-400 text-white' : 'bg-slate-900 border-slate-800 text-slate-500'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl font-bold text-xl shadow-xl neon-glow-blue flex items-center justify-center gap-4 active:scale-95 transition-all"
          >
            {loading ? <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin"></div> : (
              <>
                <span>{mode === 'EMAIL_SIGNUP' ? 'Create Account' : 'Login'}</span>
                <Icons.ArrowRight />
              </>
            )}
          </button>
          
          <button 
            type="button"
            onClick={() => setMode('CHOICE')}
            className="text-xs font-bold text-slate-600 uppercase tracking-widest text-center"
          >
            Back to Options
          </button>
        </form>
      )}

      <button
        onClick={onBack}
        className="text-xs font-bold text-slate-600 uppercase tracking-[0.3em] text-center hover:text-slate-400 transition-colors py-4"
      >
        Go Back
      </button>

      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default ProfileEntry;
