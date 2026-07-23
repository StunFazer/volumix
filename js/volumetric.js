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
      { id: 15, name: 'Preset 16: Diamond Lattice Grid', icon: '❖', desc: 'Rotating diamond lattice beam grid that blink-jumps on beat' }
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

    // Strobe Handler
    this.strobeCounter++;
    if (this.strobeRate > 0) {
      const strobeInterval = Math.max(4, 14 - this.strobeRate * 1.5);
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
