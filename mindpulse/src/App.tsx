import React, { useState, useEffect } from 'react';
import { APP_NAME } from './constants';
import type { MoodEntry, User } from './types';
import { getSession, apiLogout, getGroupMembers } from './services/authService';
import { fetchEntries, createEntry } from './services/dataService';
import DailyCheckIn from './components/DailyCheckIn';
import GroupDashboard from './components/GroupDashboard';
import PersonalDashboard from './components/PersonalDashboard';
import AIChat from './components/AIChat';
import CounselingSupport from './components/CounselingSupport';
import AuthPage from './components/AuthPage';
import { LayoutDashboard, PenTool, MessageSquare, BarChart2, LogOut, Phone, Loader2, Menu, X } from 'lucide-react';

type Tab = 'checkin' | 'personal' | 'team' | 'chat' | 'counseling';

const App: React.FC = () => {
  // Application State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('checkin');
  const [teamMembers, setTeamMembers] = useState<User[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const sessionUser = getSession();
    if (sessionUser) {
      setCurrentUser(sessionUser);
    }
    setLoadingSession(false);
  }, []);

  // Fetch data (Team Members & Mood Entries) when user is logged in
  useEffect(() => {
    const loadData = async () => {
        if (currentUser && currentUser.groupId) {
            // 1. Fetch Members
            const members = await getGroupMembers(currentUser.groupId);
            setTeamMembers(members);

            // 2. Fetch Entries
            const data = await fetchEntries();
            setEntries(data);
        }
    };
    loadData();
  }, [currentUser]);

  // Helper to check if two dates are the same calendar day
  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  // Calculate if the current user has already checked in today
  const todayEntry = entries.find(e => {
    if (e.userId !== currentUser?.id) return false;
    const entryDate = new Date(e.timestamp);
    const today = new Date();
    return isSameDay(entryDate, today);
  }) || null;

  const handleNewEntry = async (entry: MoodEntry) => {
    // Optimistic Update
    setEntries(prev => [...prev, entry]);
    
    // Save to Backend
    await createEntry(entry);
    
    // We do NOT redirect instantly anymore. The DailyCheckIn component shows a success screen.
    // setActiveTab('personal'); 
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab('checkin');
  };

  const handleLogout = async () => {
    await apiLogout();
    setCurrentUser(null);
    setEntries([]);
  };

  // Close sidebar when a tab is selected on mobile
  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    setIsSidebarOpen(false);
  };

  const NavButton = ({ tab, label, icon: Icon }: { tab: Tab; label: string; icon: any }) => (
    <button
      onClick={() => handleTabClick(tab)}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all w-full text-left font-medium ${
        activeTab === tab
          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="inline">{label}</span>
    </button>
  );

  if (loadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  // If no user is logged in, show Auth Page
  if (!currentUser) {
    return <AuthPage onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-50 h-16 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-100"
            aria-label="Toggle Menu"
          >
            {isSidebarOpen ? <X className="w-6 h-6 text-indigo-600" /> : <Menu className="w-6 h-6 text-gray-700" />}
          </button>
          <span className="text-lg font-bold text-gray-800 tracking-tight">{APP_NAME}</span>
        </div>
        <img src={currentUser.avatar} className="w-8 h-8 rounded-full border border-gray-200" alt="avatar" />
      </div>

      <div className="flex flex-1 relative overflow-hidden">
        {/* Sidebar Navigation */}
        <aside 
          className={`
            fixed md:static inset-y-0 left-0 z-40 bg-white border-r border-gray-200 flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-xl md:shadow-none
            w-64 h-full md:h-auto
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            top-16 md:top-0 /* On mobile, sit below the 16 (4rem) header */
          `}
        >
          <div className="flex flex-col h-full">
            {/* Desktop Brand Header (Hidden on Mobile as it's in the top bar) */}
            <div className="hidden md:flex p-6 items-center gap-3 border-b border-gray-100">
              <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                M
              </div>
              <span className="text-xl font-bold text-gray-800 tracking-tight">{APP_NAME}</span>
            </div>

            <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
              <NavButton tab="checkin" label="Daily Check-in" icon={PenTool} />
              <NavButton tab="personal" label="My Wellness" icon={LayoutDashboard} />
              <NavButton 
                tab="team" 
                label={currentUser.role === 'admin' ? "Team Pulse" : "My Team"} 
                icon={BarChart2} 
              />
              <NavButton tab="chat" label="AI Support" icon={MessageSquare} />
              <NavButton tab="counseling" label="Talk to Expert" icon={Phone} />
            </nav>

            {/* User Profile Footer (Visible on both mobile/desktop sidebar) */}
            <div className="p-4 border-t border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-3 mb-4">
                  <img src={currentUser.avatar} className="w-10 h-10 rounded-full border border-gray-200" alt="avatar" />
                  <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-800 truncate">{currentUser.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{currentUser.role} Account</p>
                  </div>
              </div>
              
              <button 
                onClick={handleLogout}
                className="w-full text-xs flex items-center justify-center gap-2 border border-red-200 bg-red-50 p-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
              >
                  <LogOut className="w-3 h-3" />
                  Sign Out
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0 bg-gray-50 h-[calc(100vh-64px)] md:h-screen overflow-y-auto">
          <div className="p-4 md:p-8">
            {activeTab === 'checkin' && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full">
                 <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Good Morning, {currentUser.name.split(' ')[0]}</h1>
                    <p className="text-gray-500">Take a moment to reflect on how you're doing today.</p>
                 </div>
                 <DailyCheckIn 
                    userId={currentUser.id} 
                    onSubmit={handleNewEntry} 
                    existingEntry={todayEntry}
                    onViewHistory={() => setActiveTab('personal')}
                 />
              </div>
            )}

            {activeTab === 'personal' && (
               <PersonalDashboard entries={entries} user={currentUser} />
            )}

            {activeTab === 'team' && (
                <GroupDashboard 
                    entries={entries.filter(e => teamMembers.some(m => m.id === e.userId))} 
                    currentUser={currentUser}
                    members={teamMembers}
                />
            )}

            {activeTab === 'chat' && (
                <div className="w-full h-full">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900">MindPulse Assistant</h1>
                        <p className="text-gray-500">A safe space to talk anytime.</p>
                    </div>
                    <AIChat />
                </div>
            )}

            {activeTab === 'counseling' && (
               <CounselingSupport />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;