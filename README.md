# VOLUMIX — Portable Volumetric Light Synthesizer

**Volumix** is an audio-reactive 3D volumetric light synthesizer designed for mobile devices, tablets, laptops, and portable projectors. Volumix is built from the ground up using HTML5 Canvas, Web Audio API, and CSS Grid to turn any portable projector into a professional volumetric light show.

---

## 📸 visual Style & Aesthetics

Volumix is optimized specifically for physical **fog, smoke, and haze environments**:
- **Zero Light Bleed**: Rendered on a strict pitch-black (`#000000`) background to eliminate grey projector bounding boxes.
- **High-Contrast Geometric Shapes**: Emits solid, high-intensity color shapes (orbiting beams, scanning sheets, tunnels, and apertures) that slice through air.
- **Ultra-Minimal VJ UI**: Dark monochromatic design prevents screen glare from illuminating dark performance rooms.

---

## ⚡ Core Features

- **16 Curated Volumetric Presets**: A suite of 16 custom procedural visual generators including:
  - *Perimeter Orbiting Dots* (hollow light cylinders)
  - *Concentric Alternating Dot Rings* (twinkling star tunnels)
  - *Flash-Jump Liquid Sky Bar* (instant beat-synced orientation jumps)
  - *Sine Spacing Bar Wave* (breathing vertical light slats)
- **Real-Time Adaptive BPM Engine**: Fast/Slow dual-energy onset detector that captures beats from both microphone input and uploaded audio files.
- **Global Trailing Fade / Motion Persistence**: Adjust persistence from `OFF` (sharp frames) up to `90%` (long decaying motion tails, star-trail arcs, and scanner sheets).
- **Responsive Portrait & Landscape Layouts**:
  - *Edit Mode*: Canvas scales to 50% screen size so UI controls never overlap the graphics.
  - *Perform Mode*: Canvas instantly expands to `100%` edge-to-edge fullscreen when controls are toggled hidden.
- **Touch-Optimized VJ Dock**: Large 40px stepper buttons (`[-]` and `[+]`) and 34px color chips designed for fat-thumb mobile mixing.

---

## 🚀 Quick Start

### 1. Run Locally
Serve the directory using any local web server. For example, using Python:
```bash
python -m http.server 8080
```
Open your browser and navigate to `http://localhost:8080`.

### 2. Mobile Device Testing
To run on your smartphone or tablet on the same local Wi-Fi network:
1. Find your local IP address (e.g. `192.168.x.x`).
2. Open the mobile browser and visit `http://192.168.x.x:8080`.
3. Tap **MIC** to enable audio-reactivity from surrounding ambient music!

---

## 🎛️ Keyboard & Touch Bindings
- **Tap Canvas / Screen**: Toggle UI Controls hidden/visible.
- **Tap Color Chips**: Change laser diode wavelength color scheme (Blue, Green, Red, Cyan, Amber, Violet, White, Rainbow).
- **Favs Button**: Filter the 16 presets grid modal to quickly launch your favorite routines.
