/**
 * VOLUMIX - Audio Processing & Real-Time Adaptive BPM Engine
 * Supports: Reactivity Mode Toggle (🎤 AUDIO Mode vs ⏱️ BPM Mode)
 */

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.analyser = null;
    this.source = null;
    this.micStream = null;
    this.audioElement = null;
    this.silenceGain = null;
    
    // Audio Data Buffers
    this.fftSize = 2048;
    this.freqData = new Uint8Array(this.fftSize / 2);
    this.timeData = new Uint8Array(this.fftSize);

    // Reactivity Mode: 'audio' or 'bpm'
    this.reactivityMode = 'audio';

    // Frequency Bands (0 - 1.0)
    this.bass = 0;
    this.mid = 0;
    this.high = 0;
    this.overallEnergy = 0;

    // virtual Envelope values for pure BPM mode
    this.virtualBass = 0;
    this.virtualOverallEnergy = 0;

    // Gain & Sensitivity
    this.sensitivity = 2.0;

    // Fast & Slow Moving Energy Averages (Audio Mode)
    this.fastEnergy = 0.0;
    this.slowEnergy = 0.05;

    // BPM & Beat Detection Engine
    this.bpm = 120;
    this.beatPulse = false;
    this.lastBeatTime = 0;
    this.beatIntervals = [];
    this.tapTimes = [];
    
    // Status Flags
    this.isMicActive = false;
    this.isFilePlaying = false;
    this.isInitialized = false;

    // Callbacks
    this.onBpmChange = null;
    this.onBeat = null;
  }

  // Initialize Web Audio Context
  init() {
    if (this.isInitialized) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioCtx();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = this.fftSize;
    this.analyser.smoothingTimeConstant = 0.6;

    // Create zero-gain silence node connected to destination
    this.silenceGain = this.ctx.createGain();
    this.silenceGain.gain.value = 0.0;
    this.analyser.connect(this.silenceGain);
    this.silenceGain.connect(this.ctx.destination);

    this.isInitialized = true;
  }

  // Resume context
  async resume() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  // Enable Microphone Stream
  async enableMic() {
    await this.resume();
    
    if (this.isMicActive) {
      this.disableMic();
      return false;
    }

    try {
      if (this.audioElement) {
        this.audioElement.pause();
        this.isFilePlaying = false;
      }

      this.micStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: true
        }, 
        video: false 
      });
      
      if (this.source) this.source.disconnect();
      this.source = this.ctx.createMediaStreamSource(this.micStream);
      this.source.connect(this.analyser);
      
      this.isMicActive = true;
      this.lastBeatTime = performance.now();
      this.beatIntervals = [];
      return true;
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Unable to access microphone. Please check permissions.');
      return false;
    }
  }

  // Disable Microphone
  disableMic() {
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    if (this.source) {
      this.source.disconnect();
      this.source = null;
    }
    this.isMicActive = false;
  }

  // Load Audio File
  async loadAudioFile(file) {
    await this.resume();
    this.disableMic();

    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
    }

    const fileUrl = URL.createObjectURL(file);
    this.audioElement = new Audio(fileUrl);
    this.audioElement.crossOrigin = 'anonymous';

    if (this.source) this.source.disconnect();
    this.source = this.ctx.createMediaElementSource(this.audioElement);
    
    this.source.connect(this.analyser);
    const playGain = this.ctx.createGain();
    playGain.gain.value = 1.0;
    this.source.connect(playGain);
    playGain.connect(this.ctx.destination);

    this.audioElement.play();
    this.isFilePlaying = true;
    this.lastBeatTime = performance.now();
    this.beatIntervals = [];

    return this.audioElement;
  }

  // Toggle Audio File Play/Pause
  togglePlayPause() {
    if (!this.audioElement) return false;
    if (this.audioElement.paused) {
      this.audioElement.play();
      this.isFilePlaying = true;
    } else {
      this.audioElement.pause();
      this.isFilePlaying = false;
    }
    return this.isFilePlaying;
  }

  // Tap Tempo Handler
  tapTempo() {
    const now = performance.now();
    this.tapTimes.push(now);

    this.tapTimes = this.tapTimes.filter(t => now - t < 3000);

    if (this.tapTimes.length >= 2) {
      const intervals = [];
      for (let i = 1; i < this.tapTimes.length; i++) {
        intervals.push(this.tapTimes[i] - this.tapTimes[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval);
      
      if (calculatedBpm >= 40 && calculatedBpm <= 220) {
        this.bpm = calculatedBpm;
        if (this.onBpmChange) this.onBpmChange(this.bpm);
      }
    }
  }

  // Set Sensitivity Gain
  setSensitivity(val) {
    this.sensitivity = parseFloat(val);
  }

  // Main Audio & BPM Frame Update
  update() {
    const now = performance.now();

    // 1. Pure BPM Reactivity Mode (Virtual Beat Clock Generator)
    if (this.reactivityMode === 'bpm') {
      const beatIntervalMs = 60000 / this.bpm;
      const timeSinceLastBeat = now - this.lastBeatTime;

      if (timeSinceLastBeat >= beatIntervalMs) {
        this.beatPulse = true;
        this.lastBeatTime = now;
        
        // Spike virtual envelopes on beat tick
        this.virtualBass = 1.0;
        this.virtualOverallEnergy = 1.0;

        if (this.onBeat) this.onBeat();
      } else {
        this.beatPulse = false;
        
        // Decay virtual envelopes exponentially
        this.virtualBass *= 0.88;
        this.virtualOverallEnergy *= 0.90;
      }

      this.bass = this.virtualBass;
      this.overallEnergy = this.virtualOverallEnergy;
      this.mid = this.virtualOverallEnergy * 0.5;
      this.high = this.virtualOverallEnergy * 0.2;
      return;
    }

    // 2. Standard Audio / Microphone Reactivity Mode
    if (!this.analyser) return;

    this.analyser.getByteFrequencyData(this.freqData);
    this.analyser.getByteTimeDomainData(this.timeData);

    const binCount = this.freqData.length;
    
    // Calculate Low Frequency / Bass (bins 0 to 20 ~ 20-300Hz)
    let bassSum = 0;
    const bassBins = Math.floor(binCount * 0.1);
    for (let i = 0; i < bassBins; i++) {
      bassSum += this.freqData[i];
    }
    const rawBass = (bassSum / Math.max(1, bassBins)) / 255;
    this.bass = Math.min(1.0, rawBass * this.sensitivity);

    // Calculate Mid (bins 20 to 120 ~ 300-2000Hz)
    let midSum = 0;
    const midBins = Math.floor(binCount * 0.3);
    for (let i = bassBins; i < midBins; i++) {
      midSum += this.freqData[i];
    }
    const rawMid = (midSum / Math.max(1, midBins - bassBins)) / 255;
    this.mid = Math.min(1.0, rawMid * this.sensitivity);

    // Calculate High (bins 120+)
    let highSum = 0;
    for (let i = midBins; i < binCount; i++) {
      highSum += this.freqData[i];
    }
    const rawHigh = (highSum / Math.max(1, binCount - midBins)) / 255;
    this.high = Math.min(1.0, rawHigh * this.sensitivity);

    // Overall Energy
    this.overallEnergy = (this.bass * 0.6) + (this.mid * 0.3) + (this.high * 0.1);

    // Wideband Onset Beat & BPM Detection
    const beatSignal = (this.bass * 0.75) + (this.mid * 0.25);
    this.detectBeat(beatSignal);
  }

  // Wideband Onset Beat Detection & Dynamic BPM Auto-Calculation
  detectBeat(signal) {
    this.fastEnergy = this.fastEnergy * 0.4 + signal * 0.6;
    this.slowEnergy = this.slowEnergy * 0.95 + signal * 0.05;

    const now = performance.now();
    const timeSinceLastBeat = now - this.lastBeatTime;

    const threshold = Math.max(0.03, this.slowEnergy * 1.12 + 0.01);

    if (this.fastEnergy > threshold && timeSinceLastBeat > 260) {
      this.beatPulse = true;
      
      const delta = timeSinceLastBeat;
      this.lastBeatTime = now;

      if (delta >= 260 && delta <= 1200) {
        this.beatIntervals.push(delta);
        if (this.beatIntervals.length > 5) this.beatIntervals.shift();

        const avgInterval = this.beatIntervals.reduce((a, b) => a + b, 0) / this.beatIntervals.length;
        const autoBpm = Math.round(60000 / avgInterval);
        
        if (autoBpm >= 50 && autoBpm <= 200) {
          if (this.beatIntervals.length === 1) {
            this.bpm = autoBpm;
          } else {
            this.bpm = Math.round(this.bpm * 0.5 + autoBpm * 0.5);
          }

          if (this.onBpmChange) this.onBpmChange(this.bpm);
        }
      }

      if (this.onBeat) this.onBeat();
    } else {
      this.beatPulse = false;
    }
  }
}
