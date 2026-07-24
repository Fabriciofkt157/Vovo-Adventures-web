export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function dist(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

export function aabbHit(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function circleHit(x1, y1, r1, x2, y2, r2) {
  return dist(x1, y1, x2, y2) < r1 + r2;
}

// Toca um Audio clonando o elemento (permite sobrepor sons curtos de SFX)
export function playSfx(audioEl, volume = 1) {
  if (!audioEl) return;
  try {
    const c = audioEl.cloneNode();
    c.volume = volume;
    c.play().catch(() => {});
  } catch (e) {}
}

export function playLoop(audioEl, volume = 1) {
  if (!audioEl) return;
  audioEl.loop = true;
  audioEl.volume = volume;
  audioEl.currentTime = 0;
  audioEl.play().catch(() => {});
}

export function stopAudio(audioEl) {
  if (!audioEl) return;
  audioEl.pause();
  audioEl.currentTime = 0;
}

export function fadeOutAndStop(audioEl, ms = 600) {
  if (!audioEl) return;
  const startVol = audioEl.volume;
  const steps = 20;
  let i = 0;
  const id = setInterval(() => {
    i++;
    audioEl.volume = Math.max(0, startVol * (1 - i / steps));
    if (i >= steps) {
      clearInterval(id);
      stopAudio(audioEl);
      audioEl.volume = startVol;
    }
  }, ms / steps);
}

// -----------------------------------------------------------------
// Classe genérica de animação por lista de frames (HTMLImageElement[])
// -----------------------------------------------------------------
export class FrameAnim {
  constructor(frames, fps = 12, loop = true) {
    this.frames = frames;
    this.fps = fps;
    this.loop = loop;
    this.time = 0;
    this.index = 0;
    this.finished = false;
  }

  reset() {
    this.time = 0;
    this.index = 0;
    this.finished = false;
  }

  update(dt, reverse = false) {
    if (this.finished) return;
    this.time += dt;
    const frameDur = 1 / this.fps;
    while (this.time >= frameDur) {
      this.time -= frameDur;
      if (reverse) {
        this.index--;
        if (this.index < 0) {
          if (this.loop) {
            this.index = this.frames.length - 1;
          } else {
            this.index = 0;
            this.finished = true;
          }
        }
      } else {
        this.index++;
        if (this.index >= this.frames.length) {
          if (this.loop) {
            this.index = 0;
          } else {
            this.index = this.frames.length - 1;
            this.finished = true;
          }
        }
      }
    }
  }

  get current() {
    return this.frames[this.index];
  }
}

// Câmera simples de scroll horizontal
export class Camera {
  constructor(viewW, viewH, worldW) {
    this.viewW = viewW;
    this.viewH = viewH;
    this.worldW = worldW;
    this.x = 0;
  }

  follow(targetX) {
    const desired = targetX - this.viewW / 2;
    this.x = clamp(desired, 0, Math.max(0, this.worldW - this.viewW));
  }
}
