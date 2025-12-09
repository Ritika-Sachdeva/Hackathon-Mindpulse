import React, { useState, useEffect } from 'react';
import type { MoodEntry, GroupAnalysis, User } from '../types';
import { generateGroupReport } from '../services/geminiService';
import { fetchGroupAnnouncement, updateGroupAnnouncement, sendGroupVibe } from '../services/dataService';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Sparkles, Activity, Users, Loader2, RefreshCw, Copy, Check, Shield, Sun, Cloud, CloudRain, CloudLightning, MessageCircle, Heart, Send } from 'lucide-react';

interface GroupDashboardProps {
  entries: MoodEntry[];
  currentUser: User;
  members: User[];
}

// Particle Component for Animation
const FloatingParticle: React.FC<{ left: number; delay: number }> = ({ left, delay }) => (
  <div 
    className="absolute bottom-0 text-pink-500 animate-float-up pointer-events-none"
    style={{ 
      left: `${left}%`, 
      animationDelay: `${delay}ms`,
      opacity: 0 
    }}
  >
    <Heart className="w-6 h-6 fill-pink-500" />
  </div>
);

const GroupDashboard: React.FC<GroupDashboardProps> = ({ entries, currentUser, members }) => {
  const [analysis, setAnalysis] = useState<GroupAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Announcement & Vibe State
  const [announcement, setAnnouncement] = useState('');
  const [vibeCount, setVibeCount] = useState(0);
  const [userVibedToday, setUserVibedToday] = useState(false);
  const [isEditingAnnouncement, setIsEditingAnnouncement] = useState(false);
  const [isSavingAnnouncement, setIsSavingAnnouncement] = useState(false);
  
  // Animation State
  const [particles, setParticles] = useState<{id: number, left: number, delay: number}[]>([]);

  const isAdmin = currentUser.role === 'admin';

  // Load announcement and vibes from backend
  const loadGroupData = async () => {
    if (currentUser.groupId) {
      const data = await fetchGroupAnnouncement(currentUser.groupId, currentUser.id);
      setAnnouncement(data.announcement);
      setVibeCount(data.vibes);
      setUserVibedToday(data.userVibedToday);
    }
  };

  useEffect(() => {
    loadGroupData();
  }, [currentUser.groupId, currentUser.id]);

  const saveAnnouncement = async () => {
    setIsSavingAnnouncement(true);
    await updateGroupAnnouncement(currentUser.groupId, announcement);
    setIsSavingAnnouncement(false);
    setIsEditingAnnouncement(false);
  };

  const handleSendVibe = async () => {
    if (userVibedToday) return;

    // 1. Optimistic UI: Trigger animation & lock immediately
    setUserVibedToday(true);
    setVibeCount(prev => prev + 1);

    // Generate particles
    const newParticles = Array.from({ length: 8 }).map((_, i) => ({
      id: Date.now() + i,
      left: 10 + Math.random() * 80,
      delay: Math.random() * 400
    }));
    setParticles(newParticles);
    
    // Clear particles after animation
    setTimeout(() => setParticles([]), 2000);

    // 2. API Call
    const newCount = await sendGroupVibe(currentUser.groupId, currentUser.id);
    
    // 3. Re-verify with backend to ensure consistency
    if (newCount !== null) {
      setVibeCount(newCount);
    } else {
        // Revert if failed
        setUserVibedToday(false);
        setVibeCount(prev => prev - 1);
    }
  };

  // Calculate stats
  const avgStress = entries.length > 0 ? (entries.reduce((acc, curr) => acc + curr.stressLevel, 0) / entries.length) : 0;
  const avgMood = entries.length > 0 ? (entries.reduce((acc, curr) => acc + (curr.sentimentScore || 0), 0) / entries.length) : 0;
  
  // Prepare chart data (Last 20 entries aggregated by day)
  const chartData = entries.slice(-20).map(e => ({
    date: new Date(e.timestamp).toLocaleDateString(undefined, { weekday: 'short' }),
    stress: e.stressLevel,
    energy: e.energyLevel,
    sentiment: ((e.sentimentScore || 0) * 5) + 5 // Normalize -1:1 to 0:10 for visual
  }));

  const handleGenerateReport = async () => {
    setLoading(true);
    const result = await generateGroupReport(entries);
    setAnalysis(result);
    setLoading(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(currentUser.groupId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-generate report on first load if not present (ONLY FOR ADMIN)
  useEffect(() => {
      if(isAdmin && !analysis && entries.length > 0) {
        handleGenerateReport();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  // Determine Team Weather (Vibe)
  const getTeamWeather = () => {
    if (avgStress > 7) return { icon: CloudLightning, color: 'text-yellow-600', bg: 'bg-yellow-50', label: 'Stormy', desc: 'High stress detected. Let\'s support each other.' };
    if (avgMood < -0.3) return { icon: CloudRain, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Rainy', desc: 'Mood is low. A good time for a team break.' };
    if (avgMood < 0.2) return { icon: Cloud, color: 'text-gray-600', bg: 'bg-gray-50', label: 'Cloudy', desc: 'Things are okay, but could be brighter.' };
    return { icon: Sun, color: 'text-orange-500', bg: 'bg-orange-50', label: 'Sunny', desc: 'Great vibes! The team is feeling positive.' };
  };

  const Weather = getTeamWeather();

  return (
    <div className="space-y-6 animate-fade-in w-full">
      <style>
        {`
          @keyframes float-up {
            0% { transform: translateY(0) scale(0.5); opacity: 1; }
            50% { opacity: 1; }
            100% { transform: translateY(-120px) scale(1.2); opacity: 0; }
          }
          .animate-float-up {
            animation: float-up 1.2s ease-out forwards;
          }
        `}
      </style>
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">{isAdmin ? "Team Pulse Command" : "My Team Community"}</h2>
           <p className="text-gray-500">
               {isAdmin ? "Admin Console for Group:" : "Connected with:"} <span className="font-semibold text-indigo-600">{currentUser.groupId}</span>
           </p>
        </div>
        {isAdmin && (
            <button 
                onClick={handleGenerateReport}
                disabled={loading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
                {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <RefreshCw className="w-4 h-4"/>}
                Refresh AI Analysis
            </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
          
          {/* Left Column: Team Identity & Roster */}
          <div className="space-y-6">
              {/* Team Code Card */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                 <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                     <Users className="w-4 h-4" /> {isAdmin ? "Manage Access" : "Team Access"}
                 </h3>
                 <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between gap-2 mb-4">
                     <span className="font-mono font-bold text-gray-700 tracking-wider text-lg">{currentUser.groupId}</span>
                     <button onClick={copyCode} className="text-gray-400 hover:text-indigo-600 transition-colors p-2 hover:bg-white rounded-md">
                         {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                     </button>
                 </div>
                 <p className="text-xs text-gray-400">Share this code to invite new members.</p>
              </div>

              {/* Roster */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Teammates ({members.length})</h3>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                      {members.map((m) => (
                          <div key={m.id} className="flex items-center justify-between group">
                              <div className="flex items-center gap-3">
                                  <div className="relative">
                                      <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-full border border-gray-100" />
                                      {m.role === 'admin' && (
                                          <div className="absolute -bottom-1 -right-1 bg-indigo-600 rounded-full p-0.5 border-2 border-white" title="Admin">
                                              <Shield className="w-2.5 h-2.5 text-white" />
                                          </div>
                                      )}
                                  </div>
                                  <div>
                                      <p className="text-sm font-medium text-gray-700">{m.name}</p>
                                      <p className="text-xs text-gray-400 capitalize">{m.role}</p>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* Right Column: Dashboards (Different for Admin vs Member) */}
          <div className="md:col-span-2 space-y-6">

              {/* Team Announcement / Tip Board */}
              <div className="bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-xl p-1 shadow-sm">
                  <div className="bg-white rounded-lg p-6 h-full">
                      <div className="flex items-center justify-between mb-4">
                          <h3 className="font-bold text-gray-800 flex items-center gap-2">
                              <MessageCircle className="w-5 h-5 text-fuchsia-500" />
                              {isAdmin ? "Team Announcement" : "Message from Lead"}
                          </h3>
                          {isAdmin && !isEditingAnnouncement && (
                              <button onClick={() => setIsEditingAnnouncement(true)} className="text-xs text-indigo-600 hover:underline">Edit</button>
                          )}
                      </div>
                      
                      {isEditingAnnouncement ? (
                          <div className="flex gap-2">
                              <input 
                                value={announcement}
                                onChange={(e) => setAnnouncement(e.target.value)}
                                placeholder="Share a motivational quote or update..."
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                              <button 
                                onClick={saveAnnouncement} 
                                disabled={isSavingAnnouncement}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
                              >
                                {isSavingAnnouncement ? <Loader2 className="w-4 h-4 animate-spin"/> : "Post"}
                              </button>
                          </div>
                      ) : (
                          <div className="bg-fuchsia-50 rounded-lg p-4 border border-fuchsia-100">
                              <p className="text-gray-700 italic">
                                  "{announcement || "No announcements today. Have a great one!"}"
                              </p>
                          </div>
                      )}
                  </div>
              </div>

              {/* === MEMBER VIEW: Vibe & Atmosphere === */}
              {!isAdmin && (
                  <div className="space-y-6">
                      {/* Weather Widget */}
                      <div className={`rounded-xl p-8 border-2 ${Weather.bg} ${Weather.color} border-white shadow-sm flex flex-col items-center text-center relative overflow-hidden`}>
                          <Weather.icon className="w-20 h-20 mb-4 opacity-80" />
                          <h3 className="text-3xl font-bold mb-2">{Weather.label}</h3>
                          <p className="text-gray-600 max-w-md mx-auto">{Weather.desc}</p>
                          
                          <div className="mt-8 bg-white/60 backdrop-blur-sm px-6 py-2 rounded-full border border-white flex items-center gap-3">
                             <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
                             <span className="font-bold text-gray-800">{vibeCount}</span>
                             <span className="text-gray-500 text-sm">Positive Vibes Shared</span>
                          </div>
                      </div>

                      {/* Engagement Prompt */}
                      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
                          {particles.map(p => (
                            <FloatingParticle key={p.id} left={p.left} delay={p.delay} />
                          ))}
                          
                          <div>
                              <h4 className="font-bold text-gray-800">Cheer up the team!</h4>
                              <p className="text-sm text-gray-500">
                                {userVibedToday 
                                  ? "Thanks for spreading positivity today! Come back tomorrow." 
                                  : "Send a quick motivation boost to everyone (Once a day)."}
                              </p>
                          </div>
                          <button 
                            onClick={handleSendVibe}
                            disabled={userVibedToday}
                            className={`relative flex items-center gap-2 px-6 py-3 rounded-full transition-all font-bold shadow-md transform active:scale-95 ${
                                userVibedToday 
                                ? 'bg-green-100 text-green-700 cursor-default border border-green-200 shadow-none scale-100' 
                                : 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white hover:shadow-lg border border-white/20'
                            }`}
                          >
                              {userVibedToday ? (
                                <>
                                  <Check className="w-5 h-5" /> Vibes Sent!
                                </>
                              ) : (
                                <>
                                  <Send className="w-5 h-5" /> Boost Team Spirit
                                </>
                              )}
                          </button>
                      </div>
                  </div>
              )}

              {/* === ADMIN VIEW: Deep Analytics === */}
              {isAdmin && (
                <>
                  {/* AI Analysis Card */}
                  <div className="bg-gradient-to-br from-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                    <Sparkles className="absolute top-4 right-4 text-indigo-400 opacity-20 w-32 h-32" />
                    
                    {loading ? (
                        <div className="h-48 flex flex-col items-center justify-center text-indigo-200">
                            <Loader2 className="w-8 h-8 animate-spin mb-2" />
                            <p>Gemini is analyzing group emotional patterns...</p>
                        </div>
                    ) : analysis ? (
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-indigo-500/30 border border-indigo-400/30 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider text-indigo-200">AI Insight</span>
                                        <span className="text-xs text-indigo-300">Updated: {new Date(analysis.lastUpdated).toLocaleTimeString()}</span>
                                    </div>
                                    <h3 className="text-xl font-semibold mb-3">{analysis.summary}</h3>
                                    <div className="space-y-2">
                                        {analysis.recommendations.map((rec, i) => (
                                            <div key={i} className="flex items-start gap-2 text-sm text-indigo-100 bg-white/5 p-2 rounded">
                                                <div className="mt-1 w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                                                {rec}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <div className="text-center bg-white/10 p-4 rounded-xl backdrop-blur-sm">
                                        <div className="text-3xl font-bold">{analysis.overallWellnessScore}</div>
                                        <div className="text-xs text-indigo-200 uppercase tracking-wide">Wellness Score</div>
                                    </div>
                                    <div className={`text-center p-4 rounded-xl backdrop-blur-sm border ${analysis.burnoutRiskLevel === 'High' ? 'bg-red-500/20 border-red-500/50' : 'bg-green-500/20 border-green-500/50'}`}>
                                        <div className={`text-3xl font-bold ${analysis.burnoutRiskLevel === 'High' ? 'text-red-300' : 'text-green-300'}`}>{analysis.burnoutRiskLevel}</div>
                                        <div className="text-xs text-indigo-200 uppercase tracking-wide">Burnout Risk</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-indigo-300">Click Refresh to generate analysis</div>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">
                            <Users className="w-4 h-4" /> Reports
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{entries.length}</div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">
                            <Activity className="w-4 h-4" /> Avg Stress
                        </div>
                        <div className={`text-2xl font-bold ${Number(avgStress) > 6 ? 'text-red-500' : 'text-gray-800'}`}>{avgStress.toFixed(1)}<span className="text-sm text-gray-400 font-normal">/10</span></div>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">
                            <Sparkles className="w-4 h-4" /> Avg Sentiment
                        </div>
                        <div className="text-2xl font-bold text-gray-800">{avgMood.toFixed(2)}</div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 text-gray-500 text-xs uppercase font-bold tracking-wider mb-1">
                            <Heart className="w-4 h-4 text-pink-500" /> Team Vibes
                        </div>
                        <div className="text-2xl font-bold text-pink-500">{vibeCount}</div>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-6">Weekly Emotional Trend</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} domain={[0, 10]} />
                                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                    <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} dot={{r: 4}} name="Stress" />
                                    <Line type="monotone" dataKey="energy" stroke="#eab308" strokeWidth={2} dot={{r: 4}} name="Energy" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="font-semibold text-gray-800 mb-6">Recent Sentiment Analysis</h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                                    <Bar dataKey="sentiment" radius={[4, 4, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.sentiment > 5 ? '#22c55e' : entry.sentiment < 4 ? '#ef4444' : '#94a3b8'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                  </div>
                </>
              )}
          </div>
      </div>
    </div>
  );
};

export default GroupDashboard;