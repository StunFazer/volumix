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

- **24 Curated Volumetric Presets**: A comprehensive suite of 24 procedural visual generators:
  - *Perimeter Orbiting Dots*, *Concentric Alternating Dot Rings*, *Flash-Jump Liquid Sky Bar*, *Sine Spacing Bar Wave*
  - *Logarithmic Spiral Vortex*, *Liquid Sky Sheet Cutter*, *3D Wireframe Hypercube*, *Radial Scanner Tunnel*
  - *Pulsing Audio Hex Lattice*, *Kinetic Laser Lissajous*, *Hyperspace Star Warp*, *Dual Slicing Triangle Fans*
- **Offline Progressive Web App (PWA)**: Standalone installation support on Android, iOS, tablet, and desktop with zero-network service worker caching.
- **Ultra-Slow to High-Speed Strobe Engine**: Multi-tiered strobe frequencies from slow atmospheric pulses (28 frames / ~2 Hz) to rapid stroboscopic cuts.
- **Dual Reactivity Modes (Audio & Pure BPM)**: Switch effortlessly between microphone / audio track listening and a dedicated procedural BPM beat clock.
- **Global Trailing Fade / Motion Persistence**: Adjust persistence from `OFF` (sharp frames) up to `90%` (long decaying motion tails, star-trail arcs, and scanner sheets).
- **Responsive Portrait & Landscape Layouts**:
  - *Edit Mode*: Canvas scales cleanly so controls never distort or obscure the artwork.
  - *Perform Mode*: Canvas expands to `100%` edge-to-edge fullscreen projection when controls are toggled hidden.
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
