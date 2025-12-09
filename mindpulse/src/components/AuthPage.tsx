import React, { useState } from 'react';
import { apiLogin, apiSignup } from '../services/authService';
import type { User } from '../types';
import { Loader2, ArrowRight, Activity, Mail, Lock, User as UserIcon, Shield, Users } from 'lucide-react';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'member' | 'admin'>('member');
  const [groupCode, setGroupCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let user: User;
      if (isLogin) {
        user = await apiLogin(email, password);
      } else {
        user = await apiSignup(name, email, role, groupCode);
      }
      onLogin(user);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Demo helper
  const fillDemoData = () => {
    setEmail('alex@example.com');
    setPassword('password123');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row min-h-[600px] animate-fade-in">
        
        {/* Left Side: Brand & Visuals */}
        <div className="md:w-1/2 bg-gradient-to-br from-indigo-600 to-purple-700 p-12 flex flex-col justify-between text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-8">
               <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-white" />
               </div>
               <span className="text-2xl font-bold tracking-tight">MindPulse</span>
            </div>
            
            <h2 className="text-4xl font-bold leading-tight mb-6">
              {isLogin ? "Welcome back to your safe space." : "Join a community that cares."}
            </h2>
            <p className="text-indigo-100 text-lg opacity-90">
              Real-time emotional insights, burnout alerts, and AI-powered support for teams and families.
            </p>
          </div>

          <div className="relative z-10 mt-12 space-y-4">
             <div className="flex items-center gap-4 bg-white/10 backdrop-blur p-4 rounded-xl border border-white/10">
                <Shield className="w-6 h-6 text-indigo-300" />
                <div>
                    <h4 className="font-bold text-sm">Privacy First</h4>
                    <p className="text-xs text-indigo-200">Your emotional data is anonymized.</p>
                </div>
             </div>
          </div>

          {/* Abstract circles */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-purple-500 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-400 rounded-full blur-3xl opacity-30"></div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center bg-gray-50">
          <div className="mb-8 text-center md:text-left">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {isLogin ? "Log in to your account" : "Create new account"}
            </h3>
            <p className="text-gray-500">
              {isLogin ? "Don't have an account?" : "Already have an account?"} 
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="ml-2 text-indigo-600 font-bold hover:underline"
              >
                {isLogin ? "Sign up" : "Log in"}
              </button>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-white border border-gray-200 rounded-xl px-12 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-white border border-gray-200 rounded-xl px-12 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-gray-200 rounded-xl px-12 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">I am a...</label>
                  <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setRole('member')}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${role === 'member' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-600'}`}
                      >
                        Team Member
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('admin')}
                        className={`p-3 rounded-xl border text-sm font-medium transition-all ${role === 'admin' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-white border-gray-200 text-gray-600'}`}
                      >
                        Admin / HR
                      </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">
                      {role === 'admin' ? "Create Group ID" : "Enter Group ID to Join"}
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={groupCode}
                      onChange={(e) => setGroupCode(e.target.value.replace(/\s/g, '').toUpperCase())}
                      placeholder={role === 'admin' ? "e.g. MARKETING-TEAM" : "e.g. TEAM-CODE"}
                      className="w-full bg-white border border-gray-200 rounded-xl px-12 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all uppercase"
                    />
                  </div>
                  {role === 'admin' && <p className="text-xs text-gray-400 px-2">Members will use this ID to join your team.</p>}
                </div>
              </>
            )}

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                 {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-indigo-200"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  {isLogin ? "Sign In" : "Create Account"} <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {isLogin && (
            <div className="mt-6 text-center">
              <button onClick={fillDemoData} className="text-xs text-gray-400 hover:text-indigo-600 underline">
                Use Demo Credentials (alex@example.com)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;