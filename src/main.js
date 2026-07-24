import { GAME_W, GAME_H, ASPECT } from "./config.js";
import { preloadAll, images, sounds } from "./assets.js";
import { Input } from "./input.js";
import { Scene1 } from "./scene1.js";
import { Scene2 } from "./scene2.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
canvas.width = GAME_W;
canvas.height = GAME_H;
ctx.imageSmoothingEnabled = false;

const startOverlay = document.getElementById("start-overlay");
const progressBar = document.getElementById("progress-bar");
const startBtn = document.getElementById("start-btn");

let input;
let currentScene = null;
let lastTime = 0;

function resize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  let displayW, displayH;
  if (w / h > ASPECT) {
    displayH = h;
    displayW = h * ASPECT;
  } else {
    displayW = w;
    displayH = w / ASPECT;
  }
  canvas.style.width = displayW + "px";
  canvas.style.height = displayH + "px";
}
window.addEventListener("resize", resize);
resize();

function goToScene2() {
  currentScene = new Scene2(images, sounds, input, canvas, goToScene3Placeholder);
}

function goToScene3Placeholder() {
  // Cena 3 ainda não implementada — mostra uma tela simples de "continua"
  currentScene = {
    update() {},
    draw(ctx) {
      ctx.fillStyle = "#0c0714";
      ctx.fillRect(0, 0, GAME_W, GAME_H);
      ctx.fillStyle = "#fff";
      ctx.font = "16px monospace";
      ctx.textAlign = "center";
      ctx.fillText("Fim do trecho implementado — Cena 3 em breve!", GAME_W / 2, GAME_H / 2);
      ctx.textAlign = "left";
    },
  };
}

function loop(t) {
  const dt = Math.min(0.05, (t - lastTime) / 1000 || 0);
  lastTime = t;

  if (currentScene) {
    currentScene.update(dt);
    ctx.clearRect(0, 0, GAME_W, GAME_H);
    currentScene.draw(ctx);
  }

  requestAnimationFrame(loop);
}

async function boot() {
  await preloadAll((pct) => {
    progressBar.style.width = Math.round(pct * 100) + "%";
  });
  startBtn.disabled = false;
  startBtn.textContent = "Clique para começar";
}

startBtn.addEventListener("click", () => {
  startOverlay.style.display = "none";

  // fullscreen (gesto do usuário exigido pelo navegador)
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen().catch(() => {});

  input = new Input(canvas);
  currentScene = new Scene1(images, sounds, input, goToScene2);

  requestAnimationFrame(loop);
});

boot();
