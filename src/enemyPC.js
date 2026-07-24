import { ENEMY_PC } from "./config.js";
import { FrameAnim, clamp, dist, playSfx, circleHit } from "./utils.js";

export class ClockArrow {
  constructor(images, x, y, dirX, dirY) {
    this.anim = new FrameAnim(images.pcAtaque, ENEMY_PC.arrowFps, true);
    this.x = x;
    this.y = y;
    this.w = ENEMY_PC.arrowFrameW;
    this.h = ENEMY_PC.arrowFrameH;
    const len = Math.hypot(dirX, dirY) || 1;
    this.vx = (dirX / len) * ENEMY_PC.arrowSpeed;
    this.vy = (dirY / len) * ENEMY_PC.arrowSpeed;
    this.angle = Math.atan2(dirY, dirX);
    this.dead = false;
    this.life = 4;
  }

  update(dt) {
    this.anim.update(dt);
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
  }

  box() {
    return { x: this.x - this.w / 2, y: this.y - this.h / 2, w: this.w, h: this.h };
  }

  draw(ctx, camX) {
    ctx.save();
    ctx.translate(this.x - camX, this.y);
    ctx.rotate(this.angle);
    ctx.drawImage(this.anim.current, -this.w / 2, -this.h / 2, this.w, this.h);
    ctx.restore();
  }
}

export class EnemyPC {
  constructor(images, sounds, x, y, id) {
    this.images = images;
    this.sounds = sounds;
    this.id = id;
    this.x = x;
    this.y = y;
    this.baseY = y;
    this.w = ENEMY_PC.frameW;
    this.h = ENEMY_PC.frameH;
    this.hp = ENEMY_PC.hp;
    this.maxHp = ENEMY_PC.hp;
    this.anim = new FrameAnim(images.pcBase, ENEMY_PC.fps, true);
    this.dead = false;
    this.hoverT = Math.random() * 10;
    this.hoverSpeed = ENEMY_PC.hoverSpeedMin + Math.random() * (ENEMY_PC.hoverSpeedMax - ENEMY_PC.hoverSpeedMin);
    this.attackTimer = 1 + Math.random() * 1.5;
    this.hurtFlash = 0;
    this.facing = -1;
    this.arrows = [];
    this.alive = true;
    playSfx(sounds.pcRugido, 0.5);
  }

  hit(dmg) {
    if (!this.alive) return;
    this.hp -= dmg;
    this.hurtFlash = 0.18;
    if (this.hp <= 0) {
      this.alive = false;
      this.dead = true;
    }
  }

  update(dt, player, worldW) {
    if (!this.alive) return;
    this.hoverT += dt;
    if (this.hurtFlash > 0) this.hurtFlash -= dt;
    this.anim.update(dt);

    const px = player.x + player.w / 2;
    const py = player.y + player.h / 2;
    const ex = this.x + this.w / 2;
    const ey = this.y + this.h / 2;
    const d = dist(px, py, ex, ey);

    this.facing = px < ex ? -1 : 1;

    // mantém distância "kiting": aproxima se longe, afasta se muito perto
    const speed = ENEMY_PC.chaseSpeed * (this.speedMult || 1);
    const towardPlayer = px > ex ? 1 : -1;
    let targetX = this.x;
    if (d > ENEMY_PC.keepDistance + 40) {
      targetX = this.x + towardPlayer * speed * dt;
    } else if (d < ENEMY_PC.keepDistance - 40) {
      targetX = this.x - towardPlayer * speed * dt;
    }
    this.x = clamp(targetX, 0, worldW - this.w);
    this.y = this.baseY + Math.sin(this.hoverT * this.hoverSpeed) * ENEMY_PC.hoverAmplitude;

    // ataque
    this.attackTimer -= dt;
    if (this.attackTimer <= 0 && d < ENEMY_PC.attackRange) {
      this.shoot(px, py);
      const [minC, maxC] = ENEMY_PC.attackCooldownMs;
      this.attackTimer = (minC + Math.random() * (maxC - minC)) / 1000;
    }

    for (const a of this.arrows) a.update(dt);
    this.arrows = this.arrows.filter((a) => !a.dead);
  }

  shoot(targetX, targetY) {
    const ex = this.x + this.w / 2;
    const ey = this.y + this.h / 2;
    this.arrows.push(new ClockArrow(this.images, ex, ey, targetX - ex, targetY - ey));
    playSfx(this.sounds.pcAtk, 0.6);
  }

  box() {
    return { x: this.x + 10, y: this.y + 6, w: this.w - 20, h: this.h - 12 };
  }

  draw(ctx, camX) {
    if (!this.alive) return;
    const img = this.hurtFlash > 0 ? this.images.pcDano[this.anim.index % this.images.pcDano.length] : this.anim.current;
    ctx.save();
    ctx.translate(this.x - camX + this.w / 2, this.y);
    ctx.scale(this.facing, 1);
    ctx.drawImage(img, -this.w / 2, 0, this.w, this.h);
    ctx.restore();

    // barra de vida
    const bw = this.w;
    const bx = this.x - camX;
    const by = this.y - 10;
    const pct = clamp(this.hp / this.maxHp, 0, 1);
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.fillRect(bx, by, bw, 5);
    ctx.fillStyle = pct > 0.4 ? "#5ec95e" : "#d94848";
    ctx.fillRect(bx + 1, by + 1, (bw - 2) * pct, 3);

    for (const a of this.arrows) a.draw(ctx, camX);
  }
}
