/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { useStore } from './store/useStore';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Settings from './components/Settings';
import AlarmScreen from './components/AlarmScreen';
import { Droplets, BarChart3, Settings as SettingsIcon } from 'lucide-react';
import { cn } from './lib/utils';
import { alarmManager } from './lib/alarm';
import { notificationManager } from './lib/notifications';
import { motion, AnimatePresence } from 'motion/react';
import { LocalNotifications } from '@capacitor/local-notifications';
import { App as CapApp } from '@capacitor/app';

import { isNative } from './lib/platform';

export default function App() {
  const { 
    profile, 
    theme, 
    isAlarmRinging, 
    isAlarmUIVisible, 
    setAlarmRinging, 
    alarmTune, 
    activeTab, 
    setActiveTab, 
    getNextAlarmTime,
    isAlarmEnabled,
    intakeRecords
  } = useStore();

  // Initialize Notifications and App Lifecycle
  useEffect(() => {
    if (!isNative()) return;

    notificationManager.init();

    // Listen for notification clicks to open the alarm screen
    const notificationListener = LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
      console.log('Notification action performed', action);
      setAlarmRinging(true);
      setActiveTab('dashboard');
    });

    // Handle App state changes
    const appStateListener = CapApp.addListener('appStateChange', ({ isActive }) => {
      if (isActive) {
        // If app comes to foreground, check if we missed an alarm
        const next = getNextAlarmTime();
        if (next && Date.now() >= next && isAlarmEnabled) {
          setAlarmRinging(true);
        }
      }
    });

    return () => {
      notificationListener.then(h => h.remove());
      appStateListener.then(h => h.remove());
    };
  }, [setAlarmRinging, setActiveTab, getNextAlarmTime, isAlarmEnabled]);

  // Handle Native Back Button logic
  useEffect(() => {
    if (!isNative()) return;

    const backButtonListener = CapApp.addListener('backButton', () => {
      if (isAlarmRinging || isAlarmUIVisible) {
        // If alarm is ringing/visible, back button is ignored or handled elsewhere
        // Usually we want the user to interact with the UI to stop the alarm
        return;
      }

      if (activeTab !== 'dashboard') {
        setActiveTab('dashboard');
      } else {
        // If on dashboard, exit the app
        CapApp.exitApp();
      }
    });

    return () => {
      backButtonListener.then(h => h.remove());
    };
  }, [activeTab, setActiveTab, isAlarmRinging, isAlarmUIVisible]);

  // Sync scheduled notification whenever next alarm changes
  useEffect(() => {
    if (!profile || !isAlarmEnabled) {
      notificationManager.cancelAll();
      return;
    }

    const nextTime = getNextAlarmTime();
    if (nextTime) {
      notificationManager.schedule(nextTime, "Chaituli It's time to drink water");
    } else {
      notificationManager.cancelAll();
    }
  }, [profile, isAlarmEnabled, getNextAlarmTime, intakeRecords]);

  // Apply theme to body
  useEffect(() => {
    document.documentElement.classList.remove('theme-light', 'theme-dark', 'theme-blue');
    document.documentElement.classList.add(`theme-${theme}`);
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handle alarm state changes (Audio/Vibration)
  useEffect(() => {
    if (isAlarmRinging) {
      alarmManager.play(alarmTune);
    } else {
      alarmManager.stop();
    }
    return () => alarmManager.stop();
  }, [isAlarmRinging, alarmTune]);

  // Background check for alarms when app is OPEN
  useEffect(() => {
    if (!profile || !isAlarmEnabled) return;
    
    const interval = setInterval(() => {
      const nextAlarm = getNextAlarmTime();
      if (nextAlarm && Date.now() >= nextAlarm && !isAlarmRinging) {
        setAlarmRinging(true);
      }
    }, 5000); 

    return () => clearInterval(interval);
  }, [profile, isAlarmEnabled, isAlarmRinging, getNextAlarmTime, setAlarmRinging]);

  if (!profile) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col max-w-md mx-auto relative shadow-2xl overflow-hidden">
      {/* Alarm Screen Overlay */}
      <AnimatePresence>
        {isAlarmUIVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
          >
            <AlarmScreen />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'history' && <History />}
        {activeTab === 'settings' && <Settings />}
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 w-full bg-card border-t border-border/50 px-6 py-4 flex justify-between items-center z-10">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={cn("flex flex-col items-center gap-1 transition-colors", activeTab === 'dashboard' ? "text-primary" : "text-muted-foreground hover:text-foreground")}
        >
          <Droplets className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Today</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={cn("flex flex-col items-center gap-1 transition-colors", activeTab === 'history' ? "text-primary" : "text-muted-foreground hover:text-foreground")}
        >
          <BarChart3 className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">History</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={cn("flex flex-col items-center gap-1 transition-colors", activeTab === 'settings' ? "text-primary" : "text-muted-foreground hover:text-foreground")}
        >
          <SettingsIcon className="w-6 h-6" />
          <span className="text-[10px] font-medium uppercase tracking-wider">Settings</span>
        </button>
      </nav>
    </div>
  );
}
