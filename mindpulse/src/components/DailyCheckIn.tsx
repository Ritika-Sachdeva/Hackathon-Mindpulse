import React, { useState, useEffect } from 'react';
import { Mood } from '../types';
import type { MoodEntry } from '../types';
import { analyzeMoodEntry } from '../services/geminiService';
import { Smile, Meh, Frown, Sun, Moon, Battery, BatteryCharging, AlertCircle, CheckCircle, Loader2, WifiOff } from 'lucide-react';

interface DailyCheckInProps {
  userId: string;
  onSubmit: (entry: any) => void;
  existingEntry?: MoodEntry | null;
  onViewHistory?: () => void;
}

const MoodIcon: React.FC<{ mood: Mood; selected: boolean; onClick: () => void }> = ({ mood, selected, onClick }) => {
  const getIcon = () => {
    switch (mood) {
      case Mood.Great: return <Sun className="w-8 h-8 text-yellow-500" />;
      case Mood.Good: return <Smile className="w-8 h-8 text-green-500" />;
      case Mood.Neutral: return <Meh className="w-8 h-8 text-gray-500" />;
      case Mood.Bad: return <Frown className="w-8 h-8 text-orange-500" />;
      case Mood.Awful: return <Moon className="w-8 h-8 text-blue-900" />;
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-col items-center p-4 rounded-xl transition-all duration-200 ${
        selected ? 'bg-indigo-50 border-2 border-indigo-500 transform scale-105 shadow-md' : 'bg-white border border-gray-100 hover:bg-gray-50'
      }`}
    >
      {getIcon()}
      <span className="mt-2 text-xs font-medium text-gray-600">{mood}</span>
    </button>
  );
};

const DailyCheckIn: React.FC<DailyCheckInProps> = ({ userId, onSubmit, existingEntry, onViewHistory }) => {
  const [mood, setMood] = useState<Mood>(Mood.Neutral);
  const [stress, setStress] = useState<number>(5);
  const [energy, setEnergy] = useState<number>(5);
  const [sleep, setSleep] = useState<number>(7);
  const [note, setNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<{ intervention: string; burnout: boolean; tags?: string[] } | null>(null);

  // If passed an existing entry, show the result immediately
  useEffect(() => {
    if (existingEntry) {
      setLastResult({
        intervention: existingEntry.aiIntervention || "You've already checked in today.",
        burnout: existingEntry.burnoutRisk || false,
        tags: existingEntry.tags
      });
    }
  }, [existingEntry]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (existingEntry) return; // double safety

    setIsSubmitting(true);
    setLastResult(null);

    try {
      // 1. Analyze with Gemini
      const analysis = await analyzeMoodEntry(note, stress);

      // 2. Construct Entry
      const newEntry = {
        id: Date.now().toString(),
        userId,
        timestamp: new Date().toISOString(),
        mood,
        stressLevel: stress,
        energyLevel: energy,
        sleepQuality: sleep,
        note,
        sentimentScore: analysis.sentimentScore,
        burnoutRisk: analysis.burnoutRisk,
        aiIntervention: analysis.aiIntervention,
        tags: analysis.tags
      };

      // 3. Callback
      onSubmit(newEntry);
      
      // 4. Show immediate feedback
      setLastResult({
        intervention: analysis.aiIntervention,
        burnout: analysis.burnoutRisk,
        tags: analysis.tags
      });

      // Reset form (partial)
      setNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (lastResult) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-3xl mx-auto text-center animate-fade-in">
        <div className="mb-4 flex justify-center">
          {lastResult.burnout ? (
            <AlertCircle className="w-16 h-16 text-red-500" />
          ) : (
            <CheckCircle className="w-16 h-16 text-green-500" />
          )}
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Check-in Complete</h2>
        <p className="text-gray-600 mb-6">Thanks for logging your day. Your wellbeing matters.</p>
        
        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl mb-6 text-left">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-200 px-2 py-1 rounded">AI Suggestion</span>
            {lastResult.tags?.includes("Offline Mode") && (
                 <span className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-gray-600 bg-gray-200 px-2 py-1 rounded">
                    <WifiOff className="w-3 h-3" /> Offline Mode
                 </span>
            )}
          </div>
          <p className="text-indigo-900 font-medium text-lg">"{lastResult.intervention}"</p>
        </div>

        <button 
          onClick={onViewHistory}
          className="bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors w-full font-medium"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden w-full">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h2 className="text-2xl font-bold">Daily Wellness Check-in</h2>
          <p className="opacity-90">How are you feeling today, really?</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          
          {/* Mood Section */}
          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-4">Current Mood</label>
            <div className="grid grid-cols-5 gap-2 md:gap-4">
              {Object.values(Mood).map((m) => (
                <MoodIcon key={m} mood={m} selected={mood === m} onClick={() => setMood(m)} />
              ))}
            </div>
          </section>

          {/* Sliders Section */}
          <div className="grid md:grid-cols-2 gap-8">
            <section>
              <label className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                <span>Stress Level</span>
                <span className={`px-2 py-0.5 rounded text-xs ${stress > 7 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}`}>{stress}/10</span>
              </label>
              <input 
                type="range" min="1" max="10" value={stress} onChange={(e) => setStress(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Zen</span>
                <span>Panic</span>
              </div>
            </section>

            <section>
              <label className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                <span>Energy Level</span>
                <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">{energy}/10</span>
              </label>
              <input 
                type="range" min="1" max="10" value={energy} onChange={(e) => setEnergy(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Drained</span>
                <span>Hyper</span>
              </div>
            </section>
            
            <section className="md:col-span-2">
               <label className="flex justify-between text-sm font-semibold text-gray-700 mb-2">
                <span>Sleep Quality (Last Night)</span>
                <span className="px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">{sleep}/10</span>
              </label>
               <input 
                type="range" min="1" max="10" value={sleep} onChange={(e) => setSleep(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
               <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Insomnia</span>
                <span>Deep Rest</span>
              </div>
            </section>
          </div>

          {/* Note Section */}
          <section>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Journal / Notes</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Briefly describe why you feel this way... (AI will analyze this for stress signals)"
              className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-h-[100px]"
            />
            <p className="text-xs text-gray-400 mt-2 text-right">Privacy protected. AI analysis is anonymous.</p>
          </section>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gray-900 text-white font-bold py-4 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Analyzing...
              </>
            ) : (
              "Log Check-in"
            )}
          </button>

        </form>
      </div>
    </div>
  );
};

export default DailyCheckIn;