import { useStore, Theme, Gender } from '../store/useStore';
import { Moon, Sun, Droplet, Music, User, RotateCcw, Clock, ChevronRight, BellRing } from 'lucide-react';
import { alarmManager } from '../lib/alarm';

export default function Settings() {
  const { theme, setTheme, alarmTune, setAlarmTune, setProfile, profile, updateProfile, isAlarmEnabled, setAlarmEnabled } = useStore();

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset your profile?")) {
      setProfile(null as any); // This will trigger onboarding
    }
  };

  const handleTuneSelect = (tuneId: string) => {
    setAlarmTune(tuneId);
    alarmManager.preview(tuneId);
  };

  return (
    <div className="p-6 space-y-8 pt-12 relative overflow-hidden min-h-full">
      {/* Background Graphics */}
      <div className="absolute top-0 right-0 w-64 h-64 -z-10 opacity-[0.03] pointer-events-none">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-foreground fill-current">
          <path d="M 100,0 A 100,100 0 1,1 100,200 A 100,100 0 1,1 100,0 Z" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M 100,20 A 80,80 0 1,1 100,180 A 80,80 0 1,1 100,20 Z" fill="none" stroke="currentColor" strokeWidth="1" />
          <circle cx="100" cy="100" r="10" />
        </svg>
      </div>

      <div className="relative z-10">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground text-sm">Customize your experience</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">My Profile</h3>
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden p-4 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Gender</label>
              <div className="grid grid-cols-3 gap-2">
                {(['male', 'female', 'other'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => updateProfile({ gender: g })}
                    className={`py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                      profile?.gender === g 
                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' 
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Weight (kg)</label>
                <input 
                  type="number" 
                  value={profile?.weight || 70}
                  onChange={(e) => updateProfile({ weight: Number(e.target.value) })}
                  className="w-full bg-muted border-none rounded-xl px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Height (cm)</label>
                <input 
                  type="number" 
                  value={profile?.height || 170}
                  onChange={(e) => updateProfile({ height: Number(e.target.value) })}
                  className="w-full bg-muted border-none rounded-xl px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Age</label>
              <input 
                type="number" 
                value={profile?.age || 25}
                onChange={(e) => updateProfile({ age: Number(e.target.value) })}
                className="w-full bg-muted border-none rounded-xl px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* Reminder Settings */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">Reminders</h3>
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BellRing className={`w-5 h-5 ${isAlarmEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="flex flex-col">
                  <span className="font-medium">Water Reminders</span>
                  <span className="text-[10px] text-muted-foreground">Enable or disable all alarms</span>
                </div>
              </div>
              <button 
                onClick={() => setAlarmEnabled(!isAlarmEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none ${isAlarmEnabled ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${isAlarmEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Theme Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">Appearance</h3>
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            {(['light', 'dark', 'blue'] as Theme[]).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className="w-full flex items-center justify-between p-4 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {t === 'light' && <Sun className="w-5 h-5 text-muted-foreground" />}
                  {t === 'dark' && <Moon className="w-5 h-5 text-muted-foreground" />}
                  {t === 'blue' && <Droplet className="w-5 h-5 text-muted-foreground" />}
                  <span className="capitalize font-medium">{t} Mode</span>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${theme === t ? 'border-primary' : 'border-muted-foreground'}`}>
                  {theme === t && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Settings */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">Schedule</h3>
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Wake Time</span>
              </div>
              <input 
                type="time" 
                value={profile?.wakeTime || '07:00'}
                onChange={(e) => updateProfile({ wakeTime: e.target.value })}
                className="bg-muted border-none rounded-lg px-3 py-1.5 text-foreground focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-muted-foreground" />
                <span className="font-medium">Sleep Time</span>
              </div>
              <input 
                type="time" 
                value={profile?.sleepTime || '23:00'}
                onChange={(e) => updateProfile({ sleepTime: e.target.value })}
                className="bg-muted border-none rounded-lg px-3 py-1.5 text-foreground focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
        </div>

        {/* Alarm Tune Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">Alarm Sound</h3>
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            {[
              { id: 'tune1', name: 'Morning Breeze' },
              { id: 'tune2', name: 'Marimba Flow' },
              { id: 'tune3', name: 'Gentle Chimes' },
              { id: 'tune4', name: 'Zen Garden' },
              { id: 'tune5', name: 'Deep Resonance' },
              { id: 'tune6', name: 'Cosmic Journey' },
              { id: 'tune7', name: 'Forest Dawn' },
              { id: 'tune8', name: 'Crystal Cave' }
            ].map((tune) => (
              <button
                key={tune.id}
                onClick={() => handleTuneSelect(tune.id)}
                className="w-full flex items-center justify-between p-4 border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Music className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">{tune.name}</span>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${alarmTune === tune.id ? 'border-primary' : 'border-muted-foreground'}`}>
                  {alarmTune === tune.id && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Profile Actions */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">Account</h3>
          <div className="bg-card border border-border/50 rounded-2xl overflow-hidden">
            <button
              onClick={handleReset}
              className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-red-500"
            >
              <RotateCcw className="w-5 h-5" />
              <span className="font-medium">Reset Profile</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
