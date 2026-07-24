import { PLAYER, GROUND_Y, CANE_STUN } from "./config.js";
import { FrameAnim, clamp, dist, playSfx } from "./utils.js";

export class Projectile {
  constructor(img, x, y, dirX, dirY, speed) {
    this.img = img;
    this.x = x;
    this.y = y;
    this.w = 28;
    this.h = 8;
    const len = Math.hypot(dirX, dirY) || 1;
    this.vx = (dirX / len) * speed;
    this.vy = (dirY / len) * speed;
    this.angle = Math.atan2(dirY, dirX);
    this.dead = false;
    this.life = 3; // segundos até desaparecer sozinho
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;
    if (this.life <= 0) this.dead = true;
  }

  draw(ctx, camX) {
    ctx.save();
    ctx.translate(this.x - camX, this.y);
    ctx.rotate(this.angle);
    ctx.drawImage(this.img, -this.w / 2, -this.h / 2, this.w, this.h);
    ctx.restore();
  }
}

export class Player {
  constructor(images, sounds, x, y) {
    this.images = images;
    this.sounds = sounds;
    this.x = x;
    this.y = y;
    this.w = PLAYER.frameW;
    this.h = PLAYER.frameH;
    this.facing = 1; // 1 = direita, -1 = esquerda
    this.vx = 0;
    this.vy = 0;
    this.onGround = true;

    this.allowJump = false;
    this.allowRoll = false;
    this.allowAttacks = false;

    this.state = "idle"; // idle, run, jump, roll
    this.anims = {
      run: new FrameAnim(images.correndo, PLAYER.fps.correndo, true),
      jump: new FrameAnim(images.pulando, PLAYER.fps.pulando, false),
      roll: new FrameAnim(images.rolando, PLAYER.fps.rolando, false),
    };

    this.health = PLAYER.maxHealth;
    this.maxHealth = PLAYER.maxHealth;
    this.invulnTimer = 0;

    this.level = 0;
    this.xp = 0;

    // status effects
    this.invertTimer = 0;
    this.paralyzeTimer = 0;
    this.hitStreakTimer = 0; // janela para contar flechadas seguidas
    this.hitStreak = 0;

    // bengala / ataques
    this.caneAngle = 0;
    this.caneState = "orbit"; // orbit, throwProjectile, boomerangOut, boomerangBack, stunned
    this.caneStunTimer = 0;
    this.caneGlow = 0; // tempo restante mostrando bengala_brilhante
    this.boomerang = null; // {x,y,targetX,targetY}
    this.attackCooldown = 0;

    this.projectiles = [];
    this.damage = 1;
    this.attackSpeedMult = 1;
    this.speedMult = 1;

    this.stats = {
      dano: 1,
      velocidadeatkMult: 1,
      movimentoMult: 1,
      vidaBonus: 0,
    };
  }

  get canAct() {
    return this.paralyzeTimer <= 0;
  }

  takeHit(fromArrow = false) {
    if (this.invulnTimer > 0) return;
    this.invulnTimer = PLAYER.hurtInvulnMs / 1000;
    this.health = clamp(this.health - 1, 0, this.maxHealth);
    playSfx(this.sounds["hit" + (1 + Math.floor(Math.random() * 3))], 0.8);
  }

  applyArrowEffect(invertMs, paralyzeMs, comboWindowMs) {
    // contabiliza flechadas seguidas
    if (this.hitStreakTimer > 0) {
      this.hitStreak++;
    } else {
      this.hitStreak = 1;
    }
    this.hitStreakTimer = comboWindowMs / 1000;

    if (this.hitStreak >= 2) {
      this.paralyzeTimer = paralyzeMs / 1000;
      this.hitStreak = 0;
      this.hitStreakTimer = 0;
    } else {
      this.invertTimer = invertMs / 1000;
    }
  }

  gainXp(amount, requirementFn) {
    this.xp += amount;
    let req = requirementFn(this.level);
    let leveled = false;
    while (this.xp >= req) {
      this.xp -= req;
      this.level++;
      leveled = true;
      req = requirementFn(this.level);
    }
    return leveled;
  }

  stunCane() {
    this.caneState = "stunned";
    this.caneStunTimer = CANE_STUN.durationMs / 1000;
  }

  tryProjectile(targetWorldX, targetWorldY) {
    if (!this.allowAttacks || !this.canAct) return;
    if (this.attackCooldown > 0) return;
    if (this.caneState === "boomerangOut" || this.caneState === "boomerangBack") return; // não pode durante boomerangue
    if (this.caneState === "stunned") return;

    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2 - 10;
    const dx = targetWorldX - cx;
    const dy = targetWorldY - cy;
    this.projectiles.push(new Projectile(this.images.projetil, cx, cy, dx, dy, PLAYER.projectileSpeed));
    this.facing = dx >= 0 ? 1 : -1;
    this.caneGlow = 0.35;
    this.attackCooldown = (PLAYER.attackCooldownMs / 1000) * this.stats.velocidadeatkMult;
    playSfx(this.sounds.tiro, 0.8);
  }

  tryBoomerang(targetWorldX, targetWorldY) {
    if (!this.allowAttacks || !this.canAct) return;
    if (this.attackCooldown > 0) return;
    if (this.caneState === "boomerangOut" || this.caneState === "boomerangBack") return;
    if (this.caneState === "stunned") return;

    const cx = this.x + this.w / 2;
    const cy = this.y + this.h / 2 - 10;
    this.boomerang = {
      x: cx, y: cy,
      targetX: targetWorldX, targetY: targetWorldY,
      originX: cx, originY: cy,
    };
    this.caneState = "boomerangOut";
    this.facing = targetWorldX >= cx ? 1 : -1;
    this.attackCooldown = (PLAYER.attackCooldownMs / 1000) * this.stats.velocidadeatkMult;
  }

  update(dt, input, worldW) {
    // timers
    if (this.invulnTimer > 0) this.invulnTimer -= dt;
    if (this.invertTimer > 0) this.invertTimer -= dt;
    if (this.paralyzeTimer > 0) this.paralyzeTimer -= dt;
    if (this.hitStreakTimer > 0) this.hitStreakTimer -= dt;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.caneGlow > 0) this.caneGlow -= dt;

    input.inverted = this.invertTimer > 0;
    input.locked = this.paralyzeTimer > 0;

    const moveAxis = input.moveAxis();
    const wantJump = this.allowJump && input.jumpPressed();
    const wantRoll = this.allowRoll && input.rollPressed();

    const baseSpeed = PLAYER.runSpeed * this.stats.movimentoMult;

    // -------- estado / física --------
    if (this.state === "roll") {
      this.anims.roll.update(dt);
      this.x += this.facing * PLAYER.rollSpeed * dt;
      if (this.anims.roll.finished) {
        this.state = this.onGround ? "idle" : "jump";
        this.anims.roll.reset();
      }
    } else if (this.state === "jump") {
      this.anims.jump.update(dt);
      this.vy += PLAYER.gravity * dt;
      this.y += this.vy * dt;
      if (moveAxis !== 0) {
        this.x += moveAxis * baseSpeed * dt;
        this.facing = moveAxis;
      }
      if (this.y >= GROUND_Y) {
        this.y = GROUND_Y;
        this.vy = 0;
        this.onGround = true;
        this.state = moveAxis !== 0 ? "run" : "idle";
        this.anims.jump.reset();
      }
    } else {
      // idle ou run (chão)
      if (wantRoll) {
        this.state = "roll";
        this.anims.roll.reset();
      } else if (wantJump) {
        this.state = "jump";
        this.vy = -PLAYER.jumpSpeed;
        this.onGround = false;
        this.anims.jump.reset();
        playSfx(this.sounds.pulo, 0.7);
      } else if (moveAxis !== 0) {
        this.state = "run";
        this.facing = moveAxis;
        this.x += moveAxis * baseSpeed * dt;
        this.anims.run.update(dt);
      } else {
        this.state = "idle";
      }
    }

    this.x = clamp(this.x, 0, worldW - this.w);

    // -------- bengala --------
    if (this.caneState === "orbit") {
      this.caneAngle += PLAYER.boomerangSpinSpeed * dt;
    } else if (this.caneState === "boomerangOut" && this.boomerang) {
      const b = this.boomerang;
      const dx = b.targetX - b.x;
      const dy = b.targetY - b.y;
      const d = Math.hypot(dx, dy);
      const step = PLAYER.boomerangSpeed * dt;
      this.caneAngle += PLAYER.boomerangSpinSpeed * 2 * dt;
      if (d <= step) {
        b.x = b.targetX; b.y = b.targetY;
        this.caneState = "boomerangBack";
      } else {
        b.x += (dx / d) * step;
        b.y += (dy / d) * step;
      }
    } else if (this.caneState === "boomerangBack" && this.boomerang) {
      const b = this.boomerang;
      const px = this.x + this.w / 2;
      const py = this.y + this.h / 2 - 10;
      const dx = px - b.x;
      const dy = py - b.y;
      const d = Math.hypot(dx, dy);
      const step = PLAYER.boomerangReturnSpeed * dt;
      this.caneAngle += PLAYER.boomerangSpinSpeed * 2 * dt;
      if (d <= step) {
        this.caneState = "orbit";
        this.boomerang = null;
      } else {
        b.x += (dx / d) * step;
        b.y += (dy / d) * step;
      }
    } else if (this.caneState === "stunned") {
      this.caneStunTimer -= dt;
      if (this.caneStunTimer <= 0) this.caneState = "orbit";
    }

    // input de ataque
    if (this.allowAttacks) {
      const worldMouseX = input.mouseScreenX + (this._camX || 0);
      const worldMouseY = input.mouseScreenY;
      if (input.rightJustPressed) this.tryProjectile(worldMouseX, worldMouseY);
      if (input.leftJustPressed) this.tryBoomerang(worldMouseX, worldMouseY);
    }

    // projéteis do jogador
    for (const p of this.projectiles) p.update(dt);
    this.projectiles = this.projectiles.filter((p) => !p.dead);
  }

  // hitbox aproximada da bengala quando em boomerangue (para colisão com flechas/inimigos)
  getBoomerangBox() {
    if (this.caneState !== "boomerangOut" && this.caneState !== "boomerangBack") return null;
    if (!this.boomerang) return null;
    return { x: this.boomerang.x - 10, y: this.boomerang.y - 4, w: 20, h: 8 };
  }

  getBodyBox() {
    return { x: this.x + 14, y: this.y + 8, w: this.w - 28, h: this.h - 10 };
  }

  draw(ctx, camX) {
    this._camX = camX;
    const drawX = Math.round(this.x - camX);
    const drawY = Math.round(this.y);
    const flash = this.invulnTimer > 0 && Math.floor(this.invulnTimer * 20) % 2 === 0;

    ctx.save();
    if (flash) ctx.globalAlpha = 0.45;

    let img;
    if (this.state === "run") img = this.anims.run.current;
    else if (this.state === "jump") img = this.anims.jump.current;
    else if (this.state === "roll") img = this.anims.roll.current;
    else img = this.images.idle;

    const h = this.state === "idle" ? PLAYER.idleFrameH : this.h;
    const yOff = this.state === "idle" ? this.h - h : 0;

    ctx.translate(drawX + this.w / 2, 0);
    ctx.scale(this.facing, 1);
    ctx.drawImage(img, -this.w / 2, drawY + yOff, this.w, h);
    ctx.restore();

    // bengala
    this.drawCane(ctx, camX);

    // projéteis
    for (const p of this.projectiles) p.draw(ctx, camX);
  }

  drawCane(ctx, camX) {
    const cx = this.x + this.w / 2 - camX;
    const cy = this.y + this.h / 2 - 10;
    const img = this.caneGlow > 0 ? this.images.bengalaBrilhante : this.images.bengala;

    const blinking = this.caneState === "stunned" && Math.floor(this.caneStunTimer * 8) % 2 === 0;
    if (blinking) return;

    if (this.caneState === "orbit" || this.caneState === "stunned") {
      const r = PLAYER.boomerangOrbitRadius;
      const ang = this.caneAngle;
      ctx.save();
      ctx.translate(cx + Math.cos(ang) * r, cy + Math.sin(ang) * r * 0.5);
      ctx.rotate(ang);
      ctx.drawImage(img, -32, -8, 64, 16);
      ctx.restore();
    } else if (this.boomerang) {
      ctx.save();
      ctx.translate(this.boomerang.x - camX, this.boomerang.y);
      ctx.rotate(this.caneAngle * 2);
      ctx.drawImage(img, -32, -8, 64, 16);
      ctx.restore();
    }
  }
}
