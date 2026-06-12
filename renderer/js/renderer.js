'use strict';
// Animation engine — drives the character loop, emotions, particles, idle timer

class PetRenderer {
  constructor(canvas, charDef) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.char = charDef;

    // Animation state
    this.state = {
      cx: canvas.width / 2,
      cy: canvas.height / 2 + 20,
      emotion: 'idle',
      tick: 0,
      animOffset: 0,
      armL: 0,
      armR: 0,
      headTilt: 0,
      isBlinking: false,
    };

    this.particles = [];
    this.blinkTimer = 80 + Math.random() * 80;
    this.emotionTimer = null;
    this.idleTimer = null;
    this.idleBehav = null;
    this.idleBehavTick = 0;
    this.pendingEmotion = null;

    // Flash overlay for attacks
    this.flashAlpha = 0;
    this.flashColor = '#fff';

    this._resetIdleTimer();
  }

  // ── Emotion control ───────────────────────────────────────────────────────

  setEmotion(emotion, duration = 4500) {
    const S = this.state;
    S.emotion = emotion;
    this.particles = [];
    this.flashAlpha = 0;
    this.idleBehav = null;

    if (emotion === 'special') {
      this.flashAlpha = 0.45;
      this.flashColor = this.char.color || '#fff';
    }
    if (emotion === 'angry') {
      this.flashAlpha = 0.4;
      this.flashColor = '#ff2200';
    }

    clearTimeout(this.emotionTimer);
    // duration === 0 means persistent (sleep) — no auto-return to idle
    if (emotion !== 'idle' && duration > 0) {
      this.emotionTimer = setTimeout(() => {
        S.emotion = 'idle';
        this.idleBehav = null;
        this._resetIdleTimer();
      }, duration);
    }

    if (emotion !== 'sleep') this._resetIdleTimer();
  }

  triggerIdle() {
    // Don't interrupt sleep — pet.js owns that state
    if (this.state.emotion === 'sleep') { this._resetIdleTimer(); return; }
    const behaviors = this.char.idleBehaviors || ['look_around'];
    this.idleBehav = behaviors[Math.floor(Math.random() * behaviors.length)];
    this.idleBehavTick = 0;
    this._resetIdleTimer(14000);
  }

  _resetIdleTimer(delay = 8000) {
    clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => this.triggerIdle(), delay);
  }

  // ── Update ────────────────────────────────────────────────────────────────

  update() {
    const S = this.state;
    S.tick++;

    // Blink
    this.blinkTimer--;
    if (this.blinkTimer <= 0) {
      S.isBlinking = true;
      if (this.blinkTimer < -6) {
        S.isBlinking = false;
        this.blinkTimer = 100 + Math.random() * 100;
      }
    }

    // Flash decay
    if (this.flashAlpha > 0) this.flashAlpha -= 0.03;

    // Idle behavior animations
    if (this.idleBehav) {
      this.idleBehavTick++;
      this._updateIdleBehavior();
    } else {
      // Base animations per emotion
      switch (S.emotion) {
        case 'idle':
          S.animOffset = Math.sin(S.tick * 0.035) * 3;
          S.armL = Math.sin(S.tick * 0.05) * 0.08;
          S.armR = Math.sin(S.tick * 0.05 + 1) * 0.08;
          break;
        case 'happy':
          if (this.char.happy?.anim) {
            this.char.happy.anim(S, S.tick, (t) => this._spawn(t));
          } else {
            S.animOffset = -Math.abs(Math.sin(S.tick * 0.12)) * 8;
            if (S.tick % 18 === 0) this._spawn('heart');
          }
          break;
        case 'excited':
          if (this.char.excited?.anim) {
            this.char.excited.anim(S, S.tick, (t) => this._spawn(t));
          } else {
            S.animOffset = Math.sin(S.tick * 0.22) * 10;
            S.armL = -0.8 + Math.sin(S.tick * 0.3) * 0.6;
            S.armR = 0.8 + Math.sin(S.tick * 0.3 + 1) * 0.6;
            if (S.tick % 10 === 0) this._spawn('star');
          }
          break;
        case 'angry':
          if (this.char.angry?.anim) {
            this.char.angry.anim(S, S.tick, (t) => this._spawn(t));
          } else {
            S.animOffset = Math.sin(S.tick * 0.5) * 4;
            S.cx = this.canvas.width / 2 + Math.sin(S.tick * 0.6) * 5;
            if (S.tick % 14 === 0) this._spawn('rage');
          }
          break;
        case 'sad':
          if (this.char.sad?.anim) {
            this.char.sad.anim(S, S.tick, (t) => this._spawn(t));
          } else {
            S.animOffset = 2;
            if (S.tick % 45 === 0) this._spawn('tear');
          }
          break;
        case 'wave':
          if (this.char.wave?.anim) {
            this.char.wave.anim(S, S.tick, (t) => this._spawn(t));
          } else {
            S.animOffset = Math.sin(S.tick * 0.06) * 2;
          }
          break;
        case 'sleep':
          S.animOffset = Math.sin(S.tick * 0.02) * 1.5;
          if (S.tick % 70 === 0) this._spawn('zzz');
          break;
        case 'click':
          S.animOffset = Math.sin(S.tick * 0.3) * 6;
          S.armL = -0.8; S.armR = 0.8;
          break;
        case 'dblclick':
          S.animOffset = Math.sin(S.tick * 0.4) * 12;
          S.armL = Math.sin(S.tick * 0.4) * 1.0;
          S.armR = -Math.sin(S.tick * 0.4) * 1.0;
          if (S.tick % 8 === 0) this._spawn('star');
          break;
        case 'pet':
          S.animOffset = Math.sin(S.tick * 0.1) * 4;
          S.armL = Math.sin(S.tick * 0.15) * 0.3;
          if (S.tick % 20 === 0) this._spawn('heart');
          break;
        case 'special':
          if (this.char.special?.anim) {
            this.char.special.anim(S, S.tick, (t) => this._spawn(t));
          } else {
            S.animOffset = Math.sin(S.tick * 0.22) * 14;
            if (S.tick % 6 === 0)  this._spawn('star');
            if (S.tick % 14 === 0) this._spawn('heart');
          }
          break;
        case 'hover':
          S.animOffset = Math.sin(S.tick * 0.08) * 4;
          break;
      }
    }

    // Restore cx to center; skip when a char-specific anim controls cx itself
    if (!this.char[S.emotion]?.anim && S.emotion !== 'angry') {
      S.cx += (this.canvas.width / 2 - S.cx) * 0.1;
    }

    // Update particles
    this.particles = this.particles.filter(p => p.life > 0);
    this.particles.forEach(p => {
      p.y -= p.vy;
      p.x += p.vx;
      p.life--;
      p.alpha = p.life / p.maxLife;
      p.rot = (p.rot || 0) + 0.05;
    });
  }

  _updateIdleBehavior() {
    const S = this.state;
    const t = this.idleBehavTick;
    const beh = this.idleBehav;

    // Character-specific or generic idle behaviors
    if (beh === 'stretch') {
      S.armL = -1.2 * Math.sin(t * 0.05);
      S.animOffset = Math.sin(t * 0.06) * 3;
      if (t > 80) { this.idleBehav = null; this._resetIdleTimer(); }
    } else if (beh === 'sniff') {
      S.headTilt = Math.sin(t * 0.1) * 0.2;
      S.animOffset = Math.sin(t * 0.04) * 2;
      if (t > 60) { this.idleBehav = null; this._resetIdleTimer(); }
      if (t % 30 === 0) this._spawn('heart');
    } else if (beh === 'look_around') {
      S.cx = this.canvas.width / 2 + Math.sin(t * 0.06) * 12;
      S.animOffset = Math.sin(t * 0.04) * 2;
      if (t > 90) { S.cx = this.canvas.width / 2; this.idleBehav = null; this._resetIdleTimer(); }
    } else if (beh === 'meditate') {
      S.animOffset = Math.sin(t * 0.02) * 1;
      S.armL = 0.3; S.armR = -0.3;
      if (t > 100) { this.idleBehav = null; this._resetIdleTimer(); }
      if (t % 50 === 0) this._spawn('zzz');
    } else if (beh === 'sword_swing') {
      S.armR = Math.sin(t * 0.15) * 1.2;
      S.animOffset = Math.sin(t * 0.1) * 3;
      if (t > 70) { this.idleBehav = null; this._resetIdleTimer(); }
    } else if (beh === 'nap') {
      S.animOffset = Math.sin(t * 0.02) * 1;
      if (t % 60 === 0) this._spawn('zzz');
      if (t > 120) { this.idleBehav = null; this._resetIdleTimer(); }
    } else if (beh === 'count_coins') {
      S.armR = -0.5 + Math.sin(t * 0.2) * 0.3;
      if (t % 20 === 0) this._spawn('coin');
      if (t > 80) { this.idleBehav = null; this._resetIdleTimer(); }
    } else if (beh === 'draw_map') {
      S.armR = -0.3; S.armL = 0.1;
      S.animOffset = Math.sin(t * 0.04) * 1;
      if (t > 80) { this.idleBehav = null; this._resetIdleTimer(); }
    } else if (beh === 'polish_slingshot') {
      S.armL = -0.2 + Math.sin(t * 0.15) * 0.3;
      if (t > 70) { this.idleBehav = null; this._resetIdleTimer(); }
    } else if (beh === 'tell_story') {
      S.armL = -0.5 + Math.sin(t * 0.2) * 0.5;
      S.armR = 0.4 + Math.sin(t * 0.15) * 0.3;
      if (t % 25 === 0) this._spawn('star');
      if (t > 90) { this.idleBehav = null; this._resetIdleTimer(); }
    } else if (beh === 'spin_kick') {
      S.animOffset = Math.sin(t * 0.18) * 8;
      S.armL = Math.sin(t * 0.2) * 0.8;
      if (t > 80) { this.idleBehav = null; this._resetIdleTimer(); }
    } else if (beh === 'cook_air') {
      S.armR = -0.4 + Math.sin(t * 0.2) * 0.4;
      S.armL = 0.1;
      if (t > 70) { this.idleBehav = null; this._resetIdleTimer(); }
    } else if (beh === 'eat_candy') {
      S.animOffset = Math.sin(t * 0.1) * 3;
      if (t % 20 === 0) this._spawn('heart');
      if (t > 70) { this.idleBehav = null; this._resetIdleTimer(); }
    } else if (beh === 'happy_dance') {
      S.animOffset = -Math.abs(Math.sin(t * 0.15)) * 7;
      S.armL = Math.sin(t * 0.2) * 0.8;
      S.armR = -Math.sin(t * 0.2 + 1) * 0.8;
      if (t % 15 === 0) this._spawn('heart');
      if (t > 80) { this.idleBehav = null; this._resetIdleTimer(); }
    } else if (beh === 'flex') {
      S.armL = -0.8 + Math.sin(t * 0.1) * 0.2;
      S.armR = 0.8 + Math.sin(t * 0.1) * 0.2;
      S.animOffset = Math.sin(t * 0.06) * 2;
      if (t % 30 === 0) this._spawn('star');
      if (t > 90) { this.idleBehav = null; this._resetIdleTimer(); }
    } else if (beh === 'super_pose') {
      S.armL = -1.1; S.armR = 1.1;
      S.animOffset = 0;
      if (t % 20 === 0) this._spawn('star');
      if (t > 80) { this.idleBehav = null; this._resetIdleTimer(); }
    } else if (beh === 'cola_drink') {
      S.armL = -0.3; S.armR = 0.1;
      if (t > 60) { this.idleBehav = null; this._resetIdleTimer(); }
    } else if (beh === 'play_violin') {
      S.armL = -0.6 + Math.sin(t * 0.2) * 0.2;
      if (t % 20 === 0) this._spawn('music');
      if (t > 90) { this.idleBehav = null; this._resetIdleTimer(); }
    } else if (beh === 'skull_joke') {
      S.animOffset = Math.sin(t * 0.1) * 4;
      if (t % 25 === 0) this._spawn('star');
      if (t > 70) { this.idleBehav = null; this._resetIdleTimer(); }
    } else if (beh === 'dance') {
      S.animOffset = Math.sin(t * 0.14) * 7;
      S.armL = Math.sin(t * 0.2) * 0.9;
      S.armR = -Math.sin(t * 0.2 + 1) * 0.9;
      if (t > 80) { this.idleBehav = null; this._resetIdleTimer(); }
    } else if (beh === 'water_kata') {
      S.armL = Math.sin(t * 0.12) * 0.9;
      S.armR = -Math.sin(t * 0.12 + 1) * 0.9;
      S.animOffset = Math.sin(t * 0.06) * 2;
      if (t % 30 === 0) this._spawn('drop');
      if (t > 90) { this.idleBehav = null; this._resetIdleTimer(); }
    } else if (beh === 'read_book') {
      S.armL = -0.1; S.armR = -0.1;
      S.animOffset = Math.sin(t * 0.03) * 1;
      if (t > 90) { this.idleBehav = null; this._resetIdleTimer(); }
    } else if (beh === 'bloom_flowers') {
      if (t % 20 === 0) this._spawn('flower');
      S.animOffset = Math.sin(t * 0.04) * 1;
      if (t > 70) { this.idleBehav = null; this._resetIdleTimer(); }
    } else {
      // fallback
      S.animOffset = Math.sin(S.tick * 0.04) * 3;
      if (this.idleBehavTick > 80) { this.idleBehav = null; this._resetIdleTimer(); }
    }
  }

  _spawn(type) {
    const cx = this.state.cx;
    const emojis = {
      heart:'❤️', star:'⭐', rage:'💢', tear:'💧', zzz:'💤',
      music:'🎵', coin:'💰', flower:'🌸', drop:'💦',
    };
    this.particles.push({
      type, emoji: emojis[type] || '✨',
      x: cx + (Math.random() - 0.5) * 40,
      y: this.state.cy - 60 + (Math.random() - 0.5) * 20,
      vx: (Math.random() - 0.5) * 1.5,
      vy: 0.9 + Math.random() * 0.8,
      life: 55, maxLife: 55, alpha: 1,
      size: 11 + Math.random() * 6,
      rot: 0,
    });
  }

  // ── Draw ──────────────────────────────────────────────────────────────────

  draw() {
    const ctx = this.ctx;
    const S = this.state;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    ctx.translate(S.cx - this.canvas.width / 2, S.animOffset);
    this.char.draw(ctx, S);
    ctx.restore();

    // Draw particles
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.font = `${p.size}px serif`;
      ctx.textAlign = 'center';
      ctx.fillText(p.emoji, p.x, p.y);
      ctx.restore();
    });

    // Flash overlay
    if (this.flashAlpha > 0.01) {
      ctx.fillStyle = this.flashColor;
      ctx.globalAlpha = this.flashAlpha * 0.35;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.globalAlpha = 1;
    }
  }

  start() {
    const loop = () => {
      this.update();
      this.draw();
      requestAnimationFrame(loop);
    };
    loop();
  }
}
