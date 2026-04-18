import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Droplets, X } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

export default function AlarmScreen() {
  const { snoozeAlarm, setAlarmUIVisible, setActiveTab } = useStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleGoToLog = () => {
    setAlarmUIVisible(false);
    setActiveTab('dashboard');
  };

  return (
    <div className="fixed inset-0 z-50 bg-background text-foreground flex flex-col items-center justify-between py-12 px-6 overflow-hidden">
      {/* Crisp Background Graphics */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <svg className="w-full h-full opacity-15" viewBox="0 0 400 800" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <motion.path
            animate={{
              d: [
                "M0 400 Q100 350 200 400 T400 400 L400 800 L0 800 Z",
                "M0 400 Q100 450 200 400 T400 400 L400 800 L0 800 Z",
                "M0 400 Q100 350 200 400 T400 400 L400 800 L0 800 Z"
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            fill="url(#grad)"
          />
          <g stroke="var(--primary)" strokeWidth="0.5" fill="none" className="opacity-20">
            <circle cx="200" cy="400" r="100" />
            <circle cx="200" cy="400" r="150" />
            <circle cx="200" cy="400" r="200" />
          </g>
        </svg>
      </div>

      <div className="flex flex-col items-center space-y-1 relative z-10">
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-4xl font-light tracking-tighter"
        >
          {format(time, 'h:mm')}
          <span className="text-xl ml-1 font-normal">{format(time, 'a')}</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm text-primary tracking-[0.2em] uppercase font-black text-center px-4"
        >
          Chaituli It's time to drink water
        </motion.p>
      </div>

      <div className="flex-1 w-full flex flex-col items-center justify-center relative z-10">
        <div className="flex flex-col items-center gap-16">
          <div className="relative w-72 h-72 flex items-center justify-center">
            {/* Stylized Blue Double-Drop Interaction */}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGoToLog}
              className="relative z-10 w-64 h-64 flex items-center justify-center group cursor-pointer"
            >
              {/* Pulsing Background Glow for the Icon */}
              <div className="absolute inset-0 bg-primary/5 rounded-full blur-3xl animate-pulse" />
              
              {/* The Exact Droplets Icon (Matching Screenshot) */}
              <div className="relative w-32 h-32 flex items-center justify-center">
                <motion.div
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Droplets 
                    className="w-32 h-32 text-primary drop-shadow-[0_0_15px_var(--primary)]" 
                    strokeWidth={1} 
                  />
                </motion.div>
              </div>

              {/* Central Text Label (Matching Screenshot Style) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none translate-y-28">
                <motion.div
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="flex flex-col items-center"
                >
                  <span className="text-primary font-bold text-sm uppercase tracking-[0.3em]">
                    Log Intake
                  </span>
                </motion.div>
              </div>

              {/* Interactive Outer Ring */}
              <div className="absolute inset-0 border border-primary/20 rounded-full scale-110 group-hover:scale-125 transition-transform duration-700" />
            </motion.button>

            {/* Floating Blue Particles */}
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-primary/40 rounded-full"
                animate={{
                  y: [0, -180],
                  x: [0, (i % 2 === 0 ? 40 : -40) * Math.random()],
                  opacity: [0, 0.8, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: i * 0.6,
                  ease: "easeOut"
                }}
                style={{
                  left: `${35 + Math.random() * 30}%`,
                  bottom: '20%'
                }}
              />
            ))}
          </div>

          <motion.button 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            onClick={() => snoozeAlarm()}
            className="px-8 py-3 rounded-full bg-muted/50 hover:bg-muted border border-border/50 transition-all group"
          >
            <span className="text-[10px] text-muted-foreground group-hover:text-foreground font-bold uppercase tracking-[0.4em]">
              Snooze for 15m
            </span>
          </motion.button>
        </div>
      </div>

      <div className="text-center relative z-10">
        <p className="text-primary/60 text-[8px] font-black uppercase tracking-[0.5em] animate-pulse">
          Hydration Required
        </p>
      </div>
    </div>
  );
}
