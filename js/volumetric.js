/**
 * VOLUMIX - 3D Volumetric Projector Beam Visual Synthesizer
 * Curated 16 Unique Presets with Odd/Even Alternating Blinking Dots for Preset 2
 */

export class VolumetricRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Canvas Size
    this.resizeCanvas();

    // Active Settings
    this.currentPresetId = 0; // Preset 0 to 15
    this.previousPresetId = 0;
    this.transitionAlpha = 1.0;
    this.transitionDuration = 0.3; // 0.3 seconds smooth crossfade

    this.currentColorScheme = 'blue';
    this.multiColorMode = false;
    
    // Global Trailing Fade / Motion Persistence (0.0 = OFF, 0.9 = MAX 90%)
    this.trailFade = 0.0;

    // Exponential Lerp Physics
    this.size = 1.0;
    this.targetSize = 1.0;
    this.brightness = 1.0;
    this.targetBrightness = 1.0;
    this.beamSize = 1.0;
    
    this.speedMultiplier = 1.0;
    this.strobeRate = 0; // 0 = OFF

    // Animation & Timing State
    this.time = 0;
    this.beatPhase = 0;
    this.strobeCounter = 0;
    this.chaseStep = 0;

    // Flash-Jump / Blink-Jump Offset State for Circles & Apertures
    this.circleOffsetX = 0;
    this.circleOffsetY = 0;
    this.barAngle = -0.18;
    this.barYOffset = 0;

    // Curated 16 Unique High-Impact Presets List
    this.presets = [
      { id: 0, name: 'Preset 01: Perimeter Orbiting Dots', icon: '◌', desc: 'Solid dots orbiting along a circular perimeter (Ref Image 1)' },
      { id: 1, name: 'Preset 02: Concentric Alternating Dot Rings', icon: '◎', desc: 'Concentric rings of odd/even alternating blinking dots (Ref Image 2)' },
      { id: 2, name: 'Preset 03: Flash-Jump Liquid Sky Bar', icon: '━', desc: 'Bold scanning bar that flash-jumps orientation on beat (Ref Image 3)' },
      { id: 3, name: 'Preset 04: Bold Solid Circle Ring', icon: '◯', desc: 'High-contrast bold stroke circle ring that blink-jumps on beat (Ref Image 4)' },
      { id: 4, name: 'Preset 05: Sine Spacing Bar Wave', icon: '⁘', desc: 'Vertical bars moving towards & away from each other in sine wave (Ref Image 5)' },
      { id: 5, name: 'Preset 06: Slicing Sector Fan', icon: '☸', desc: 'Rotating 6-blade sector mask slicing room air' },
      { id: 6, name: 'Preset 07: 3D Volumetric Tunnel Boxes', icon: '回', desc: 'Concentric 3D zooming polygon frames' },
      { id: 7, name: 'Preset 08: Quad-Phase LED Matrix', icon: '⁖', desc: 'Grid of 16 pulsing circular beam fixtures' },
      { id: 8, name: 'Preset 09: Chasing Spotlight Columns', icon: '⋮⋮', desc: 'Sequential multi-beam spotlight columns chasing on beat' },
      { id: 9, name: 'Preset 10: Rotating Star Aperture', icon: '✦', desc: 'Rotating 5-point star aperture that blink-jumps on beat' },
      { id: 10, name: 'Preset 11: Audio Wave Ribbon', icon: '〰', desc: 'High-contrast audio ribbon casting undulating light' },
      { id: 11, name: 'Preset 12: Orbiting Strobe Matrix', icon: '⁘', desc: 'Pulsing orbiting dot grid producing pencil beams' },
      { id: 12, name: 'Preset 13: Expanding Iris Aperture', icon: '◉', desc: 'Expanding circle iris that blink-jumps on beat' },
      { id: 13, name: 'Preset 14: Radial Multi-Beam Burst', icon: '✴', desc: '32-spoke radial beam burst' },
      { id: 14, name: 'Preset 15: Crosshair Laser Cutter', icon: '┼', desc: 'High-intensity crosshair laser plane cutter' },
      { id: 15, name: 'Preset 16: Diamond Lattice Grid', icon: '❖', desc: 'Rotating diamond lattice beam grid that blink-jumps on beat' },
      { id: 16, name: 'Preset 17: Logarithmic Spiral Vortex', icon: '🌀', desc: 'Rotating dual-arm phyllotaxis spiral beams sucking into center' },
      { id: 17, name: 'Preset 18: Liquid Sky Sheet Cutter', icon: '═', desc: 'Horizontal oscillating laser planes creating solid fog ceilings' },
      { id: 18, name: 'Preset 19: 3D Wireframe Hypercube', icon: '🧊', desc: 'Rotating 3D tesseract wireframe projecting complex volumetric cages' },
      { id: 19, name: 'Preset 20: Radial Scanner Tunnel', icon: '⧁', desc: 'Scanning radar wiper slicing through room haze in 360 degrees' },
      { id: 20, name: 'Preset 21: Pulsing Audio Hex Lattice', icon: '⬡', desc: 'Concentric nesting honeycomb geometry pulsing to frequency dynamics' },
      { id: 21, name: 'Preset 22: Kinetic Laser Lissajous', icon: '♾️', desc: 'Harmonic oscilloscope figure-eight parametric ribbons' },
      { id: 22, name: 'Preset 23: Hyperspace Star Warp', icon: '✨', desc: 'Beams accelerating outwards from the center into physical fog' },
      { id: 23, name: 'Preset 24: Dual Slicing Triangle Fans', icon: '▲', desc: 'Counter-rotating high-velocity polygon blades' },
      { id: 24, name: 'Preset 25: Bio-Laser DNA Helix', icon: '🧬', desc: 'Double helix sine ribbons twisting with cross-link rungs' },
      { id: 25, name: 'Preset 26: Pulsing Metatron Cube', icon: '✡', desc: 'Sacred geometry 13-sphere lattice projecting multi-axis laser corridors' },
      { id: 26, name: 'Preset 27: Infinite Torus Tunnel', icon: '⭕', desc: 'Rotating 3D donut rings pulsating down depth corridor' },
      { id: 27, name: 'Preset 28: Laser Rose Rhodonea', icon: '🌸', desc: '8-petal polar coordinate mathematical flower curves' },
      { id: 28, name: 'Preset 29: Scanning Horizon Grid', icon: '🌐', desc: 'Retro 80s outrun synthwave perspective grid receding to infinity' },
      { id: 29, name: 'Preset 30: Kinetic Geodesic Sphere', icon: '⚽', desc: 'Rotating 3D wireframe icosahedron casting spherical cages' },
      { id: 30, name: 'Preset 31: Laser Equalizer Stacks', icon: '📊', desc: 'Radial 16-band spectrum analyzer towers bouncing to audio' },
      { id: 31, name: 'Preset 32: Cyberpunk Dual Prism Cutter', icon: '💎', desc: 'Interlocking diamond planes shearing dynamically on beat' }
    ];

    // Favorites Manager
    this.favorites = new Set(JSON.parse(localStorage.getItem('volumix_favs') || '[0, 1, 2, 3, 4]'));

    window.addEventListener('resize', () => this.resizeCanvas());
  }

  // Set Preset with 0.3s Smooth Crossfade
  setPreset(newId) {
    if (newId === this.currentPresetId) return;
    this.previousPresetId = this.currentPresetId;
    this.currentPresetId = newId;
    this.transitionAlpha = 0.0;
  }

  // Sync canvas internal resolution with its actual rendered bounding box client dimensions
  resizeCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.floor(rect.width || window.innerWidth);
    const h = Math.floor(rect.height || window.innerHeight);

    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
      this.width = w;
      this.height = h;
    }
  }

  toggleFavorite(presetId) {
    if (this.favorites.has(presetId)) {
      this.favorites.delete(presetId);
    } else {
      this.favorites.add(presetId);
    }
    localStorage.setItem('volumix_favs', JSON.stringify(Array.from(this.favorites)));
    return this.favorites.has(presetId);
  }

  getPrimaryColor(alpha = 1.0, audio = { bass: 0, mid: 0, high: 0 }) {
    const b = Math.min(1.0, alpha * this.brightness);
    switch (this.currentColorScheme) {
      case 'blue': return `rgba(0, 50, 255, ${b})`;
      case 'green': return `rgba(0, 255, 102, ${b})`;
      case 'red': return `rgba(255, 0, 68, ${b})`;
      case 'cyan': return `rgba(0, 247, 255, ${b})`;
      case 'amber': return `rgba(255, 170, 0, ${b})`;
      case 'violet': return `rgba(204, 0, 255, ${b})`;
      case 'white': return `rgba(255, 255, 255, ${b})`;
      case 'pink': return `rgba(255, 0, 187, ${b})`;
      case 'acid': return `rgba(191, 255, 0, ${b})`;
      case 'gold': return `rgba(255, 215, 0, ${b})`;
      case 'aqua': return `rgba(0, 255, 166, ${b})`;
      case 'uv': return `rgba(119, 0, 255, ${b})`;
      case 'fire': {
        const fireMix = Math.sin(this.time * 3 + audio.bass * 2);
        return fireMix > 0 ? `rgba(255, 34, 0, ${b})` : `rgba(255, 170, 0, ${b})`;
      }
      case 'cyber': {
        const cyberMix = Math.sin(this.time * 2.5);
        return cyberMix > 0 ? `rgba(0, 247, 255, ${b})` : `rgba(255, 0, 170, ${b})`;
      }
      case 'rainbow':
      default: {
        const hue = Math.floor((this.time * 40 + audio.bass * 120) % 360);
        return `hsla(${hue}, 100%, 55%, ${b})`;
      }
    }
  }

  getSecondaryColor(alpha = 1.0, audio = { bass: 0, mid: 0, high: 0 }) {
    if (!this.multiColorMode) return this.getPrimaryColor(alpha, audio);

    const b = Math.min(1.0, alpha * this.brightness);
    switch (this.currentColorScheme) {
      case 'blue': return `rgba(255, 170, 0, ${b})`;
      case 'green': return `rgba(255, 0, 204, ${b})`;
      case 'red': return `rgba(0, 247, 255, ${b})`;
      case 'cyan': return `rgba(255, 0, 68, ${b})`;
      case 'amber': return `rgba(0, 153, 255, ${b})`;
      case 'violet': return `rgba(0, 255, 102, ${b})`;
      case 'white': return `rgba(0, 247, 255, ${b})`;
      case 'pink': return `rgba(0, 255, 204, ${b})`;
      case 'acid': return `rgba(204, 0, 255, ${b})`;
      case 'gold': return `rgba(0, 102, 255, ${b})`;
      case 'aqua': return `rgba(255, 0, 102, ${b})`;
      case 'uv': return `rgba(0, 255, 136, ${b})`;
      case 'fire': return `rgba(255, 255, 0, ${b})`;
      case 'cyber': return `rgba(255, 255, 255, ${b})`;
      case 'rainbow':
      default: {
        const hue = Math.floor((this.time * 40 + 180 + audio.bass * 120) % 360);
        return `hsla(${hue}, 100%, 55%, ${b})`;
      }
    }
  }

  // Main Render Loop
  render(audio) {
    this.resizeCanvas();

    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Time & BPM Physics
    const bpm = audio.bpm || 120;
    const bpmFactor = (bpm / 60) * 0.016 * this.speedMultiplier;
    this.time += bpmFactor;

    // Crossfade Alpha Progress
    if (this.transitionAlpha < 1.0) {
      this.transitionAlpha += (0.016 / this.transitionDuration);
      if (this.transitionAlpha > 1.0) this.transitionAlpha = 1.0;
    }

    if (audio.beatPulse) {
      this.chaseStep = (this.chaseStep + 1) % 8;
      this.beatPhase = 1.0;
      this.targetSize = 1.2 + audio.bass * 0.4;
      this.targetBrightness = 1.0;

      // RANDOM CANVAS BLINK-JUMP ON BEAT FOR CIRCLES & APERTURES
      this.circleOffsetX = (Math.random() - 0.5) * (w * 0.35);
      this.circleOffsetY = (Math.random() - 0.5) * (h * 0.35);

      // Preset 3 Flash-Jump Bar Trigger
      this.barAngle = (Math.random() - 0.5) * 1.2;
      this.barYOffset = (Math.random() - 0.5) * (h * 0.35);
    } else {
      this.beatPhase *= 0.88;
      this.targetSize = 1.0 + audio.bass * 0.15;
      this.targetBrightness = 0.9;
    }

    // Smooth Exponential Lerp Easing
    this.size += 0.14 * (this.targetSize - this.size);
    this.brightness += 0.2 * (this.targetBrightness - this.brightness);

    // Strobe Handler (Supports ultra-slow to high-speed strobe)
    this.strobeCounter++;
    if (this.strobeRate > 0) {
      // Rates 1-2: slow pulse (28 and 20 frames); Rates 3-4: medium (14 and 10 frames); Rates 5-6: fast (7 and 4 frames)
      const strobeMap = [999, 28, 20, 14, 10, 7, 4];
      const strobeInterval = strobeMap[Math.min(this.strobeRate, 6)] || 14;
      if (this.strobeCounter % strobeInterval < Math.floor(strobeInterval / 2)) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);
        return;
      }
    }

    // Clear Screen with Trailing Fade Persistence Support
    ctx.save();
    if (this.trailFade > 0) {
      const clearAlpha = Math.max(0.08, 1.0 - (this.trailFade * 0.92));
      ctx.fillStyle = `rgba(0, 0, 0, ${clearAlpha})`;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);
    }

    const cx = w / 2;
    const cy = h / 2;

    // Render with Crossfade
    if (this.transitionAlpha < 1.0 && this.previousPresetId !== this.currentPresetId) {
      ctx.save();
      ctx.globalAlpha = 1.0 - this.transitionAlpha;
      this.drawPresetMode(this.previousPresetId, ctx, w, h, cx, cy, audio);
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = this.transitionAlpha;
      this.drawPresetMode(this.currentPresetId, ctx, w, h, cx, cy, audio);
      ctx.restore();
    } else {
      this.drawPresetMode(this.currentPresetId, ctx, w, h, cx, cy, audio);
    }

    ctx.restore();
  }

  // Draw Routine Selector for Curated 16 Presets
  drawPresetMode(presetId, ctx, w, h, cx, cy, audio) {
    const maxAllowedR = Math.min(w, h) * 0.42;
    const r = Math.min(maxAllowedR, Math.min(w, h) * 0.35 * this.size * this.beamSize);

    // Active center coordinates with blink-jump offsets
    const jumpCx = cx + this.circleOffsetX;
    const jumpCy = cy + this.circleOffsetY;

    switch (presetId) {
      case 0: { // Perimeter Orbiting Dots (Ref Image 1) - Blink Jump
        const dotCount = 18;
        const dotRadius = Math.min(22, 14 * this.beamSize);
        ctx.fillStyle = this.getPrimaryColor(1.0, audio);

        for (let i = 0; i < dotCount; i++) {
          const angle = (i / dotCount) * Math.PI * 2 + (this.time * 0.8);
          const jitter = Math.sin(i * 3 + this.time * 6) * (audio.bass * 15 * this.beamSize);
          const px = jumpCx + Math.cos(angle) * (r + jitter);
          const py = jumpCy + Math.sin(angle) * (r + jitter);

          ctx.beginPath();
          ctx.arc(px, py, dotRadius, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      /* ----------------------------------------------------------------------
         PRESET 1: Concentric Alternating Dot Rings (Ref Image 2)
         Odd/Even chasing alternating blinking dots along concentric rings
         ---------------------------------------------------------------------- */
      case 1: {
        const ringConfigs = [
          { count: 24, radius: r * 1.0, dotR: 11 * this.beamSize },
          { count: 18, radius: r * 0.72, dotR: 8.5 * this.beamSize },
          { count: 12, radius: r * 0.45, dotR: 6 * this.beamSize },
          { count: 8,  radius: r * 0.22, dotR: 4 * this.beamSize }
        ];

        ringConfigs.forEach((ring, index) => {
          const rot = this.time * (index % 2 === 0 ? 0.6 : -0.6);

          for (let i = 0; i < ring.count; i++) {
            // Odd/Even beat-synced alternating blinking condition
            const isVisible = (i + index + this.chaseStep) % 2 === 0 || (audio.bass > 0.65 && (i + index) % 3 === 0);
            
            if (isVisible) {
              ctx.fillStyle = (i % 2 === 0 || !this.multiColorMode) ? 
                this.getPrimaryColor(1.0, audio) : this.getSecondaryColor(1.0, audio);

              const angle = (i / ring.count) * Math.PI * 2 + rot;
              const px = jumpCx + Math.cos(angle) * ring.radius;
              const py = jumpCy + Math.sin(angle) * ring.radius;

              ctx.beginPath();
              ctx.arc(px, py, Math.max(2, ring.dotR), 0, Math.PI * 2);
              ctx.fill();
            }
          }
        });
        break;
      }

      case 2: { // Flash-Jump Liquid Sky Bar (Ref Image 3)
        const barWidth = Math.min(w * 0.85, w * 0.7 * this.beamSize);
        const barThickness = Math.min(50, 30 * this.beamSize);

        ctx.save();
        ctx.translate(cx, cy + this.barYOffset);
        ctx.rotate(this.barAngle);

        ctx.strokeStyle = this.getPrimaryColor(1.0, audio);
        ctx.lineWidth = barThickness;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(-barWidth / 2, 0);
        ctx.lineTo(barWidth / 2, 0);
        ctx.stroke();

        ctx.restore();
        break;
      }

      case 3: { // Bold Solid Circle Ring (Ref Image 4) - Blink Jump
        const ringRadius = Math.min(r * 1.0, Math.min(w, h) * 0.38);
        const strokeWidth = Math.min(40, 24 * this.beamSize);

        ctx.strokeStyle = this.getPrimaryColor(1.0, audio);
        ctx.lineWidth = strokeWidth;

        ctx.beginPath();
        ctx.arc(jumpCx, jumpCy, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 4: { // Sine Spacing Bar Wave (Ref Image 5)
        const totalBars = 16;
        const barW = Math.min(30, ((w * 0.7) / totalBars) * this.beamSize);
        const patternHeights = [40, 80, 140, 150, 100, 40, 40, 100, 150, 160, 120, 80, 40];

        ctx.fillStyle = this.getPrimaryColor(1.0, audio);
        const spacingFactor = 1.0 + Math.sin(this.time * 2.5) * 0.4;

        for (let i = 0; i < totalBars; i++) {
          const offsetFromCenter = (i - totalBars / 2 + 0.5) * barW * 1.6 * spacingFactor;
          const px = cx + offsetFromCenter;
          const patternH = (patternHeights[i % patternHeights.length] || 80) * (1 + audio.bass * 0.4) * this.beamSize;

          if (px > 20 && px < w - 20) {
            ctx.fillRect(px, cy - patternH * 0.6, barW * 0.7, patternH * 0.45);
            ctx.fillRect(px, cy + patternH * 0.15, barW * 0.7, patternH * 0.45);
          }
        }
        break;
      }

      case 5: { // Slicing Sector Fan
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.time * 1.8);
        const blades = 6, angleStep = (Math.PI * 2) / blades;
        for (let i = 0; i < blades; i++) {
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, r * 1.3, i * angleStep, (i + 0.6) * angleStep);
          ctx.closePath();
          ctx.fillStyle = (i % 2 === 0) ? this.getPrimaryColor(0.95, audio) : this.getSecondaryColor(0.95, audio);
          ctx.fill();
        }
        ctx.restore();
        break;
      }

      case 6: { // 3D Volumetric Tunnel Boxes
        const ringCount = 7;
        for (let i = 0; i < ringCount; i++) {
          const prog = ((this.time * 1.5 + (i / ringCount)) % 1.0);
          const trR = prog * r * 1.4;
          ctx.save();
          ctx.translate(cx, cy);
          ctx.rotate(this.time * 0.4 * (i % 2 === 0 ? 1 : -1));
          ctx.beginPath();
          ctx.rect(-trR, -trR, trR * 2, trR * 2);
          ctx.lineWidth = (4 + (1 - prog) * 14) * this.beamSize;
          ctx.strokeStyle = (i % 2 === 0) ? this.getPrimaryColor(1 - prog, audio) : this.getSecondaryColor(1 - prog, audio);
          ctx.stroke();
          ctx.restore();
        }
        break;
      }

      case 7: { // Quad-Phase LED Matrix
        const cols = 4, rows = 4;
        const colW = (w * 0.8) / cols, rowH = (h * 0.8) / rows;
        const startX = cx - (w * 0.4) + colW / 2;
        const startY = cy - (h * 0.4) + rowH / 2;

        for (let c = 0; c < cols; c++) {
          for (let rw = 0; rw < rows; rw++) {
            const isAlt = (c + rw + this.chaseStep) % 2 === 0;
            ctx.beginPath();
            ctx.arc(startX + c * colW, startY + rw * rowH, (colW * 0.28) * this.beamSize, 0, Math.PI * 2);
            ctx.fillStyle = isAlt ? this.getPrimaryColor(0.95, audio) : this.getSecondaryColor(0.95, audio);
            ctx.fill();
          }
        }
        break;
      }

      case 8: { // Chasing Spotlight Columns
        const chCols = 8, chW = w / chCols;
        for (let i = 0; i < chCols; i++) {
          const active = (i === this.chaseStep) || (audio.bass > 0.6 && i % 2 === 0);
          if (active) {
            ctx.fillStyle = (i % 2 === 0) ? this.getPrimaryColor(1.0, audio) : this.getSecondaryColor(1.0, audio);
            ctx.fillRect(i * chW + 4, 0, (chW - 8) * this.beamSize, h);
          }
        }
        break;
      }

      case 9: { // Rotating Star Aperture - Blink Jump
        ctx.save();
        ctx.translate(jumpCx, jumpCy);
        ctx.rotate(this.time * 1.2);
        this.drawStar(ctx, 0, 0, 5, r, r * 0.4, this.getPrimaryColor(0.95, audio));
        if (this.multiColorMode) {
          this.drawStar(ctx, 0, 0, 5, r * 0.5, r * 0.2, this.getSecondaryColor(0.95, audio));
        }
        ctx.restore();
        break;
      }

      case 10: { // Audio Wave Ribbon
        const pts = 40;
        ctx.fillStyle = this.getPrimaryColor(0.9, audio);
        ctx.beginPath();
        ctx.moveTo(0, h);
        for (let i = 0; i <= pts; i++) {
          const x = (i / pts) * w;
          const freqVal = ((audio.freqData[i * 2] || 0) / 255) * audio.sensitivity;
          const y = cy + Math.sin(this.time * 3.0 + i * 0.2) * 80 + (freqVal * 100 * this.beamSize);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.closePath();
        ctx.fill();
        break;
      }

      case 11: { // Orbiting Strobe Matrix
        const gridCols = 8, gridRows = 5;
        const gX = (w * 0.8) / gridCols, gY = (h * 0.8) / gridRows;
        const startX = cx - (w * 0.4) + gX / 2;
        const startY = cy - (h * 0.4) + gY / 2;

        for (let c = 0; c < gridCols; c++) {
          for (let rw = 0; rw < gridRows; rw++) {
            if ((c + rw + this.chaseStep) % 2 === 0) {
              const offsetX = Math.sin(this.time * 2 + c) * 10;
              ctx.beginPath();
              ctx.arc(startX + c * gX + offsetX, startY + rw * gY, 10 * this.beamSize, 0, Math.PI * 2);
              ctx.fillStyle = this.getPrimaryColor(1.0, audio);
              ctx.fill();
            }
          }
        }
        break;
      }

      case 12: { // Expanding Iris Aperture - Blink Jump
        const irisR = r * (0.4 + Math.sin(this.time * 3.0) * 0.35);
        ctx.strokeStyle = this.getPrimaryColor(1.0, audio);
        ctx.lineWidth = 20 * this.beamSize;
        ctx.beginPath();
        ctx.arc(jumpCx, jumpCy, Math.max(10, irisR), 0, Math.PI * 2);
        ctx.stroke();
        break;
      }

      case 13: { // Radial Multi-Beam Burst
        const rays = 24;
        const angleStep = (Math.PI * 2) / rays;
        ctx.lineWidth = 10 * this.beamSize;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.time * 0.5);

        for (let i = 0; i < rays; i++) {
          const a = i * angleStep;
          ctx.strokeStyle = (i % 2 === 0) ? this.getPrimaryColor(0.95, audio) : this.getSecondaryColor(0.95, audio);
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * (r * 0.2), Math.sin(a) * (r * 0.2));
          ctx.lineTo(Math.cos(a) * r * 1.1, Math.sin(a) * r * 1.1);
          ctx.stroke();
        }
        ctx.restore();
        break;
      }

      case 14: { // Crosshair Laser Cutter
        const lineLen = Math.min(w, h) * 0.8;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.time * 0.4);

        ctx.strokeStyle = this.getPrimaryColor(1.0, audio);
        ctx.lineWidth = 24 * this.beamSize;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(-lineLen / 2, 0);
        ctx.lineTo(lineLen / 2, 0);
        ctx.moveTo(0, -lineLen / 2);
        ctx.lineTo(0, lineLen / 2);
        ctx.stroke();

        ctx.restore();
        break;
      }

      case 15: { // Diamond Lattice Grid - Blink Jump
        ctx.save();
        ctx.translate(jumpCx, jumpCy);
        ctx.rotate(this.time * 0.6);
        const sides = 4;
        this.drawPolygon(ctx, 0, 0, sides, r * 1.1, this.getPrimaryColor(0.9, audio));
        if (this.multiColorMode) {
          this.drawPolygon(ctx, 0, 0, sides, r * 0.65, this.getSecondaryColor(0.9, audio));
        }
        ctx.restore();
        break;
      }

      case 16: { // Preset 17: Logarithmic Spiral Vortex
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.time * 1.4);
        const totalNodes = 48;
        const goldenAngle = Math.PI * (3 - Math.sqrt(5));
        for (let i = 0; i < totalNodes; i++) {
          const theta = i * goldenAngle;
          const nodeRadius = Math.sqrt(i / totalNodes) * r * 1.15;
          const px = Math.cos(theta) * nodeRadius;
          const py = Math.sin(theta) * nodeRadius;
          const dotSize = Math.max(2, (3 + (i / totalNodes) * 12) * this.beamSize);
          ctx.beginPath();
          ctx.arc(px, py, dotSize, 0, Math.PI * 2);
          ctx.fillStyle = (i % 2 === 0 || !this.multiColorMode)
            ? this.getPrimaryColor(1.0, audio)
            : this.getSecondaryColor(1.0, audio);
          ctx.fill();
        }
        ctx.restore();
        break;
      }

      case 17: { // Preset 18: Liquid Sky Sheet Cutter
        const sheetCount = 5;
        const sheetSpacing = (h * 0.7) / sheetCount;
        const sheetWidth = w * 0.88 * this.beamSize;
        ctx.lineWidth = Math.min(28, 14 * this.beamSize);
        ctx.lineCap = 'round';
        for (let i = 0; i < sheetCount; i++) {
          const yPos = (cy - (h * 0.35)) + i * sheetSpacing + Math.sin(this.time * 2.2 + i * 0.8) * 22;
          ctx.beginPath();
          ctx.moveTo(cx - sheetWidth / 2, yPos);
          ctx.lineTo(cx + sheetWidth / 2, yPos);
          ctx.strokeStyle = (i % 2 === 0 || !this.multiColorMode)
            ? this.getPrimaryColor(0.95, audio)
            : this.getSecondaryColor(0.95, audio);
          ctx.stroke();
        }
        break;
      }

      case 18: { // Preset 19: 3D Wireframe Hypercube
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.time * 0.7);
        const cubeScale = r * 0.95;
        const innerScale = cubeScale * (0.45 + Math.sin(this.time * 2.0) * 0.15);
        ctx.lineWidth = Math.min(18, 8 * this.beamSize);

        // Outer square
        ctx.strokeStyle = this.getPrimaryColor(1.0, audio);
        ctx.strokeRect(-cubeScale / 2, -cubeScale / 2, cubeScale, cubeScale);

        // Inner square
        ctx.strokeStyle = this.multiColorMode ? this.getSecondaryColor(1.0, audio) : this.getPrimaryColor(1.0, audio);
        ctx.strokeRect(-innerScale / 2, -innerScale / 2, innerScale, innerScale);

        // Connecting hypercube struts
        ctx.beginPath();
        const corners = [
          [-cubeScale / 2, -cubeScale / 2, -innerScale / 2, -innerScale / 2],
          [cubeScale / 2, -cubeScale / 2, innerScale / 2, -innerScale / 2],
          [cubeScale / 2, cubeScale / 2, innerScale / 2, innerScale / 2],
          [-cubeScale / 2, cubeScale / 2, -innerScale / 2, innerScale / 2]
        ];
        corners.forEach(([x1, y1, x2, y2]) => {
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
        });
        ctx.stroke();
        ctx.restore();
        break;
      }

      case 19: { // Preset 20: Radial Scanner Tunnel
        ctx.save();
        ctx.translate(cx, cy);
        const sweepAngle = (this.time * 3.5) % (Math.PI * 2);
        // Background rings
        for (let ring = 1; ring <= 4; ring++) {
          ctx.beginPath();
          ctx.arc(0, 0, (r * ring) / 4, 0, Math.PI * 2);
          ctx.lineWidth = Math.max(2, 3 * this.beamSize);
          ctx.strokeStyle = (ring % 2 === 0 && this.multiColorMode)
            ? this.getSecondaryColor(0.4, audio)
            : this.getPrimaryColor(0.4, audio);
          ctx.stroke();
        }
        // Scanning blade
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, r * 1.1, sweepAngle - 0.4, sweepAngle);
        ctx.closePath();
        ctx.fillStyle = this.getPrimaryColor(0.95, audio);
        ctx.fill();
        ctx.restore();
        break;
      }

      case 20: { // Preset 21: Pulsing Audio Hex Lattice
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.time * 0.5);
        const hexRings = 5;
        for (let k = 1; k <= hexRings; k++) {
          const hexRadius = (r / hexRings) * k * (1.0 + Math.sin(this.time * 2.5 + k) * 0.1);
          ctx.lineWidth = Math.min(16, (4 + k * 2) * this.beamSize);
          ctx.strokeStyle = (k % 2 === 0 && this.multiColorMode)
            ? this.getSecondaryColor(0.9, audio)
            : this.getPrimaryColor(0.9, audio);
          this.drawPolygon(ctx, 0, 0, 6, hexRadius, 'transparent');
          ctx.stroke();
        }
        ctx.restore();
        break;
      }

      case 21: { // Preset 22: Kinetic Laser Lissajous
        ctx.save();
        ctx.translate(cx, cy);
        ctx.lineWidth = Math.min(22, 10 * this.beamSize);
        ctx.strokeStyle = this.getPrimaryColor(1.0, audio);
        ctx.beginPath();
        const lissPoints = 120;
        const aFreq = 3;
        const bFreq = 2;
        const deltaPhase = this.time * 1.8;
        for (let i = 0; i <= lissPoints; i++) {
          const t = (i / lissPoints) * Math.PI * 2;
          const lx = Math.sin(aFreq * t + deltaPhase) * (r * 1.05);
          const ly = Math.sin(bFreq * t) * (r * 0.85);
          if (i === 0) ctx.moveTo(lx, ly);
          else ctx.lineTo(lx, ly);
        }
        ctx.stroke();
        ctx.restore();
        break;
      }

      case 22: { // Preset 23: Hyperspace Star Warp
        ctx.save();
        ctx.translate(cx, cy);
        const starCount = 36;
        for (let i = 0; i < starCount; i++) {
          const angle = (i / starCount) * Math.PI * 2;
          const prog = ((this.time * 1.5 + (i * 0.08)) % 1.0);
          const dist = prog * r * 1.25;
          const length = (prog * 45 + 10) * this.beamSize;
          const x1 = Math.cos(angle) * dist;
          const y1 = Math.sin(angle) * dist;
          const x2 = Math.cos(angle) * (dist + length);
          const y2 = Math.sin(angle) * (dist + length);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineWidth = Math.max(2, (prog * 8) * this.beamSize);
          ctx.strokeStyle = (i % 2 === 0 || !this.multiColorMode)
            ? this.getPrimaryColor(prog, audio)
            : this.getSecondaryColor(prog, audio);
          ctx.stroke();
        }
        ctx.restore();
        break;
      }

      case 23: { // Preset 24: Dual Slicing Triangle Fans
        ctx.save();
        ctx.translate(cx, cy);
        // Fan 1 (clockwise)
        ctx.save();
        ctx.rotate(this.time * 2.2);
        this.drawPolygon(ctx, 0, 0, 3, r * 1.0, this.getPrimaryColor(0.9, audio));
        ctx.restore();

        // Fan 2 (counter-clockwise)
        if (this.multiColorMode) {
          ctx.save();
          ctx.rotate(-this.time * 2.2);
          this.drawPolygon(ctx, 0, 0, 3, r * 0.65, this.getSecondaryColor(0.9, audio));
          ctx.restore();
        }
        ctx.restore();
        break;
      }

      case 24: { // Preset 25: Bio-Laser DNA Helix
        ctx.save();
        ctx.translate(cx, cy);
        const pairs = 28;
        const helixWidth = w * 0.7 * this.beamSize;
        const helixHeight = r * 0.85;
        const stepX = helixWidth / pairs;
        const startX = -helixWidth / 2;

        for (let i = 0; i < pairs; i++) {
          const x = startX + i * stepX;
          const phase = this.time * 3.0 + i * 0.28;
          const y1 = Math.sin(phase) * helixHeight;
          const y2 = -y1;

          // Cross-link rungs
          if (i % 2 === 0) {
            ctx.beginPath();
            ctx.moveTo(x, y1);
            ctx.lineTo(x, y2);
            ctx.lineWidth = Math.max(1, 2.5 * this.beamSize);
            ctx.strokeStyle = this.multiColorMode ? this.getSecondaryColor(0.6, audio) : this.getPrimaryColor(0.6, audio);
            ctx.stroke();
          }

          // Strand 1 node
          ctx.beginPath();
          ctx.arc(x, y1, Math.max(2, 6 * this.beamSize), 0, Math.PI * 2);
          ctx.fillStyle = this.getPrimaryColor(1.0, audio);
          ctx.fill();

          // Strand 2 node
          ctx.beginPath();
          ctx.arc(x, y2, Math.max(2, 6 * this.beamSize), 0, Math.PI * 2);
          ctx.fillStyle = this.multiColorMode ? this.getSecondaryColor(1.0, audio) : this.getPrimaryColor(1.0, audio);
          ctx.fill();
        }
        ctx.restore();
        break;
      }

      case 25: { // Preset 26: Pulsing Metatron Cube
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.time * 0.4);
        const nodeRadius = Math.max(2, 6 * this.beamSize);
        const centerR = r * 0.75;
        const nodePoints = [[0, 0]]; // Center

        // Inner 6 circles (Hexagon ring 1)
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          nodePoints.push([Math.cos(a) * (centerR * 0.5), Math.sin(a) * (centerR * 0.5)]);
        }
        // Outer 6 circles (Hexagon ring 2)
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
          nodePoints.push([Math.cos(a) * centerR, Math.sin(a) * centerR]);
        }

        // Draw connecting sacred corridors between points
        ctx.lineWidth = Math.max(1, 2 * this.beamSize);
        ctx.strokeStyle = this.getPrimaryColor(0.5 + audio.bass * 0.4, audio);
        for (let i = 0; i < nodePoints.length; i++) {
          for (let j = i + 1; j < nodePoints.length; j++) {
            ctx.beginPath();
            ctx.moveTo(nodePoints[i][0], nodePoints[i][1]);
            ctx.lineTo(nodePoints[j][0], nodePoints[j][1]);
            ctx.stroke();
          }
        }

        // Draw node circles
        nodePoints.forEach(([nx, ny], idx) => {
          ctx.beginPath();
          ctx.arc(nx, ny, nodeRadius, 0, Math.PI * 2);
          ctx.fillStyle = (idx % 2 === 0 || !this.multiColorMode)
            ? this.getPrimaryColor(1.0, audio)
            : this.getSecondaryColor(1.0, audio);
          ctx.fill();
        });
        ctx.restore();
        break;
      }

      case 26: { // Preset 27: Infinite Torus Tunnel
        ctx.save();
        ctx.translate(cx, cy);
        const torusRings = 10;
        for (let i = 0; i < torusRings; i++) {
          const p = ((this.time * 1.6 + (i / torusRings)) % 1.0);
          const currentR = p * r * 1.35;
          const xStretch = 1.0 + Math.sin(this.time * 2 + i * 0.4) * 0.25;
          const yStretch = 1.0 + Math.cos(this.time * 2 + i * 0.4) * 0.25;
          ctx.save();
          ctx.rotate(this.time * 0.3 + i * 0.15);
          ctx.beginPath();
          ctx.ellipse(0, 0, Math.max(2, currentR * xStretch), Math.max(2, currentR * yStretch * 0.6), 0, 0, Math.PI * 2);
          ctx.lineWidth = Math.min(18, (2 + (1 - p) * 12) * this.beamSize);
          ctx.strokeStyle = (i % 2 === 0 || !this.multiColorMode)
            ? this.getPrimaryColor(1 - p, audio)
            : this.getSecondaryColor(1 - p, audio);
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
        break;
      }

      case 27: { // Preset 28: Laser Rose Rhodonea
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(this.time * 0.8);
        const kPetals = 4; // 8-petal rose curve
        const rosePoints = 180;
        ctx.lineWidth = Math.min(22, 9 * this.beamSize);
        ctx.strokeStyle = this.getPrimaryColor(1.0, audio);
        ctx.beginPath();
        for (let i = 0; i <= rosePoints; i++) {
          const theta = (i / rosePoints) * Math.PI * 2;
          const currentRadius = Math.cos(kPetals * theta) * r * (0.95 + audio.bass * 0.2);
          const px = Math.cos(theta) * currentRadius;
          const py = Math.sin(theta) * currentRadius;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();

        if (this.multiColorMode) {
          ctx.save();
          ctx.rotate(-this.time * 1.2);
          ctx.lineWidth = Math.min(14, 6 * this.beamSize);
          ctx.strokeStyle = this.getSecondaryColor(0.85, audio);
          ctx.beginPath();
          for (let i = 0; i <= rosePoints; i++) {
            const theta = (i / rosePoints) * Math.PI * 2;
            const currentRadius = Math.sin(3 * theta) * r * 0.6;
            const px = Math.cos(theta) * currentRadius;
            const py = Math.sin(theta) * currentRadius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
        break;
      }

      case 28: { // Preset 29: Scanning Horizon Grid
        const gridLinesV = 9;
        const gridLinesH = 8;
        const horizonY = cy - (h * 0.1);
        const bottomY = cy + (h * 0.45);
        ctx.lineWidth = Math.max(1.5, 3 * this.beamSize);

        // Perspective vertical lines
        for (let i = 0; i < gridLinesV; i++) {
          const bottomX = cx + (i - (gridLinesV - 1) / 2) * (w * 0.12 * this.beamSize);
          ctx.beginPath();
          ctx.moveTo(cx, horizonY);
          ctx.lineTo(bottomX, bottomY);
          ctx.strokeStyle = this.getPrimaryColor(0.8, audio);
          ctx.stroke();
        }

        // Receding horizontal lines moving towards viewer
        const speed = (this.time * 2.2) % 1.0;
        for (let j = 0; j < gridLinesH; j++) {
          const prog = (j + speed) / gridLinesH;
          const lineY = horizonY + Math.pow(prog, 2.2) * (bottomY - horizonY);
          const spanW = w * 0.9 * Math.pow(prog, 1.2);
          ctx.beginPath();
          ctx.moveTo(cx - spanW / 2, lineY);
          ctx.lineTo(cx + spanW / 2, lineY);
          ctx.strokeStyle = (j % 2 === 0 || !this.multiColorMode)
            ? this.getPrimaryColor(prog, audio)
            : this.getSecondaryColor(prog, audio);
          ctx.stroke();
        }
        break;
      }

      case 29: { // Preset 30: Kinetic Geodesic Sphere
        ctx.save();
        ctx.translate(cx, cy);
        const geoLatRings = 7;
        const geoLongRings = 6;
        for (let i = 1; i <= geoLatRings; i++) {
          const latAngle = ((i / (geoLatRings + 1)) - 0.5) * Math.PI;
          const ringR = Math.cos(latAngle) * r;
          const ringY = Math.sin(latAngle) * r * 0.85;
          ctx.save();
          ctx.translate(0, ringY);
          ctx.scale(1.0, 0.35 + Math.sin(this.time * 1.5) * 0.1);
          ctx.beginPath();
          ctx.arc(0, 0, Math.max(2, ringR), 0, Math.PI * 2);
          ctx.lineWidth = Math.max(1.5, 3 * this.beamSize);
          ctx.strokeStyle = (i % 2 === 0 && this.multiColorMode)
            ? this.getSecondaryColor(0.85, audio)
            : this.getPrimaryColor(0.85, audio);
          ctx.stroke();
          ctx.restore();
        }
        for (let j = 0; j < geoLongRings; j++) {
          const rotA = (j / geoLongRings) * Math.PI + (this.time * 0.6);
          ctx.save();
          ctx.rotate(rotA);
          ctx.scale(0.3, 1.0);
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.lineWidth = Math.max(1, 2 * this.beamSize);
          ctx.strokeStyle = this.getPrimaryColor(0.5, audio);
          ctx.stroke();
          ctx.restore();
        }
        ctx.restore();
        break;
      }

      case 30: { // Preset 31: Laser Equalizer Stacks
        ctx.save();
        ctx.translate(cx, cy);
        const bands = 16;
        const angleStep = (Math.PI * 2) / bands;
        const innerRadius = r * 0.25;
        const maxBarLen = r * 0.85;

        for (let i = 0; i < bands; i++) {
          const a = i * angleStep + (this.time * 0.3);
          const freqIndex = Math.floor((i / bands) * 32);
          const freqMagnitude = audio.freqData ? (audio.freqData[freqIndex] || 0) / 255 : 0.5;
          const energyBoost = Math.max(0.15, (freqMagnitude * 0.7 + audio.bass * 0.3) * this.beamSize);
          const barLength = innerRadius + energyBoost * maxBarLen;

          const x1 = Math.cos(a) * innerRadius;
          const y1 = Math.sin(a) * innerRadius;
          const x2 = Math.cos(a) * barLength;
          const y2 = Math.sin(a) * barLength;

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.lineWidth = Math.min(18, 8 * this.beamSize);
          ctx.lineCap = 'round';
          ctx.strokeStyle = (i % 2 === 0 || !this.multiColorMode)
            ? this.getPrimaryColor(0.95, audio)
            : this.getSecondaryColor(0.95, audio);
          ctx.stroke();
        }
        ctx.restore();
        break;
      }

      case 31: { // Preset 32: Cyberpunk Dual Prism Cutter
        ctx.save();
        ctx.translate(cx, cy);
        const prismSides = 4;
        const prismR = r * 1.1;

        // Prism 1
        ctx.save();
        ctx.rotate(this.time * 1.5);
        ctx.lineWidth = Math.min(26, 12 * this.beamSize);
        ctx.strokeStyle = this.getPrimaryColor(1.0, audio);
        this.drawPolygon(ctx, 0, 0, prismSides, prismR, 'transparent');
        ctx.stroke();
        ctx.restore();

        // Prism 2 (Shearing counter-rotation)
        ctx.save();
        ctx.rotate(-this.time * 1.5);
        ctx.lineWidth = Math.min(26, 12 * this.beamSize);
        ctx.strokeStyle = this.multiColorMode ? this.getSecondaryColor(1.0, audio) : this.getPrimaryColor(1.0, audio);
        this.drawPolygon(ctx, 0, 0, prismSides, prismR * 0.7, 'transparent');
        ctx.stroke();
        ctx.restore();

        ctx.restore();
        break;
      }

      default:
        break;
    }
  }

  drawPolygon(ctx, x, y, sides, radius, fillStyle) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }

  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius, fillStyle) {
    let rot = Math.PI / 2 * 3;
    let x = cx, y = cy;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
}
