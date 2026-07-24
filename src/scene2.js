import { GAME_W, GAME_H, PLAYER, SCENE2, XP } from "./config.js";
import { Player } from "./player.js";
import { EnemyPC } from "./enemyPC.js";
import { drawHUD, drawEquippedCard, DiceOverlay } from "./ui.js";
import { applyCard } from "./cardEffects.js";
import { Camera, circleHit, aabbHit, playLoop, stopAudio, fadeOutAndStop, playSfx } from "./utils.js";

export class Scene2 {
  constructor(images, sounds, input, canvas, onComplete) {
    this.images = images;
    this.sounds = sounds;
    this.input = input;
    this.canvas = canvas;
    this.onComplete = onComplete;

    this.worldW = images.bg2.width || SCENE2.bgWidthFallback;
    this.camera = new Camera(GAME_W, GAME_H, this.worldW);

    this.player = new Player(images, sounds, PLAYER.spawnScene2.x, PLAYER.spawnScene2.y);
    this.player.allowJump = true;
    this.player.allowRoll = true;
    this.player.allowAttacks = true;

    this.enemies = SCENE2.enemySpawns.map((p, i) => new EnemyPC(images, sounds, p.x, p.y, i));

    this.equippedCard = null;
    this.diceOverlay = new DiceOverlay(images, sounds);

    this.musicState = "acao";
    playLoop(sounds.acao, 0.55);

    this.reachedPortal = false;
  }

  allEnemiesDead() {
    return this.enemies.every((e) => !e.alive);
  }

  update(dt) {
    if (this.reachedPortal) return;

    if (this.diceOverlay.active) {
      this.diceOverlay.update(dt);
      this.diceOverlay.handleMouseMove(this.input.mouseScreenX, this.input.mouseScreenY);
      if (this.input.leftJustPressed) {
        this.diceOverlay.handleClick(this.input.mouseScreenX, this.input.mouseScreenY);
      }
      this.input.endFrame();
      return; // pausa o resto do jogo enquanto escolhe carta
    }

    this.player._camX = this.camera.x;
    this.player.update(dt, this.input, this.worldW);
    this.camera.follow(this.player.x + this.player.w / 2);

    for (const e of this.enemies) e.update(dt, this.player, this.worldW);

    this.handleCombat();

    // música: ação enquanto houver inimigo vivo, tranquila quando limpar
    if (this.musicState === "acao" && this.allEnemiesDead()) {
      fadeOutAndStop(this.sounds.acao, 700);
      playLoop(this.sounds.tranquila, 0.5);
      this.musicState = "tranquila";
    }

    // checa chegada ao portal (círculo amarelo)
    const px = this.player.x + this.player.w / 2;
    const py = this.player.y + this.player.h / 2;
    if (circleHit(px, py, 10, SCENE2.portal.x, SCENE2.portal.y, SCENE2.portal.r)) {
      this.reachedPortal = true;
      stopAudio(this.sounds.tranquila);
      stopAudio(this.sounds.acao);
      if (this.onComplete) this.onComplete();
    }

    this.input.endFrame();
  }

  handleCombat() {
    const playerDmg = Math.max(1, Math.round(this.player.stats.dano));

    // projéteis do jogador -> inimigos
    for (const proj of this.player.projectiles) {
      for (const e of this.enemies) {
        if (!e.alive || proj.dead) continue;
        const b = e.box();
        if (aabbHit(proj.x - proj.w / 2, proj.y - proj.h / 2, proj.w, proj.h, b.x, b.y, b.w, b.h)) {
          e.hit(playerDmg);
          proj.dead = true;
          this.onEnemyMaybeDied(e);
        }
      }
    }

    // bengala (bumerangue) do jogador -> inimigos
    const caneBox = this.player.getBoomerangBox();
    if (caneBox) {
      for (const e of this.enemies) {
        if (!e.alive) continue;
        const b = e.box();
        if (aabbHit(caneBox.x, caneBox.y, caneBox.w, caneBox.h, b.x, b.y, b.w, b.h)) {
          e.hit(playerDmg);
          this.onEnemyMaybeDied(e);
        }
      }
    }

    // flechas dos inimigos -> jogador ou bengala
    const bodyBox = this.player.getBodyBox();
    for (const e of this.enemies) {
      for (const arrow of e.arrows) {
        if (arrow.dead) continue;
        const ab = arrow.box();

        if (caneBox && aabbHit(ab.x, ab.y, ab.w, ab.h, caneBox.x, caneBox.y, caneBox.w, caneBox.h)) {
          arrow.dead = true;
          this.player.stunCane();
          continue;
        }

        if (aabbHit(ab.x, ab.y, ab.w, ab.h, bodyBox.x, bodyBox.y, bodyBox.w, bodyBox.h)) {
          arrow.dead = true;
          this.player.takeHit(true);
          this.player.applyArrowEffect(2000, 1000, 1500);
        }
      }
    }
  }

  onEnemyMaybeDied(e) {
    if (e.alive) return;
    if (e._xpGiven) return;
    e._xpGiven = true;
    const leveled = this.player.gainXp(1, XP.requirement);
    if (leveled) {
      playSfx(this.sounds.upSkill, 0.8);
      this.diceOverlay.start((card) => {
        applyCard(card, this.player, this.enemies);
        this.equippedCard = card.img;
      });
    }
  }

  draw(ctx) {
    const camX = this.camera.x;
    ctx.drawImage(this.images.bg2, -camX, 0);

    for (const e of this.enemies) e.draw(ctx, camX);
    this.player.draw(ctx, camX);

    drawHUD(ctx, this.images, this.player);
    drawEquippedCard(ctx, this.equippedCard);

    this.diceOverlay.draw(ctx);
  }
}
