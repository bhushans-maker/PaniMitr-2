import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { isNative } from './platform';

class AlarmManager {
  private audioContext: AudioContext | null = null;
  private isPlaying = false;
  private intervalId: number | null = null;
  private previewTimeoutId: number | null = null;
  private sequenceTimeoutId: number | null = null;
  private activeOscillators: OscillatorNode[] = [];

  private initAudio() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public preview(tune: string) {
    this.stop();
    if (this.previewTimeoutId) {
      clearTimeout(this.previewTimeoutId);
    }
    this.play(tune);
    this.previewTimeoutId = window.setTimeout(() => {
      this.stop();
      this.previewTimeoutId = null;
    }, 4000); // 4 seconds preview for longer melodies
  }

  public async play(tune: string) {
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.initAudio();

    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }

    // Alarm vibration using Haptics (more reliable on mobile) or Navigator on web
    const runVibration = async () => {
      if (!this.isPlaying) return;
      if (isNative()) {
        await Haptics.vibrate({ duration: 1000 });
      } else if ('vibrate' in navigator) {
        navigator.vibrate(1000);
      }
      this.intervalId = window.setTimeout(runVibration, 1500);
    };
    runVibration();

    this.playSequence(tune);
  }

  private playSequence(tune: string) {
    if (!this.audioContext || !this.isPlaying) return;

    const now = this.audioContext.currentTime;
    let sequence: { freq: number, time: number, dur: number, type: OscillatorType }[] = [];

    const A3 = 220.00, C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00;
    const C5 = 523.25, D5 = 587.33, E5 = 659.25, G5 = 783.99, A5 = 880.00, B5 = 987.77;
    const C6 = 1046.50, E6 = 1318.51, G6 = 1567.98;

    if (tune === 'tune1') {
      // Morning Breeze
      const notes = [C4, E4, G4, C5, G4, E4, C4, E4, G4, C5, G4, E4, D4, F4, A4, D5, A4, F4, D4, F4, A4, D5, A4, F4];
      notes.forEach((freq, i) => sequence.push({ freq, time: i * 0.25, dur: 0.4, type: 'sine' }));
    } else if (tune === 'tune2') {
      // Marimba Flow
      const notes = [C5, A4, G4, E4, D4, C4, D4, E4, G4, A4, C5, A4, G4, E4, D4, C4];
      notes.forEach((freq, i) => sequence.push({ freq, time: i * 0.2, dur: 0.15, type: 'triangle' }));
    } else if (tune === 'tune3') {
      // Gentle Chimes
      const notes = [E5, C5, D5, G4, A4, C5, E5, G5];
      notes.forEach((freq, i) => sequence.push({ freq, time: i * 0.5, dur: 0.8, type: 'sine' }));
    } else if (tune === 'tune4') {
      // Zen Garden
      const notes = [C4, D4, E4, G4, A4, C5, A4, G4, E4, D4, C4, A3, C4, D4, E4, G4];
      notes.forEach((freq, i) => sequence.push({ freq, time: i * 0.6, dur: 1.0, type: 'sine' }));
    } else if (tune === 'tune5') {
      // Deep Resonance
      const notes = [130.81, 146.83, 164.81, 196.00, 164.81, 146.83]; 
      notes.forEach((freq, i) => sequence.push({ freq, time: i * 1.0, dur: 2.0, type: 'triangle' }));
    } else if (tune === 'tune6') {
      // Cosmic Journey
      const notes = [C4, G4, C5, E5, G5, E5, C5, G4, A3, E4, A4, C5, E5, C5, A4, E4];
      notes.forEach((freq, i) => sequence.push({ freq, time: i * 0.15, dur: 0.2, type: 'square' }));
    } else if (tune === 'tune7') {
      // Forest Dawn
      const notes = [G5, C6, E6, G6, E6, C6, G5, E5, C5, E5, G5, C6];
      notes.forEach((freq, i) => sequence.push({ freq, time: i * 0.3, dur: 0.1, type: 'sine' }));
    } else {
      // Crystal Cave
      const notes = [C5, E5, G5, B5, A5, G5, E5, C5];
      notes.forEach((freq, i) => sequence.push({ freq, time: i * 0.4, dur: 1.5, type: 'triangle' }));
    }

    const totalDuration = sequence[sequence.length - 1].time + sequence[sequence.length - 1].dur;

    sequence.forEach(note => {
      const osc = this.audioContext!.createOscillator();
      const gain = this.audioContext!.createGain();
      
      osc.type = note.type;
      osc.frequency.value = note.freq;
      
      gain.gain.setValueAtTime(0, now + note.time);
      gain.gain.linearRampToValueAtTime(0.2, now + note.time + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.time + note.dur);
      
      osc.connect(gain);
      gain.connect(this.audioContext!.destination);
      
      osc.start(now + note.time);
      osc.stop(now + note.time + note.dur);
      
      this.activeOscillators.push(osc);
      
      osc.onended = () => {
        const index = this.activeOscillators.indexOf(osc);
        if (index > -1) {
          this.activeOscillators.splice(index, 1);
        }
      };
    });

    this.sequenceTimeoutId = window.setTimeout(() => {
      if (this.isPlaying) {
        this.playSequence(tune);
      }
    }, totalDuration * 1000);
  }

  public stop() {
    this.isPlaying = false;
    
    this.activeOscillators.forEach(osc => {
      try { osc.stop(); osc.disconnect(); } catch (e) {}
    });
    this.activeOscillators = [];

    if (this.sequenceTimeoutId) {
      clearTimeout(this.sequenceTimeoutId);
      this.sequenceTimeoutId = null;
    }
    if (this.previewTimeoutId) {
      clearTimeout(this.previewTimeoutId);
      this.previewTimeoutId = null;
    }
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
  }
}

export const alarmManager = new AlarmManager();
