import React, { useState } from 'react';
import { useStore, Gender } from '../store/useStore';
import { Droplets } from 'lucide-react';

export default function Onboarding() {
  const setProfile = useStore((state) => state.setProfile);
  
  const [gender, setGender] = useState<Gender>('male');
  const [weight, setWeight] = useState<number>(70);
  const [height, setHeight] = useState<number>(170);
  const [age, setAge] = useState<number>(25);
  const [wakeTime, setWakeTime] = useState<string>('07:00');
  const [sleepTime, setSleepTime] = useState<string>('23:00');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProfile({
      gender,
      weight,
      height,
      age,
      wakeTime,
      sleepTime
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 max-w-md mx-auto relative overflow-hidden">
      {/* Background Graphics */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-[0.05] pointer-events-none">
        <svg viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-foreground fill-current">
          <circle cx="50" cy="100" r="80" />
          <circle cx="350" cy="300" r="120" />
          <circle cx="100" cy="600" r="100" />
          <path d="M 0,400 Q 100,300 200,400 T 400,400" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M 0,450 Q 100,350 200,450 T 400,450" fill="none" stroke="currentColor" strokeWidth="2" />
        </svg>
      </div>

      <div className="w-full max-w-sm space-y-8 relative z-10">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <Droplets className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Water Reminder</h1>
          <p className="text-muted-foreground text-sm">Let's personalize your hydration goal.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Gender</label>
              <div className="grid grid-cols-3 gap-2">
                {(['male', 'female', 'other'] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 px-4 rounded-xl text-sm font-medium capitalize transition-colors ${
                      gender === g 
                        ? 'bg-primary text-primary-foreground' 
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
                <label className="text-sm font-medium">Weight (kg)</label>
                <input 
                  type="number" 
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full bg-muted border-none rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none"
                  required
                  min="20"
                  max="300"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Height (cm)</label>
                <input 
                  type="number" 
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full bg-muted border-none rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none"
                  required
                  min="100"
                  max="250"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Age</label>
              <input 
                type="number" 
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full bg-muted border-none rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none"
                required
                min="5"
                max="120"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Wake up time</label>
                <input 
                  type="time" 
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="w-full bg-muted border-none rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sleep time</label>
                <input 
                  type="time" 
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  className="w-full bg-muted border-none rounded-xl px-4 py-3 text-foreground focus:ring-2 focus:ring-primary outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary text-primary-foreground font-semibold rounded-xl py-4 hover:opacity-90 transition-opacity"
          >
            Start Hydrating
          </button>
        </form>
      </div>
    </div>
  );
}
