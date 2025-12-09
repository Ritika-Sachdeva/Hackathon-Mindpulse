import React from 'react';
import type { MoodEntry, User } from '../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Calendar, Moon, Zap, Activity } from 'lucide-react';

interface PersonalDashboardProps {
  entries: MoodEntry[];
  user: User;
}

const PersonalDashboard: React.FC<PersonalDashboardProps> = ({ entries, user }) => {
  const myEntries = entries.filter(e => e.userId === user.id);
  
  const chartData = myEntries.slice(-7).map(e => ({
    date: new Date(e.timestamp).toLocaleDateString(undefined, { weekday: 'short' }),
    stress: e.stressLevel,
    energy: e.energyLevel,
    sleep: e.sleepQuality
  }));

  const lastEntry = myEntries[myEntries.length - 1];

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
                <h2 className="text-xl font-bold text-gray-800">Welcome back, {user.name.split(' ')[0]}</h2>
                <p className="text-gray-500 text-sm">Here is your personal wellness overview.</p>
            </div>
            <img src={user.avatar} alt="Profile" className="w-12 h-12 rounded-full border-2 border-indigo-100" />
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                 <Activity className="w-6 h-6 text-red-500 mx-auto mb-2" />
                 <div className="text-2xl font-bold text-gray-800">{lastEntry?.stressLevel ?? '-'}<span className="text-xs text-gray-400 font-normal">/10</span></div>
                 <div className="text-xs uppercase font-bold text-gray-400">Stress</div>
            </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                 <Zap className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                 <div className="text-2xl font-bold text-gray-800">{lastEntry?.energyLevel ?? '-'}<span className="text-xs text-gray-400 font-normal">/10</span></div>
                 <div className="text-xs uppercase font-bold text-gray-400">Energy</div>
            </div>
             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-center">
                 <Moon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                 <div className="text-2xl font-bold text-gray-800">{lastEntry?.sleepQuality ?? '-'}<span className="text-xs text-gray-400 font-normal">/10</span></div>
                 <div className="text-xs uppercase font-bold text-gray-400">Sleep</div>
            </div>
        </div>

        {/* History Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Last 7 Entries
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} domain={[0, 10]} />
                        <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                        <Line type="monotone" dataKey="stress" stroke="#ef4444" strokeWidth={2} dot={{r: 4}} name="Stress" />
                        <Line type="monotone" dataKey="energy" stroke="#eab308" strokeWidth={2} dot={{r: 4}} name="Energy" />
                        <Line type="monotone" dataKey="sleep" stroke="#3b82f6" strokeWidth={2} dot={{r: 4}} name="Sleep" />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
        
        {/* Recent Suggestions */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6">
            <h3 className="font-semibold text-indigo-900 mb-4">Recent AI Suggestions</h3>
            <ul className="space-y-3">
                {myEntries.slice(-3).reverse().map(e => (
                    e.aiIntervention && (
                        <li key={e.id} className="flex gap-3 text-sm text-gray-700 bg-white p-3 rounded-lg shadow-sm">
                            <span className="text-xs text-gray-400 whitespace-nowrap">{new Date(e.timestamp).toLocaleDateString()}</span>
                            <span>{e.aiIntervention}</span>
                        </li>
                    )
                ))}
            </ul>
        </div>
    </div>
  );
};

export default PersonalDashboard;
