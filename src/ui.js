import { GAME_W, GAME_H, XP, CARD_TIERS, DISABLED_CARD_KEYWORDS } from "./config.js";
import { clamp } from "./utils.js";

export class DialogueBox {
  constructor(text) {
    this.fullText = text;
    this.shown = 0;
    this.active = false;
    this.speed = 28; // chars/seg
    this.timer = 0;
  }

  show() {
    this.active = true;
    this.shown = 0;
    this.timer = 0;
  }

  hide() {
    this.active = false;
  }

  update(dt) {
    if (!this.active) return;
    this.timer += dt;
    this.shown = Math.min(this.fullText.length, Math.floor(this.timer * this.speed));
  }

  get finishedTyping() {
    return this.shown >= this.fullText.length;
  }

  skipToEnd() {
    this.shown = this.fullText.length;
  }

  draw(ctx, boxImg) {
    if (!this.active) return;
    const boxW = GAME_W - 40;
    const boxX = 20;
    let boxH, boxY, imgY;

    ctx.save();

    if (boxImg) {
      boxH = boxImg.height * (boxW / boxImg.width);
      boxY = GAME_H - boxH - 10;
      ctx.drawImage(boxImg, boxX, boxY, boxW, boxH);
    } else {
      boxH = 84;
      boxY = GAME_H - boxH - 10;
      ctx.fillStyle = "rgba(20,14,26,0.92)";
      roundRect(ctx, boxX, boxY, boxW, boxH, 8);
      ctx.fill();
      ctx.strokeStyle = "#caa8ff";
      ctx.lineWidth = 2;
      roundRect(ctx, boxX, boxY, boxW, boxH, 8);
      ctx.stroke();
    }

    const padX = 22;
    const padY = boxImg ? 14 : 12;
    ctx.fillStyle = boxImg ? "#3a2a06" : "#ffffff";
    ctx.font = "13px monospace";
    ctx.textBaseline = "top";
    const text = this.fullText.slice(0, this.shown);
    wrapText(ctx, text, boxX + padX, boxY + padY, boxW - padX * 2, 16);

    if (this.finishedTyping) {
      ctx.fillStyle = boxImg ? "#5a4108" : "#caa8ff";
      ctx.font = "11px monospace";
      ctx.fillText("(clique para continuar)", boxX + padX, boxY + boxH - 18);
    }
    ctx.restore();
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let yy = y;
  for (const w of words) {
    const test = line + w + " ";
    if (ctx.measureText(test).width > maxWidth && line !== "") {
      ctx.fillText(line, x, yy);
      line = w + " ";
      yy += lineHeight;
    } else {
      line = test;
    }
  }
  ctx.fillText(line, x, yy);
}

// ---------------------------------------------------------------------
export function drawHUD(ctx, images, player) {
  const vidaImg = images.vida[clamp(player.health, 0, 6)];
  ctx.drawImage(vidaImg, 10, 8);

  const req = XP.requirement(player.level);
  const stage = clamp(Math.round((player.xp / req) * 6), 0, 6);
  const xpImg = images.xp[stage];
  ctx.drawImage(xpImg, 10, 8 + vidaImg.height + 4);

  ctx.fillStyle = "#fff";
  ctx.font = "10px monospace";
  ctx.fillText("Nv " + player.level, 12, 8 + vidaImg.height + xpImg.height + 14);
}

export function drawEquippedCard(ctx, cardImg) {
  if (!cardImg) return;
  const w = 46, h = 66;
  const x = GAME_W - w - 10;
  const y = 46;
  ctx.save();
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
  ctx.drawImage(cardImg, x, y, w, h);
  ctx.strokeStyle = "#ffd75e";
  ctx.strokeRect(x, y, w, h);
  ctx.restore();
}

// ---------------------------------------------------------------------
// Sistema de Dado + Cartas de level up
// ---------------------------------------------------------------------
export const CARD_META = {
  dano: "Aumenta o dano da Senhorinha",
  movimento: "Altera a velocidade de movimento",
  velocidadeatk: "Altera a velocidade de ataque",
  vida: "Aumenta a vida máxima",
  xp: "Concede experiência bônus",
  inimigovelocidade: "Altera a velocidade dos inimigos",
  inimigovida: "Altera a vida dos inimigos",
  velocidadeinimigo: "Altera a velocidade dos inimigos",
  vidainimigo: "Altera a vida dos inimigos",
  spawninimigo: "Altera o número de inimigos",
  desconto: "Desconto em compras (em breve)",
  ouro: "Ouro (não implementado)",
  guardachuva: "Sombrinha (não implementado)",
};

export function rollDice() {
  return 1 + Math.floor(Math.random() * 6);
}

export function pickCards(images, diceNumber, count = 3) {
  const pool = images.cartas[diceNumber];
  const validKeys = Object.keys(pool).filter(
    (k) => !DISABLED_CARD_KEYWORDS.some((bad) => k.includes(bad))
  );
  // embaralha
  const shuffled = validKeys.slice().sort(() => Math.random() - 0.5);
  const chosenKeys = [];
  while (chosenKeys.length < count) {
    chosenKeys.push(shuffled[chosenKeys.length % shuffled.length]);
  }
  return chosenKeys.map((k) => ({ key: k, img: pool[k], tier: CARD_TIERS[diceNumber] }));
}

export class DiceOverlay {
  constructor(images, sounds) {
    this.images = images;
    this.sounds = sounds;
    this.active = false;
    this.phase = null; // 'rolling' | 'choosing'
    this.timer = 0;
    this.frameIdx = 0;
    this.diceNumber = 1;
    this.cards = [];
    this.hoverIndex = -1;
    this.onChoose = null;
  }

  start(onChoose) {
    this.active = true;
    this.phase = "rolling";
    this.timer = 0;
    this.frameIdx = 0;
    this.diceNumber = rollDice();
    this.cards = [];
    this.onChoose = onChoose;
  }

  update(dt) {
    if (!this.active) return;
    if (this.phase === "rolling") {
      this.timer += dt;
      const total = this.images.dadoAnimacao.length;
      this.frameIdx = Math.min(total - 1, Math.floor((this.timer / 1.1) * total));
      if (this.timer >= 1.1) {
        this.phase = "choosing";
        this.cards = pickCards(this.images, this.diceNumber, 3);
      }
    }
  }

  handleClick(mx, my) {
    if (!this.active || this.phase !== "choosing") return;
    const layout = this._layout();
    for (let i = 0; i < layout.length; i++) {
      const c = layout[i];
      if (mx >= c.x && mx <= c.x + c.w && my >= c.y && my <= c.y + c.h) {
        const chosen = this.cards[i];
        this.active = false;
        if (this.onChoose) this.onChoose(chosen);
        return;
      }
    }
  }

  handleMouseMove(mx, my) {
    if (!this.active || this.phase !== "choosing") return;
    const layout = this._layout();
    this.hoverIndex = -1;
    layout.forEach((c, i) => {
      if (mx >= c.x && mx <= c.x + c.w && my >= c.y && my <= c.y + c.h) this.hoverIndex = i;
    });
  }

  _layout() {
    const w = 90, h = 128, gap = 20;
    const totalW = w * 3 + gap * 2;
    const startX = (GAME_W - totalW) / 2;
    const y = GAME_H / 2 - h / 2 + 20;
    return [0, 1, 2].map((i) => ({ x: startX + i * (w + gap), y, w, h }));
  }

  draw(ctx) {
    if (!this.active) return;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(0, 0, GAME_W, GAME_H);

    if (this.phase === "rolling") {
      const img = this.images.dadoAnimacao[this.frameIdx];
      const scale = 2;
      ctx.drawImage(img, GAME_W / 2 - (img.width * scale) / 2, GAME_H / 2 - (img.height * scale) / 2, img.width * scale, img.height * scale);
    } else if (this.phase === "choosing") {
      const faceImg = this.images.dadoNumero[this.diceNumber - 1];
      ctx.drawImage(faceImg, GAME_W / 2 - faceImg.width / 2, GAME_H / 2 - 110, faceImg.width, faceImg.height);

      ctx.fillStyle = "#fff";
      ctx.font = "14px monospace";
      ctx.textAlign = "center";
      ctx.fillText("Escolha uma carta", GAME_W / 2, GAME_H / 2 - 60);
      ctx.textAlign = "left";

      const layout = this._layout();
      layout.forEach((c, i) => {
        const card = this.cards[i];
        const hovered = this.hoverIndex === i;
        ctx.save();
        if (hovered) {
          ctx.translate(c.x + c.w / 2, c.y + c.h / 2);
          ctx.scale(1.08, 1.08);
          ctx.translate(-(c.x + c.w / 2), -(c.y + c.h / 2));
        }
        ctx.fillStyle = "rgba(30,20,40,0.9)";
        ctx.fillRect(c.x - 4, c.y - 4, c.w + 8, c.h + 8);
        ctx.drawImage(card.img, c.x, c.y, c.w, c.h);
        ctx.strokeStyle = hovered ? "#ffd75e" : "#8866aa";
        ctx.lineWidth = hovered ? 3 : 1;
        ctx.strokeRect(c.x, c.y, c.w, c.h);
        ctx.restore();
      });
    }
    ctx.restore();
  }
}
