/**
 * VOLUMIX - Main Application Controller
 * Responsive Orientation (Canvas scales in edit mode, 100% fullscreen in perform mode)
 */

import { AudioEngine } from './audio.js';
import { VolumetricRenderer } from './volumetric.js';

class VolumixApp {
  constructor() {
    this.canvas = document.getElementById('render-canvas');
    this.audio = new AudioEngine();
    this.renderer = new VolumetricRenderer(this.canvas);

    // Auto-Hide HUD Timer
    this.hudTimer = null;
    this.isHudVisible = true;

    // Auto-Pilot Party Mode (BPM Sound-To-Light / STL Mode)
    this.isAutopilot = false;
    this.autopilotBeatCount = 0;

    // Preset Modal State
    this.isModalOpen = false;
    this.favFilterActive = false;

    this.initUI();
    this.bindEvents();
    this.startLoop();
  }

  // Initialize UI & Sync Audio Callbacks
  initUI() {
    document.body.classList.add('ui-visible');
    this.renderPresetGrid();

    // Audio Callbacks
    this.audio.onBpmChange = (bpm) => {
      document.getElementById('bpm-value').textContent = bpm;
    };

    this.audio.onBeat = () => {
      // Sound-To-Light (STL): Cycle preset every 16 beats (~4 bars)
      if (this.isAutopilot) {
        this.autopilotBeatCount++;
        if (this.autopilotBeatCount >= 16) {
          this.autopilotBeatCount = 0;
          this.cycleNextPreset();
        }
      }
    };
  }

  // Render 16 Presets inside Grid Modal
  renderPresetGrid() {
    const gridEl = document.getElementById('preset-grid');
    if (!gridEl) return;
    gridEl.innerHTML = '';

    const items = this.renderer.presets.filter(p => {
      if (this.favFilterActive) return this.renderer.favorites.has(p.id);
      return true;
    });

    items.forEach(p => {
      const card = document.createElement('div');
      card.className = `preset-grid-card ${p.id === this.renderer.currentPresetId ? 'active' : ''}`;
      card.dataset.id = p.id;

      const isFav = this.renderer.favorites.has(p.id);

      card.innerHTML = `
        <button class="fav-star ${isFav ? 'active' : ''}" title="Favorite">★</button>
        <span class="preset-grid-card-title">${p.name}</span>
        <span class="preset-grid-card-icon">${p.icon}</span>
      `;

      // Card Selection Event
      card.addEventListener('click', (e) => {
        if (e.target.classList.contains('fav-star')) {
          e.stopPropagation();
          const active = this.renderer.toggleFavorite(p.id);
          e.target.classList.toggle('active', active);
          return;
        }

        document.querySelectorAll('.preset-grid-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.renderer.setPreset(p.id);
        this.closePresetModal();
      });

      gridEl.appendChild(card);
    });
  }

  // Preset Modal Show/Hide
  openPresetModal() {
    const modal = document.getElementById('preset-modal');
    modal.classList.remove('hidden');
    this.isModalOpen = true;
    this.renderPresetGrid();
  }

  closePresetModal() {
    const modal = document.getElementById('preset-modal');
    modal.classList.add('hidden');
    this.isModalOpen = false;
  }

  // Cycle Next Preset for Auto-Pilot / STL Mode
  cycleNextPreset() {
    const presets = this.renderer.presets;
    const currentIndex = presets.findIndex(p => p.id === this.renderer.currentPresetId);
    const nextIndex = (currentIndex + 1) % presets.length;
    this.renderer.setPreset(presets[nextIndex].id);

    // Update active state in grid modal if open
    document.querySelectorAll('.preset-grid-card').forEach(c => {
      c.classList.toggle('active', parseInt(c.dataset.id, 10) === this.renderer.currentPresetId);
    });
  }

  // Event Listeners & UI Binding
  bindEvents() {
    // Open 32 Presets Modal Button
    document.getElementById('btn-open-presets').addEventListener('click', () => {
      this.openPresetModal();
    });

    // Close Presets Modal Button
    document.getElementById('btn-close-modal').addEventListener('click', () => {
      this.closePresetModal();
    });

    // Favorite Filter Toggle Button
    const btnFavFilter = document.getElementById('btn-fav-filter');
    btnFavFilter.addEventListener('click', () => {
      this.favFilterActive = !this.favFilterActive;
      btnFavFilter.classList.toggle('active', this.favFilterActive);
      this.renderPresetGrid();
    });

    // Microphone Button
    const btnMic = document.getElementById('btn-mic');
    btnMic.addEventListener('click', async () => {
      const active = await this.audio.enableMic();
      btnMic.classList.toggle('active', active);
    });

    // Audio File Input
    const fileInput = document.getElementById('audio-file-input');
    fileInput.addEventListener('change', async (e) => {
      if (e.target.files.length > 0) {
        const file = e.target.files[0];
        const audioEl = await this.audio.loadAudioFile(file);
        
        document.getElementById('track-name').textContent = file.name;
        document.getElementById('audio-player-bar').classList.remove('hidden');
        btnMic.classList.remove('active');

        audioEl.addEventListener('timeupdate', () => {
          const seek = document.getElementById('track-seek');
          const timeEl = document.getElementById('track-time');
          if (audioEl.duration) {
            seek.value = (audioEl.currentTime / audioEl.duration) * 100;
            const mins = Math.floor(audioEl.currentTime / 60);
            const secs = Math.floor(audioEl.currentTime % 60).toString().padStart(2, '0');
            timeEl.textContent = `${mins}:${secs}`;
          }
        });
      }
    });

    // Audio Play/Pause Button
    const btnPlayPause = document.getElementById('btn-play-pause');
    btnPlayPause.addEventListener('click', () => {
      const isPlaying = this.audio.togglePlayPause();
      btnPlayPause.textContent = isPlaying ? '⏸' : '▶';
    });

    // Audio Seek Slider
    const trackSeek = document.getElementById('track-seek');
    trackSeek.addEventListener('input', () => {
      if (this.audio.audioElement && this.audio.audioElement.duration) {
        this.audio.audioElement.currentTime = (trackSeek.value / 100) * this.audio.audioElement.duration;
      }
    });

    // Tap Tempo Button
    document.getElementById('btn-tap-tempo').addEventListener('click', () => {
      this.audio.tapTempo();
    });

    // Multi-Color Button
    const btnMultiColor = document.getElementById('btn-multicolor');
    btnMultiColor.classList.toggle('active', this.renderer.multiColorMode);
    btnMultiColor.addEventListener('click', () => {
      this.renderer.multiColorMode = !this.renderer.multiColorMode;
      btnMultiColor.classList.toggle('active', this.renderer.multiColorMode);
    });

    // Auto-Pilot Button
    const btnAuto = document.getElementById('btn-autopilot');
    btnAuto.addEventListener('click', () => {
      this.isAutopilot = !this.isAutopilot;
      btnAuto.classList.toggle('active', this.isAutopilot);
    });

    // Fullscreen Button
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.error(err));
      } else {
        document.exitFullscreen();
      }
    });

    // --- MIC GAIN SLIDER & STEPPERS ---
    const sliderGain = document.getElementById('slider-sensitivity');
    const updateGain = (val) => {
      const v = Math.min(4.0, Math.max(0.5, parseFloat(val).toFixed(1)));
      sliderGain.value = v;
      this.audio.setSensitivity(v);
      document.getElementById('val-sensitivity').textContent = `${v}x`;
    };
    sliderGain.addEventListener('input', (e) => updateGain(e.target.value));
    document.getElementById('btn-gain-dec').addEventListener('click', () => updateGain(parseFloat(sliderGain.value) - 0.2));
    document.getElementById('btn-gain-inc').addEventListener('click', () => updateGain(parseFloat(sliderGain.value) + 0.2));

    // --- BEAM SIZE SLIDER & STEPPERS ---
    const sliderSize = document.getElementById('slider-size');
    const updateSize = (val) => {
      const v = Math.min(2.5, Math.max(0.2, parseFloat(val).toFixed(1)));
      sliderSize.value = v;
      this.renderer.beamSize = parseFloat(v);
      this.renderer.targetSize = parseFloat(v);
      document.getElementById('val-size').textContent = `${v}x`;
    };
    sliderSize.addEventListener('input', (e) => updateSize(e.target.value));
    document.getElementById('btn-size-dec').addEventListener('click', () => updateSize(parseFloat(sliderSize.value) - 0.2));
    document.getElementById('btn-size-inc').addEventListener('click', () => updateSize(parseFloat(sliderSize.value) + 0.2));

    // --- SPEED SLIDER & STEPPERS ---
    const sliderSpeed = document.getElementById('slider-speed');
    const updateSpeed = (val) => {
      const v = Math.min(2.0, Math.max(0.2, parseFloat(val).toFixed(1)));
      sliderSpeed.value = v;
      this.renderer.speedMultiplier = parseFloat(v);
      document.getElementById('val-speed').textContent = `${v}x`;
    };
    sliderSpeed.addEventListener('input', (e) => updateSpeed(e.target.value));
    document.getElementById('btn-speed-dec').addEventListener('click', () => updateSpeed(parseFloat(sliderSpeed.value) - 0.2));
    document.getElementById('btn-speed-inc').addEventListener('click', () => updateSpeed(parseFloat(sliderSpeed.value) + 0.2));

    // --- STROBE SLIDER & STEPPERS ---
    const sliderStrobe = document.getElementById('slider-strobe');
    const updateStrobe = (val) => {
      const v = Math.min(6, Math.max(0, parseInt(val, 10)));
      sliderStrobe.value = v;
      this.renderer.strobeRate = v;
      document.getElementById('val-strobe').textContent = v === 0 ? 'OFF' : `${v}`;
    };
    sliderStrobe.addEventListener('input', (e) => updateStrobe(e.target.value));
    document.getElementById('btn-strobe-dec').addEventListener('click', () => updateStrobe(parseInt(sliderStrobe.value, 10) - 1));
    document.getElementById('btn-strobe-inc').addEventListener('click', () => updateStrobe(parseInt(sliderStrobe.value, 10) + 1));

    // --- TRAIL FADE SLIDER & STEPPERS ---
    const sliderTrail = document.getElementById('slider-trail');
    const updateTrail = (val) => {
      const v = Math.min(90, Math.max(0, parseInt(val, 10)));
      sliderTrail.value = v;
      this.renderer.trailFade = v / 100.0;
      document.getElementById('val-trail').textContent = v === 0 ? 'OFF' : `${v}%`;
    };
    sliderTrail.addEventListener('input', (e) => updateTrail(e.target.value));
    document.getElementById('btn-trail-dec').addEventListener('click', () => updateTrail(parseInt(sliderTrail.value, 10) - 10));
    document.getElementById('btn-trail-inc').addEventListener('click', () => updateTrail(parseInt(sliderTrail.value, 10) + 10));

    // Color Palette Chips
    document.querySelectorAll('.color-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        document.querySelectorAll('.color-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.renderer.currentColorScheme = chip.dataset.color;
      });
    });

    // Manual Toggle UI Hide/Show Behavior (Tap Canvas to toggle controls)
    window.addEventListener('click', (e) => {
      if (e.target.id === 'render-canvas' || e.target.id === 'canvas-container' || e.target.id === 'hud-hint') {
        this.toggleHUD();
      }
    });

    window.addEventListener('resize', () => {
      setTimeout(() => this.renderer.resizeCanvas(), 350);
    });

    this.showHUD();
  }

  showHUD() {
    const hud = document.getElementById('hud-overlay');
    hud.classList.remove('hud-hidden');
    document.body.classList.add('ui-visible');
    this.isHudVisible = true;
    setTimeout(() => this.renderer.resizeCanvas(), 350);
  }

  hideHUD() {
    const hud = document.getElementById('hud-overlay');
    hud.classList.add('hud-hidden');
    document.body.classList.remove('ui-visible');
    this.isHudVisible = false;
    setTimeout(() => this.renderer.resizeCanvas(), 350);
  }

  toggleHUD() {
    if (this.isHudVisible) this.hideHUD();
    else this.showHUD();
  }

  startLoop() {
    const loop = () => {
      this.audio.update();

      const meterBar = document.getElementById('audio-meter-bar');
      if (meterBar) {
        meterBar.style.width = `${Math.min(100, this.audio.overallEnergy * 100)}%`;
      }

      this.renderer.render(this.audio);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.volumix = new VolumixApp();
});
