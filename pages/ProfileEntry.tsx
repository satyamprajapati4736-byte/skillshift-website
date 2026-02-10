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
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  
  // Form fields
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [gender, setGender] = useState<Gender>('Other');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      if (isForgotPassword) {
        if (!phone || phone.length < 10) throw new Error("Please enter a valid 10-digit phone number.");
        await authService.resetPassword(phone);
        setSuccessMsg("Password reset link aapke registered recovery email par bhej diya gaya hai.");
        setTimeout(() => setIsForgotPassword(false), 3000);
      } else if (isLogin) {
        if (!phone || !password) throw new Error("Phone and password are required.");
        const user = await authService.signInWithPhone(phone, password);
        onSuccess(user);
      } else {
        if (!phone || !password || !name || !recoveryEmail) throw new Error("Saari details bharna zaroori hai.");
        if (phone.length !== 10) throw new Error("Phone number 10 digits ka hona chahiye.");
        const user = await authService.signUpWithPhone(name, phone, gender, password, recoveryEmail);
        onSuccess(user);
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 animate-fadeIn py-6 px-1">
      {/* Header */}
      <div className="text-center flex flex-col gap-2">
        {redirectMessage && (
          <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 text-xs font-bold animate-slideDown">
            {redirectMessage}
          </div>
        )}
        <h2 className="text-4xl font-bold font-heading text-white">
          {isForgotPassword ? "Reset Password" : isLogin ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-slate-500 text-sm">
          {isForgotPassword 
            ? "Enter your phone to get reset link." 
            : isLogin ? "Login using your phone number." : "Join SkillShift to build your future."}
        </p>
      </div>

      {/* Toggle Tabs */}
      {!isForgotPassword && (
        <div className="flex bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800">
          <button 
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}
          >
            Login
          </button>
          <button 
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${!isLogin ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500'}`}
          >
            Sign Up
          </button>
        </div>
      )}

      {/* Form Errors / Success */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl text-[11px] font-bold animate-shake text-center">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-4 rounded-2xl text-[11px] font-bold text-center">
          {successMsg}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleAction} className="flex flex-col gap-5">
        
        {/* Phone Input (Common) */}
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
               className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-14 pr-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-all text-sm"
             />
          </div>
        </div>

        {!isForgotPassword && (
          <>
            {/* Signup Only Fields */}
            {!isLogin && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-black text-slate-500 ml-1 tracking-widest">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-all text-sm"
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-all text-sm"
                  />
                  <p className="text-[9px] text-slate-600 ml-1 italic">* Password bhoolne par ispar reset link aayega.</p>
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

            {/* Password Field (Common Login/Signup) */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-black text-slate-500 ml-1 tracking-widest">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-all text-sm"
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl font-bold text-white shadow-xl neon-glow-blue flex items-center justify-center gap-3 active:scale-95 transition-all mt-4 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          ) : (
            <>
              <span>{isForgotPassword ? "Send Reset Link" : isLogin ? "Login Now" : "Create My Account"}</span>
              <Icons.ArrowRight />
            </>
          )}
        </button>

        {isForgotPassword && (
          <button 
            type="button"
            onClick={() => setIsForgotPassword(false)}
            className="text-[10px] text-slate-600 font-bold uppercase tracking-widest text-center mt-2 hover:text-slate-400"
          >
            Back to Login
          </button>
        )}
      </form>

      <button
        onClick={onBack}
        className="text-[10px] font-bold text-slate-700 uppercase tracking-[0.4em] text-center hover:text-slate-500 transition-colors py-4 mt-4"
      >
        Go Back
      </button>

      <style>{`
        @keyframes shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-5px); } 75% { transform: translateX(5px); } }
        .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
      `}</style>
    </div>
  );
};

export default ProfileEntry;