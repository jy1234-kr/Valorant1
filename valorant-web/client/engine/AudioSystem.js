export class AudioSystem {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxVolume = 0.7;
    this.voiceVolume = 0.6;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.8;
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
  }

  setMasterVolume(vol) {
    if (this.masterGain) {
      this.masterGain.gain.value = vol;
    }
  }

  setSFXVolume(vol) {
    this.sfxVolume = vol;
  }

  setVoiceVolume(vol) {
    this.voiceVolume = vol;
  }

  playWeaponSound(weaponType) {
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    switch (weaponType) {
      case 'vandal':
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        gain.gain.setValueAtTime(this.sfxVolume * 0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
        break;
        
      case 'phantom':
        osc.frequency.setValueAtTime(300, this.ctx.currentTime);
        gain.gain.setValueAtTime(this.sfxVolume * 0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.12);
        break;
        
      case 'operator':
        osc.frequency.setValueAtTime(80, this.ctx.currentTime);
        gain.gain.setValueAtTime(this.sfxVolume * 0.8, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.45);
        break;
        
      case 'classic':
      default:
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        gain.gain.setValueAtTime(this.sfxVolume * 0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
        break;
    }
  }

  playFootstep(isRunning) {
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    const freq = isRunning ? 350 : 250;
    const duration = isRunning ? 0.08 : 0.06;
    
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(this.sfxVolume * 0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    
    osc.start();
    osc.stop(this.ctx.currentTime + duration + 0.02);
  }

  playSpikeBeep(timeLeft) {
    if (!this.ctx) return;
    
    // Interpolate beep interval from 2000ms to 300ms
    const interval = 2000 - (1 - timeLeft / 45) * 1700;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    gain.gain.setValueAtTime(this.sfxVolume * 0.3, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.1);
    
    return interval;
  }

  playSpikeExplosion() {
    if (!this.ctx) return;
    
    // Low boom
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(this.masterGain);
    osc1.frequency.setValueAtTime(60, this.ctx.currentTime);
    gain1.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 1.5);
    osc1.start();
    osc1.stop(this.ctx.currentTime + 1.6);
    
    // High crack
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(this.masterGain);
    osc2.frequency.setValueAtTime(2000, this.ctx.currentTime);
    gain2.gain.setValueAtTime(this.sfxVolume * 0.5, this.ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
    osc2.start();
    osc2.stop(this.ctx.currentTime + 0.35);
  }

  playPlantSound() {
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.frequency.setValueAtTime(400, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(800, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(this.sfxVolume * 0.3, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.55);
  }

  playDefuseSound() {
    if (!this.ctx) return;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.frequency.setValueAtTime(600, this.ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(200, this.ctx.currentTime + 0.5);
    gain.gain.setValueAtTime(this.sfxVolume * 0.3, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.55);
  }

  speak(text) {
    if (!this.initialized) return;
    
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = this.voiceVolume;
      speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis failed');
    }
  }

  playRoundStart() {
    if (!this.ctx) return;
    
    // Brass stab chord
    const frequencies = [220, 277, 330];
    frequencies.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.55);
    });
  }

  playVictory() {
    if (!this.ctx) return;
    
    // Ascending major arpeggio
    const notes = [261.63, 329.63, 392, 523.25];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.15);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.15 + 0.4);
      osc.start(this.ctx.currentTime + i * 0.15);
      osc.stop(this.ctx.currentTime + i * 0.15 + 0.45);
    });
  }

  playDefeat() {
    if (!this.ctx) return;
    
    // Descending minor arpeggio
    const notes = [392, 311.13, 261.63, 196];
    notes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + i * 0.2);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + i * 0.2 + 0.5);
      osc.start(this.ctx.currentTime + i * 0.2);
      osc.stop(this.ctx.currentTime + i * 0.2 + 0.55);
    });
  }
}
