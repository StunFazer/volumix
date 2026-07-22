/**
 * VOLUMIX - 4-Corner Keystone Correction Engine (Homography Transformation)
 */

export class KeystoneEngine {
  constructor(containerElement) {
    this.container = containerElement;
    this.overlay = document.getElementById('keystone-overlay');
    this.handles = {
      tl: document.getElementById('ks-tl'),
      tr: document.getElementById('ks-tr'),
      br: document.getElementById('ks-br'),
      bl: document.getElementById('ks-bl')
    };

    // Default normalized corner points [x, y] from 0 to 1
    this.corners = {
      tl: { x: 0.0, y: 0.0 },
      tr: { x: 1.0, y: 0.0 },
      br: { x: 1.0, y: 1.0 },
      bl: { x: 0.0, y: 1.0 }
    };

    this.activeHandle = null;
    this.isEnabled = false;
    this.loadSavedCorners();
    this.setupEvents();
  }

  // Toggle Keystone Alignment Overlay
  toggle() {
    this.isEnabled = !this.isEnabled;
    if (this.isEnabled) {
      this.overlay.classList.remove('hidden');
      this.updateHandlePositions();
    } else {
      this.overlay.classList.add('hidden');
    }
    return this.isEnabled;
  }

  // Load saved corner positions from localStorage
  loadSavedCorners() {
    try {
      const saved = localStorage.getItem('volumix_keystone');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.tl && parsed.tr && parsed.br && parsed.bl) {
          this.corners = parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load keystone settings:', e);
    }
  }

  // Save corner positions to localStorage
  saveCorners() {
    try {
      localStorage.setItem('volumix_keystone', JSON.stringify(this.corners));
    } catch (e) {
      console.warn('Could not save keystone settings:', e);
    }
  }

  // Reset to default rectangle
  reset() {
    this.corners = {
      tl: { x: 0.0, y: 0.0 },
      tr: { x: 1.0, y: 0.0 },
      br: { x: 1.0, y: 1.0 },
      bl: { x: 0.0, y: 1.0 }
    };
    this.saveCorners();
    this.updateHandlePositions();
  }

  // Update DOM Handle element positions
  updateHandlePositions() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    Object.keys(this.handles).forEach(key => {
      const handle = this.handles[key];
      const pt = this.corners[key];
      handle.style.left = `${pt.x * width}px`;
      handle.style.top = `${pt.y * height}px`;
    });
  }

  // Touch and Pointer Drag Event Listeners
  setupEvents() {
    window.addEventListener('resize', () => this.updateHandlePositions());

    Object.keys(this.handles).forEach(key => {
      const handle = this.handles[key];

      const startDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.activeHandle = key;
      };

      handle.addEventListener('pointerdown', startDrag);
      handle.addEventListener('touchstart', startDrag, { passive: false });
    });

    const onMove = (e) => {
      if (!this.activeHandle) return;
      e.preventDefault();

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const normX = Math.max(0, Math.min(1, clientX / window.innerWidth));
      const normY = Math.max(0, Math.min(1, clientY / window.innerHeight));

      this.corners[this.activeHandle] = { x: normX, y: normY };
      this.updateHandlePositions();
      this.saveCorners();
    };

    const stopDrag = () => {
      this.activeHandle = null;
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('touchend', stopDrag);
  }

  // Apply Perspective Transformation Matrix to Canvas 2D Context
  applyTransform(ctx, width, height) {
    // If no warp is active (default rectangle), skip heavy matrix math
    const c = this.corners;
    const isDefault = c.tl.x === 0 && c.tl.y === 0 &&
                      c.tr.x === 1 && c.tr.y === 0 &&
                      c.br.x === 1 && c.br.y === 1 &&
                      c.bl.x === 0 && c.bl.y === 1;

    if (isDefault) return;

    // Convert normalized corner points to pixel coordinates
    const src = [
      0, 0,
      width, 0,
      width, height,
      0, height
    ];

    const dst = [
      c.tl.x * width, c.tl.y * height,
      c.tr.x * width, c.tr.y * height,
      c.br.x * width, c.br.y * height,
      c.bl.x * width, c.bl.y * height
    ];

    // Compute 3x3 Homography Matrix
    const H = this.getPerspectiveTransform(src, dst);

    if (H) {
      // Apply transform via Canvas 2D matrix transformation approximation
      ctx.transform(H[0], H[3], H[1], H[4], H[2], H[5]);
    }
  }

  // Solve 8-parameter Homography Matrix mapping src -> dst
  getPerspectiveTransform(src, dst) {
    // Direct Linear Transform (DLT) for 4 point correspondences
    const a = [];
    for (let i = 0; i < 4; i++) {
      const sx = src[i * 2], sy = src[i * 2 + 1];
      const dx = dst[i * 2], dy = dst[i * 2 + 1];
      a.push([sx, sy, 1, 0, 0, 0, -dx * sx, -dx * sy, dx]);
      a.push([0, 0, 0, sx, sy, 1, -dy * sx, -dy * sy, dy]);
    }

    // Solve Gaussian Elimination for A * h = 0
    const h = this.solveGaussian(a);
    if (!h) return null;
    return [
      h[0] / h[8], h[1] / h[8], h[2] / h[8],
      h[3] / h[8], h[4] / h[8], h[5] / h[8],
      h[6] / h[8], h[7] / h[8], 1.0
    ];
  }

  // Gaussian elimination solver for 8x9 system
  solveGaussian(A) {
    const n = 8;
    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(A[j][i]) > Math.abs(A[maxRow][i])) {
          maxRow = j;
        }
      }
      const temp = A[i];
      A[i] = A[maxRow];
      A[maxRow] = temp;

      if (Math.abs(A[i][i]) < 1e-8) return null;

      for (let j = i + 1; j < n; j++) {
        const factor = A[j][i] / A[i][i];
        for (let k = i; k <= n; k++) {
          A[j][k] -= factor * A[i][k];
        }
      }
    }

    const x = new Array(9).fill(0);
    x[8] = 1.0;
    for (let i = n - 1; i >= 0; i--) {
      let sum = A[i][n];
      for (let j = i + 1; j < n; j++) {
        sum -= A[i][j] * x[j];
      }
      x[i] = sum / A[i][i];
    }
    return x;
  }
}
