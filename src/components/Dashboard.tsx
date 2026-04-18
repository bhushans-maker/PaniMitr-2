import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Cloud, Sun, ThermometerSun, Plus, BellRing, Bell, Snowflake, Droplets } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Dashboard() {
  const { weather, setWeather, getDailyGoal, getTodayIntake, addIntake, setAlarmRinging, getNextAlarmTime, isAlarmEnabled } = useStore();
  
  const goal = getDailyGoal();
  const intake = getTodayIntake();
  const percentage = Math.min(100, Math.round((intake / goal) * 100));
  const remaining = Math.max(0, goal - intake);

  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const [timeLeft, setTimeLeft] = useState<string>('');
  const [drops, setDrops] = useState<{ id: number; x: number; y: number }[]>([]);

  const handleAddIntake = (amount: number, e: React.MouseEvent) => {
    addIntake(amount);
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const id = Date.now();
    setDrops((prev) => [...prev, { id, x, y }]);
    setTimeout(() => {
      setDrops((prev) => prev.filter((d) => d.id !== id));
    }, 1000);
  };

  useEffect(() => {
    const updateTimer = () => {
      if (!isAlarmEnabled) {
        setTimeLeft('Disabled');
        return;
      }
      const nextAlarm = getNextAlarmTime();
      if (!nextAlarm) {
        setTimeLeft('Goal reached');
        return;
      }
      const diff = nextAlarm - Date.now();
      if (diff <= 0) {
        setTimeLeft('Due now');
      } else {
        const m = Math.floor(diff / 60000);
        const h = Math.floor(m / 60);
        if (h > 0) {
          setTimeLeft(`in ${h}h ${m % 60}m`);
        } else {
          setTimeLeft(`in ${m}m`);
        }
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 10000); // Update every 10s
    return () => clearInterval(interval);
  }, [getNextAlarmTime, intake, isAlarmEnabled]); // Re-run when intake or alarm status changes

  return (
    <div className="p-6 space-y-8 pt-12 relative">
      {/* Background Graphic */}
      <div className="absolute top-0 left-0 w-full h-64 overflow-hidden -z-10 opacity-[0.03] pointer-events-none">
        <svg viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-foreground fill-current">
          <path d="M 0,100 C 100,200 300,0 400,100 L 400,0 L 0,0 Z" />
          <circle cx="350" cy="150" r="40" />
          <circle cx="50" cy="250" r="20" />
          <circle cx="300" cy="300" r="60" />
        </svg>
      </div>

      {/* Header & Weather */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Today</h2>
            <p className="text-muted-foreground text-sm">Stay hydrated</p>
          </div>
        </div>
        
        <div className="flex bg-muted rounded-2xl p-1 gap-1">
          <button 
            onClick={() => setWeather('cold')}
            className={cn("flex-1 flex justify-center items-center gap-1.5 px-2 py-2.5 rounded-xl transition-colors", weather === 'cold' ? "bg-background shadow-sm text-blue-500" : "text-muted-foreground")}
          >
            <Snowflake className="w-4 h-4" />
            <span className="text-xs font-medium">Cold</span>
          </button>
          <button 
            onClick={() => setWeather('normal')}
            className={cn("flex-1 flex justify-center items-center gap-1.5 px-2 py-2.5 rounded-xl transition-colors", weather === 'normal' ? "bg-background shadow-sm text-primary" : "text-muted-foreground")}
          >
            <Cloud className="w-4 h-4" />
            <span className="text-xs font-medium">Normal</span>
          </button>
          <button 
            onClick={() => setWeather('hot')}
            className={cn("flex-1 flex justify-center items-center gap-1.5 px-2 py-2.5 rounded-xl transition-colors", weather === 'hot' ? "bg-background shadow-sm text-orange-500" : "text-muted-foreground")}
          >
            <Sun className="w-4 h-4" />
            <span className="text-xs font-medium">Hot</span>
          </button>
          <button 
            onClick={() => setWeather('very_hot')}
            className={cn("flex-1 flex justify-center items-center gap-1.5 px-2 py-2.5 rounded-xl transition-colors", weather === 'very_hot' ? "bg-background shadow-sm text-red-500" : "text-muted-foreground")}
          >
            <ThermometerSun className="w-4 h-4" />
            <span className="text-xs font-medium">Very Hot</span>
          </button>
        </div>
      </div>

      {/* Circular Progress */}
      <div className="relative flex justify-center items-center py-8">
        <div className="relative w-72 h-72">
          {/* Wave Animation Background */}
          <div className="absolute inset-4 rounded-full overflow-hidden bg-primary/5">
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-primary/10"
              initial={{ height: '0%' }}
              animate={{ height: `${percentage}%` }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              <motion.div
                className="absolute top-0 left-0 w-[200%] h-20 -translate-y-1/2"
                animate={{
                  x: ["0%", "-50%"],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "linear",
                }}
              >
                <svg viewBox="0 0 1000 100" preserveAspectRatio="none" className="w-full h-full fill-primary/20">
                  <path d="M0,50 C150,100 350,0 500,50 C650,100 850,0 1000,50 L1000,100 L0,100 Z" />
                </svg>
              </motion.div>
            </motion.div>
          </div>

          <svg className="w-full h-full transform -rotate-90 relative z-10">
            <circle
              cx="144"
              cy="144"
              r={radius}
              className="stroke-muted fill-none"
              strokeWidth="16"
            />
            <circle
              cx="144"
              cy="144"
              r={radius}
              className="stroke-primary fill-none transition-all duration-1000 ease-out"
              strokeWidth="16"
              strokeLinecap="round"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-20">
            <motion.span 
              key={intake}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-5xl font-bold tracking-tighter"
            >
              {intake}
            </motion.span>
            <span className="text-muted-foreground font-medium uppercase tracking-widest text-xs mt-1">/ {goal} ml</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card border border-border/50 rounded-2xl p-4 text-center">
          <p className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black mb-1">Remaining</p>
          <p className="text-2xl font-black tracking-tight">{remaining} ml</p>
        </div>
        <div className="bg-card border border-border/50 rounded-2xl p-4 text-center">
          <p className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] font-black mb-1">Ideal Intake</p>
          <p className="text-2xl font-black tracking-tight">{goal} ml</p>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="space-y-3 relative z-10">
        <div className="flex justify-between items-end px-1">
          <p className="text-sm font-medium text-muted-foreground">Quick Log</p>
          {/* Next Alarm Pill */}
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full">
            <Bell className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">{timeLeft}</span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[100, 150, 250, 500].map((amount) => (
            <button
              key={amount}
              onClick={(e) => handleAddIntake(amount, e)}
              className="relative overflow-hidden flex flex-col items-center justify-center bg-card border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-colors rounded-2xl py-3 gap-1.5"
            >
              <Plus className="w-4 h-4 text-primary" />
              <span className="font-semibold text-[11px]">{amount} ml</span>
              
              <AnimatePresence>
                {drops.map((drop) => (
                  <motion.div
                    key={drop.id}
                    initial={{ scale: 0, opacity: 1, y: 0 }}
                    animate={{ scale: 2, opacity: 0, y: -50 }}
                    exit={{ opacity: 0 }}
                    className="absolute pointer-events-none"
                    style={{ left: drop.x, top: drop.y }}
                  >
                    <Droplets className="w-4 h-4 text-primary fill-current" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </button>
          ))}
        </div>
      </div>

      {/* Test Alarm Button */}
      <div className="pt-4">
        <button 
          onClick={() => setAlarmRinging(true)}
          className="w-full flex items-center justify-center gap-2 bg-muted text-muted-foreground hover:text-foreground py-3 rounded-xl text-sm font-medium transition-colors"
        >
          <BellRing className="w-4 h-4" />
          Test Alarm Screen
        </button>
      </div>
    </div>
  );
}
