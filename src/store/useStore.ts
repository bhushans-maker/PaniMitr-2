import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { startOfDay, format } from 'date-fns';

export type Gender = 'male' | 'female' | 'other';
export type Weather = 'cold' | 'normal' | 'hot' | 'very_hot';
export type Theme = 'light' | 'dark' | 'blue';

export interface UserProfile {
  gender: Gender;
  weight: number; // kg
  height: number; // cm
  age: number;
  wakeTime: string; // HH:mm
  sleepTime: string; // HH:mm
}

export interface IntakeRecord {
  id: string;
  amount: number; // ml
  timestamp: number;
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  totalIntake: number;
  goal: number;
}

interface AppState {
  profile: UserProfile | null;
  weather: Weather;
  theme: Theme;
  alarmTune: string;
  intakeRecords: IntakeRecord[];
  dailyHistory: Record<string, DailyRecord>;
  isAlarmRinging: boolean;
  isAlarmUIVisible: boolean;
  isAlarmEnabled: boolean;
  snoozedUntil: number | null;
  alarmAmount: number;
  
  activeTab: 'dashboard' | 'history' | 'settings';
  
  // Actions
  setActiveTab: (tab: 'dashboard' | 'history' | 'settings') => void;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setWeather: (weather: Weather) => void;
  setTheme: (theme: Theme) => void;
  setAlarmTune: (tune: string) => void;
  setAlarmEnabled: (enabled: boolean) => void;
  addIntake: (amount: number) => void;
  setAlarmRinging: (isRinging: boolean) => void;
  setAlarmUIVisible: (isVisible: boolean) => void;
  snoozeAlarm: () => void;
  setAlarmAmount: (amount: number) => void;
  getDailyGoal: () => number;
  getTodayIntake: () => number;
  getNextAlarmTime: () => number | null;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      profile: null,
      weather: 'normal',
      theme: 'dark',
      alarmTune: 'tune1',
      intakeRecords: [],
      dailyHistory: {},
      isAlarmRinging: false,
      isAlarmUIVisible: false,
      isAlarmEnabled: true,
      snoozedUntil: null,
      alarmAmount: 250,
      activeTab: 'dashboard',

      setProfile: (profile) => set({ profile }),
      setActiveTab: (activeTab) => set({ activeTab }),
      updateProfile: (updates) => set((state) => ({ 
        profile: state.profile ? { ...state.profile, ...updates } : null 
      })),
      setWeather: (weather) => set({ weather }),
      setTheme: (theme) => set({ theme }),
      setAlarmTune: (alarmTune) => set({ alarmTune }),
      setAlarmEnabled: (isAlarmEnabled) => set({ isAlarmEnabled }),
      
      addIntake: (amount) => {
        const now = Date.now();
        const todayStr = format(now, 'yyyy-MM-dd');
        const newRecord: IntakeRecord = { id: Math.random().toString(36).substring(7), amount, timestamp: now };
        
        set((state) => {
          const goal = get().getDailyGoal();
          const currentDaily = state.dailyHistory[todayStr] || { date: todayStr, totalIntake: 0, goal };
          
          return {
            intakeRecords: [...state.intakeRecords, newRecord],
            dailyHistory: {
              ...state.dailyHistory,
              [todayStr]: {
                ...currentDaily,
                totalIntake: currentDaily.totalIntake + amount,
                goal
              }
            },
            isAlarmRinging: false, // Stop alarm when logged
            isAlarmUIVisible: false, // Hide UI when logged
            snoozedUntil: null // Clear snooze
          };
        });
      },

      setAlarmRinging: (isAlarmRinging) => set({ 
        isAlarmRinging,
        isAlarmUIVisible: isAlarmRinging ? true : get().isAlarmUIVisible 
      }),

      setAlarmUIVisible: (isAlarmUIVisible) => set({ isAlarmUIVisible }),
      
      snoozeAlarm: () => set({ 
        isAlarmRinging: false, 
        isAlarmUIVisible: false,
        snoozedUntil: Date.now() + 15 * 60 * 1000 
      }), // 15 mins snooze

      setAlarmAmount: (alarmAmount) => set({ alarmAmount }),

      getNextAlarmTime: () => {
        const { profile, getDailyGoal, getTodayIntake, intakeRecords, snoozedUntil, isAlarmEnabled } = get();
        if (!profile || !isAlarmEnabled) return null;

        const goal = getDailyGoal();
        const intake = getTodayIntake();
        
        if (intake >= goal) return null; // Goal reached

        const now = new Date();
        const [wakeHour, wakeMinute] = profile.wakeTime.split(':').map(Number);
        const [sleepHour, sleepMinute] = profile.sleepTime.split(':').map(Number);

        const wakeTime = new Date(now);
        wakeTime.setHours(wakeHour, wakeMinute, 0, 0);

        const sleepTime = new Date(now);
        sleepTime.setHours(sleepHour, sleepMinute, 0, 0);
        if (sleepTime < wakeTime) {
          sleepTime.setDate(sleepTime.getDate() + 1);
        }

        if (now.getTime() < wakeTime.getTime()) return wakeTime.getTime();
        if (now.getTime() > sleepTime.getTime()) {
          const tomorrowWake = new Date(wakeTime);
          tomorrowWake.setDate(tomorrowWake.getDate() + 1);
          return tomorrowWake.getTime();
        }

        const awakeDuration = sleepTime.getTime() - wakeTime.getTime();
        const drinksNeeded = Math.ceil(goal / 250); // Assuming 250ml per drink
        const interval = awakeDuration / drinksNeeded;

        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        
        const todaysRecords = intakeRecords.filter(r => r.timestamp >= startOfToday.getTime());
        const lastIntakeTime = todaysRecords.length > 0 
          ? Math.max(...todaysRecords.map(r => r.timestamp))
          : wakeTime.getTime();

        let nextAlarm = lastIntakeTime + interval;

        if (snoozedUntil && snoozedUntil > now.getTime()) {
          return Math.max(nextAlarm, snoozedUntil);
        }

        if (nextAlarm > sleepTime.getTime()) {
          return sleepTime.getTime();
        }

        return nextAlarm;
      },

      getDailyGoal: () => {
        const { profile, weather } = get();
        if (!profile) return 2000; // Default 2L

        // Base calculation: Weight (kg) * 35ml
        let goal = profile.weight * 35;

        // Age adjustments
        if (profile.age < 30) goal += 200;
        if (profile.age > 55) goal -= 200;

        // Gender adjustments
        if (profile.gender === 'male') goal += 300;

        // Weather adjustments
        if (weather === 'cold') goal -= 200;
        if (weather === 'hot') goal += 500;
        if (weather === 'very_hot') goal += 1000;

        // Height adjustment (minor)
        if (profile.height > 180) goal += 200;

        return Math.round(goal);
      },

      getTodayIntake: () => {
        const now = Date.now();
        const startOfToday = startOfDay(now).getTime();
        return get().intakeRecords
          .filter(record => record.timestamp >= startOfToday)
          .reduce((sum, record) => sum + record.amount, 0);
      }
    }),
    {
      name: 'water-reminder-storage',
      partialize: (state) => ({
        profile: state.profile,
        weather: state.weather,
        theme: state.theme,
        alarmTune: state.alarmTune,
        isAlarmEnabled: state.isAlarmEnabled,
        intakeRecords: state.intakeRecords,
        dailyHistory: state.dailyHistory,
        activeTab: state.activeTab,
      }),
    }
  )
);
