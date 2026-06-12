'use strict';
// Interaction model:
//   hover / single click   → pet
//   3 rapid taps (≤1.5 s)  → special (character's personal action)
//   fast drag / shake      → angry
//   5 min no interaction   → sleep (persistent, wakes on any touch)

const canvas = document.getElementById('pet');
const bubble  = document.getElementById('bubble');

let renderer = null;
let charDef  = null;

// ── Init ──────────────────────────────────────────────────────────────────────

window.electronAPI.onInitCharacter((char) => {
  charDef  = window.CHARACTERS.find(c => c.id === char.id) || window.CHARACTERS[0];
  renderer = new PetRenderer(canvas, charDef);
  renderer.start();
  setTimeout(() => { renderer.setEmotion('wave', 3000); showBubble('wave'); }, 600);
  armSleepTimer();
});

window.electronAPI.onSetEmotion((emotion) => {
  if (!renderer) return;
  wakeUp(false);          // reset timer only, don't override tray-sent emotion
  renderer.setEmotion(emotion, 5000);
  showBubble(emotion);
});

// ── Speech bubble ─────────────────────────────────────────────────────────────

function quote(emotion) {
  if (!charDef) return '...';
  const pool = charDef.quotes[emotion] || charDef.quotes.pet || ['...'];
  return pool[Math.floor(Math.random() * pool.length)];
}

let bubbleTimer = null;
function showBubble(emotion) {
  bubble.textContent = quote(emotion);
  bubble.classList.add('visible');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => bubble.classList.remove('visible'), 3200);
}

// ── Sleep — 5-minute inactivity ───────────────────────────────────────────────

const SLEEP_DELAY = 5 * 60 * 1000;   // 5 minutes
let sleepHandle = null;

function armSleepTimer() {
  clearTimeout(sleepHandle);
  sleepHandle = setTimeout(() => {
    if (!renderer) return;
    renderer.setEmotion('sleep', 0);  // duration=0 → persistent (no auto-return)
    showBubble('sleep');
  }, SLEEP_DELAY);
}

// wakeEmotion=true  → also trigger pet reaction (user directly touched the pet)
// wakeEmotion=false → reset timer only (tray action, drag)
function wakeUp(wakeEmotion = true) {
  const wasSleeping = renderer && renderer.state.emotion === 'sleep';
  armSleepTimer();
  if (wasSleeping && wakeEmotion) {
    renderer.setEmotion('wave', 2500);
    showBubble('wave');
  }
}

// ── Rapid-tap detector → special action ──────────────────────────────────────

const TAP_WINDOW  = 1500;   // ms window
const TAPS_NEEDED = 3;      // taps needed to trigger special
let taps = [];

function registerTap() {
  const now = Date.now();
  taps = taps.filter(t => now - t < TAP_WINDOW);
  taps.push(now);
  if (taps.length >= TAPS_NEEDED) { taps = []; return true; }
  return false;
}

// ── Window drag + shake detection → angry ────────────────────────────────────

let dragging    = false;
let dragMoved   = false;
let mouseDownAt = null;
let lastPos     = null;
let peakSpeed   = 0;

const SHAKE_THRESHOLD = 26; // px/event — fast enough to count as a shake

window.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;
  dragging = false; dragMoved = false; peakSpeed = 0;
  mouseDownAt = { x: e.screenX, y: e.screenY };
  lastPos     = { x: e.screenX, y: e.screenY };
});

window.addEventListener('mousemove', (e) => {
  if (!mouseDownAt) return;
  const dx = e.screenX - mouseDownAt.x;
  const dy = e.screenY - mouseDownAt.y;

  if (!dragging && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
    dragging  = true;
    dragMoved = true;
    window.electronAPI.startWindowDrag(mouseDownAt.x, mouseDownAt.y);
  }
  if (dragging) {
    const speed = Math.abs(e.screenX - lastPos.x) + Math.abs(e.screenY - lastPos.y);
    peakSpeed = Math.max(peakSpeed, speed);
    lastPos = { x: e.screenX, y: e.screenY };
    window.electronAPI.moveWindow(e.screenX, e.screenY);
    wakeUp(false); // reset sleep timer on drag, but don't show wave
  }
});

window.addEventListener('mouseup', () => {
  mouseDownAt = null;
  if (dragging) {
    window.electronAPI.stopWindowDrag();
    if (peakSpeed > SHAKE_THRESHOLD && renderer) {
      renderer.setEmotion('angry', 3500);
      showBubble('angry');
      armSleepTimer();
    }
    dragging  = false;
    peakSpeed = 0;
  }
});

// ── Transparent pixel hit-test ────────────────────────────────────────────────

canvas.addEventListener('mousemove', (e) => {
  const px = canvas.getContext('2d').getImageData(e.offsetX, e.offsetY, 1, 1).data;
  window.electronAPI.setIgnoreMouse(px[3] < 10, { forward: true });
});

canvas.addEventListener('mouseleave', () => {
  window.electronAPI.setIgnoreMouse(true, { forward: true });
});

// ── Hover → pet (after 400 ms still-hover) ───────────────────────────────────

let hoverTimer = null;

canvas.addEventListener('mouseenter', () => {
  if (!renderer) return;
  wakeUp(true);
  clearTimeout(hoverTimer);
  hoverTimer = setTimeout(() => {
    if (!renderer) return;
    const em = renderer.state.emotion;
    if (!['angry', 'special', 'sleep', 'wave'].includes(em)) {
      renderer.setEmotion('pet', 2500);
      showBubble('pet');
    }
  }, 400);
});

canvas.addEventListener('mouseleave', () => clearTimeout(hoverTimer));

// ── Click → pet  |  3 rapid clicks → special ─────────────────────────────────

canvas.addEventListener('click', () => {
  if (dragMoved || !renderer) return;
  wakeUp(false);   // sleep handled by mouseenter; just reset timer here
  if (registerTap()) {
    renderer.setEmotion('special', 4000);
    showBubble('special');
  } else if (renderer.state.emotion !== 'special') {
    renderer.setEmotion('excited', 2500);
    showBubble('excited');
  }
});

// ── Right-click → native OS context menu ─────────────────────────────────────

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  window.electronAPI.showContextMenu();
});
