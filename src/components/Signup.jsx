import React, { useState } from 'react';
import { Lock, Mail, User, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp, isConfigured, configError } = useAuth();

  // Password Strength Checker
  const getPasswordStrength = (pass) => {
    if (!pass) return { label: '', width: 'w-0', color: 'bg-slate-700' };
    if (pass.length < 6) return { label: 'Weak', width: 'w-1/3', color: 'bg-red-500' };
    if (pass.length < 10) return { label: 'Medium', width: 'w-2/3', color: 'bg-yellow-500' };
    return { label: 'Strong', width: 'w-full', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    if (!isConfigured) {
      setError(configError || 'Supabase is not configured. Check the VITE_SUPABASE values.');
      return;
    }

    setSubmitting(true);
    const result = isSignup
      ? await signUp(email, password, { full_name: fullName }, window.location.origin)
      : await signIn(email, password);
    setSubmitting(false);

    if (result.error) {
      setError(result.error.message);
    } else if (isSignup && !result.data.session) {
      setNotice('Account created. Check your email to confirm your account.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl">
        <div className="text-center mb-8">
          <div className="inline-flex bg-indigo-600/20 p-3 rounded-2xl text-indigo-400 mb-3">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {isSignup ? 'Create Account' : 'Welcome Back'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">Connect securely with MyChat PWA</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1 block">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Kamal GC"
                  required
                  className="w-full bg-slate-950 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full bg-slate-950 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 mb-1 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-950 border border-slate-800 text-white pl-11 pr-12 py-3 rounded-xl focus:outline-none focus:border-indigo-500 text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {isSignup && password && (
              <div className="mt-2">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strength.width} ${strength.color}`}></div>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block text-right">Strength: {strength.label}</span>
              </div>
            )}
          </div>

          {error && <p className="text-xs text-red-400">{error}</p>}
          {notice && <p className="text-xs text-emerald-400">{notice}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-indigo-600/30 text-sm"
          >
            {submitting ? 'Please wait...' : (isSignup ? 'Sign Up' : 'Sign In')}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="text-xs text-indigo-400 hover:underline"
          >
            {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
