import { GAME_W, GAME_H, PLAYER, ALERTA, DIALOGUE_TEXT, SCENE1_EASTER_EGG } from "./config.js";
import { Player } from "./player.js";
import { DialogueBox } from "./ui.js";
import { dist, playLoop, stopAudio, fadeOutAndStop } from "./utils.js";

export class Scene1 {
  constructor(images, sounds, input, onComplete) {
    this.images = images;
    this.sounds = sounds;
    this.input = input;
    this.onComplete = onComplete;

    this.player = new Player(images, sounds, PLAYER.spawnScene1.x, PLAYER.spawnScene1.y);
    this.player.allowJump = false;
    this.player.allowRoll = false;
    this.player.allowAttacks = false;
    this.player.showCane = false; // bengala nunca aparece visualmente na cena 1

    this.easterEggRevealed = false;

    this.dialogue = new DialogueBox(DIALOGUE_TEXT);
    this.phoneRinging = true;
    this.triggered = false;
    this.fading = false;
    this.fadeAlpha = 0;
    this.done = false;

    this.alertPulse = 0;

    playLoop(sounds.telefone, 0.7);
  }

  update(dt) {
    if (this.done) return;

    this.alertPulse += dt;

    if (this.fading) {
      this.fadeAlpha += dt * 0.8;
      if (this.fadeAlpha >= 1) {
        this.done = true;
        stopAudio(this.sounds.telefone);
        if (this.onComplete) this.onComplete();
      }
      this.input.endFrame();
      return;
    }

    if (!this.triggered) {
      this.player.update(dt, this.input, GAME_W);

      // easter egg: jogar a bengala (boomerangue) na posição alvo revela a imagem
      if (!this.easterEggRevealed && this.input.leftJustPressed) {
        const worldMouseX = this.input.mouseScreenX;
        const worldMouseY = this.input.mouseScreenY;
        const thrown = this.player.tryBoomerang(worldMouseX, worldMouseY, true);
        if (thrown && dist(worldMouseX, worldMouseY, SCENE1_EASTER_EGG.targetX, SCENE1_EASTER_EGG.targetY) < SCENE1_EASTER_EGG.triggerRadius) {
          this.easterEggRevealed = true;
        }
      }

      const px = this.player.x + this.player.w / 2;
      const py = this.player.y + this.player.h / 2;
      const ax = ALERTA.x + ALERTA.w / 2;
      const ay = ALERTA.y + ALERTA.h / 2;
      if (dist(px, py, ax, ay) < ALERTA.triggerRadius) {
        this.triggered = true;
        fadeOutAndStop(this.sounds.telefone, 500);
        this.dialogue.show();
      }
    } else {
      this.dialogue.update(dt);
      if (this.input.leftJustPressed) {
        if (!this.dialogue.finishedTyping) {
          this.dialogue.skipToEnd();
        } else {
          this.fading = true;
        }
      }
    }

    this.input.endFrame();
  }

  draw(ctx) {
    ctx.drawImage(this.images.bg1, 0, 0, GAME_W, GAME_H);

    // alerta com leve pulsar para chamar atenção
    const pulse = 1 + Math.sin(this.alertPulse * 4) * 0.08;
    ctx.save();
    ctx.translate(ALERTA.x + ALERTA.w / 2, ALERTA.y + ALERTA.h / 2);
    ctx.scale(pulse, pulse);
    ctx.drawImage(this.images.alerta, -ALERTA.w / 2, -ALERTA.h / 2, ALERTA.w, ALERTA.h);
    ctx.restore();

    this.player.draw(ctx, 0);

    if (this.easterEggRevealed) {
      ctx.drawImage(
        this.images.logoPet,
        SCENE1_EASTER_EGG.targetX,
        SCENE1_EASTER_EGG.targetY,
        SCENE1_EASTER_EGG.imgW,
        SCENE1_EASTER_EGG.imgH
      );
    }

    this.dialogue.draw(ctx, this.images.caixaFalas);

    if (this.fading) {
      ctx.fillStyle = `rgba(0,0,0,${Math.min(1, this.fadeAlpha)})`;
      ctx.fillRect(0, 0, GAME_W, GAME_H);
    }
  }
}
