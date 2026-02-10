
import React, { useState, useEffect } from 'react';
import { Icons } from '../constants';
import { authService } from '../services/authService';
import { User, Gender } from '../types';

interface ProfileEntryProps {
  onSuccess: (user: User) => void;
  onBack: () => void;
  redirectMessage?: string | null;
}

const ProfileEntry: React.FC<ProfileEntryProps> = ({ onSuccess, onBack, redirectMessage }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [authMode, setAuthMode] = useState<'CHOICE' | 'PHONE_FORM'>('CHOICE');
  
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('Other');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const user = await authService.loginWithGoogle();
      if (user) onSuccess(user);
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError("Google Login mein issue aaya. Please retry.");
      }
      setLoading(false);
    }
  };

  const handlePhoneAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isForgotPassword) {
        if (!phone || phone.length < 10) throw new Error("Please enter a valid 10-digit number.");
        await authService.resetPassword(phone);
        setSuccessMsg("Reset link aapke recovery email par bhej diya gaya hai.");
      } else if (isLogin) {
        const user = await authService.signInWithPhone(phone, password);
        onSuccess(user);
      } else {
        if (!phone || !password || !name || !recoveryEmail) throw new Error("All fields are mandatory.");
        const user = await authService.signUpWithPhone(name, phone, gender, password, recoveryEmail);
        onSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  if (authMode === 'CHOICE' && !isForgotPassword) {
    return (
      <div className="flex flex-col gap-10 animate-fadeIn py-8 px-2 max-w-sm mx-auto">
        <div className="text-center flex flex-col gap-4">
          <div className="w-20 h-20 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mx-auto text-blue-500 shadow-xl border border-blue-500/10">
             <div className="scale-150"><Icons.Zap /></div>
          </div>
          <div className="space-y-1">
            <h2 className="text-4xl font-bold font-heading text-white tracking-tight">Level Up</h2>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">SkillShift Portal</p>
          </div>
          {redirectMessage && (
            <div className="mt-4 p-4 bg-pink-500/10 border border-pink-500/20 rounded-2xl text-pink-400 text-[10px] font-bold uppercase tracking-widest">
              {redirectMessage}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-5 bg-white text-slate-900 rounded-2xl font-bold flex items-center justify-center gap-4 shadow-2xl active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-800 rounded-full animate-spin"></div> : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in with Google
              </>
            )}
          </button>

          <div className="flex items-center gap-4 py-4">
            <div className="h-px flex-1 bg-slate-800"></div>
            <span className="text-[9px] text-slate-600 font-black uppercase tracking-[0.4em]">Secure Access</span>
            <div className="h-px flex-1 bg-slate-800"></div>
          </div>

          <button 
            onClick={() => setAuthMode('PHONE_FORM')}
            className="w-full py-5 bg-slate-900 border border-slate-800 rounded-2xl font-bold text-slate-400 flex items-center justify-center gap-3 active:scale-95 transition-all hover:bg-slate-800"
          >
             <div className="scale-75 opacity-50"><Icons.Map /></div>
             <span>Use Phone Number</span>
          </button>
        </div>

        <button
          onClick={onBack}
          className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.4em] text-center hover:text-slate-500 transition-colors py-4 mt-4"
        >
          Cancel & Exit
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 animate-fadeIn py-6 px-1 max-w-sm mx-auto">
      <div className="text-center flex flex-col gap-2">
        <h2 className="text-3xl font-bold font-heading text-white">
          {isForgotPassword ? "Lost Access?" : isLogin ? "Welcome Back" : "New Journey"}
        </h2>
        <p className="text-slate-500 text-sm font-medium">Enter your details below.</p>
      </div>

      {!isForgotPassword && (
        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
          <button 
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}
          >
            Login
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}
          >
            Register
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl text-[11px] font-bold animate-shake text-center">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-2xl text-[11px] font-bold text-center">
          {successMsg}
        </div>
      )}

      <form onSubmit={handlePhoneAction} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase font-black text-slate-500 ml-1 tracking-widest">Phone Number</label>
          <div className="relative">
             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-sm">+91</span>
             <input
               type="tel"
               maxLength={10}
               required
               placeholder="9876543210"
               value={phone}
               onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
               className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-14 pr-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-all text-sm font-medium"
             />
          </div>
        </div>

        {!isForgotPassword && (
          <>
            {!isLogin && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-500 ml-1 tracking-widest">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. Rahul Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-all text-sm font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-500 ml-1 tracking-widest">Recovery Email</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-all text-sm font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-500 ml-1 tracking-widest">Gender</label>
                  <div className="flex gap-2">
                    {(['Male', 'Female', 'Other'] as Gender[]).map(g => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`flex-1 py-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${gender === g ? 'bg-blue-600/20 border-blue-500 text-blue-400' : 'bg-slate-900 border-slate-800 text-slate-600'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-black text-slate-500 ml-1 tracking-widest">Secret Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-all text-sm font-medium"
              />
              {isLogin && (
                <button 
                  type="button"
                  onClick={() => setIsForgotPassword(true)}
                  className="text-[10px] text-blue-500 font-bold uppercase tracking-widest self-end mt-1 hover:underline"
                >
                  Forgot Password?
                </button>
              )}
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl font-bold text-white shadow-xl neon-glow-blue flex items-center justify-center gap-3 active:scale-95 transition-all mt-4 disabled:opacity-50"
        >
          {loading ? <ProgressSpinner /> : <span>{isForgotPassword ? "Send Reset Link" : isLogin ? "Proceed" : "Create Account"}</span>}
        </button>

        <button 
          type="button"
          onClick={() => { setAuthMode('CHOICE'); setIsForgotPassword(false); }}
          className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center mt-2 hover:text-slate-400 py-4"
        >
          Back to Options
        </button>
      </form>
    </div>
  );
};

const ProgressSpinner = () => (
  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
);

export default ProfileEntry;
