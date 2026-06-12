'use strict';
// Interaction handler — hover, pet, click, dblclick, right-click, drag, change character

const canvas = document.getElementById('pet');
const bubble = document.getElementById('bubble');

let renderer = null;
let charDef  = null;

// ── Init ─────────────────────────────────────────────────────────────────────

window.electronAPI.onInitCharacter((char) => {
  charDef  = window.CHARACTERS.find(c => c.id === char.id) || window.CHARACTERS[0];
  renderer = new PetRenderer(canvas, charDef);
  renderer.start();

  setTimeout(() => {
    renderer.setEmotion('wave', 3000);
    showBubble('wave');
  }, 600);
});

window.electronAPI.onSetEmotion((emotion) => {
  if (!renderer) return;
  renderer.setEmotion(emotion, 5000);
  showBubble(emotion);
});

// ── Speech bubble ─────────────────────────────────────────────────────────────

function quote(emotion) {
  if (!charDef) return '...';
  const pool = charDef.quotes[emotion] || charDef.quotes.idle || ['...'];
  return pool[Math.floor(Math.random() * pool.length)];
}

let bubbleTimer = null;
function showBubble(emotion) {
  bubble.textContent = quote(emotion);
  bubble.classList.add('visible');
  clearTimeout(bubbleTimer);
  bubbleTimer = setTimeout(() => bubble.classList.remove('visible'), 3200);
}

// ── Manual window drag (NO -webkit-app-region — that blocks all mouse events) ──

let dragging    = false;
let dragMoved   = false;
let mouseDownAt = null;

window.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;
  dragging    = false;
  dragMoved   = false;
  mouseDownAt = { x: e.screenX, y: e.screenY };
});

window.addEventListener('mousemove', (e) => {
  if (!mouseDownAt) return;
  const dx = e.screenX - mouseDownAt.x;
  const dy = e.screenY - mouseDownAt.y;
  if (!dragging && (Math.abs(dx) > 4 || Math.abs(dy) > 4)) {
    dragging = true;
    dragMoved = true;
    window.electronAPI.startWindowDrag(mouseDownAt.x, mouseDownAt.y);
  }
  if (dragging) {
    window.electronAPI.moveWindow(e.screenX, e.screenY);
  }
});

window.addEventListener('mouseup', () => {
  mouseDownAt = null;
  if (dragging) {
    window.electronAPI.stopWindowDrag();
    dragging = false;
  }
});

// ── Hit-test: click-through transparent pixels ────────────────────────────────

canvas.addEventListener('mousemove', (e) => {
  const px = canvas.getContext('2d').getImageData(e.offsetX, e.offsetY, 1, 1).data;
  window.electronAPI.setIgnoreMouse(px[3] < 10, { forward: true });
});

canvas.addEventListener('mouseleave', () => {
  window.electronAPI.setIgnoreMouse(true, { forward: true });
});

// ── Hover ─────────────────────────────────────────────────────────────────────

let isHovered   = false;
let hoverTimer  = null;

canvas.addEventListener('mouseenter', () => {
  if (!renderer) return;
  isHovered = true;
  clearTimeout(hoverTimer);
  hoverTimer = setTimeout(() => {
    if (renderer && renderer.state.emotion === 'idle') {
      renderer.setEmotion('hover', 2000);
      showBubble('hover');
    }
  }, 400);
});

canvas.addEventListener('mouseleave', () => {
  isHovered = false;
  clearTimeout(hoverTimer);
});

// ── Pet — hold click 700ms without moving ────────────────────────────────────

let petHoldTimer  = null;
let petTriggered  = false;

canvas.addEventListener('mousedown', (e) => {
  if (e.button !== 0) return;
  petTriggered = false;
  clearTimeout(petHoldTimer);
  petHoldTimer = setTimeout(() => {
    // Only trigger pet if we haven't started dragging
    if (!dragMoved && renderer) {
      petTriggered = true;
      renderer.setEmotion('pet', 3000);
      showBubble('pet');
    }
  }, 700);
});

canvas.addEventListener('mouseup', () => {
  clearTimeout(petHoldTimer);
  // Delay clearing petTriggered so click handler can check it
  setTimeout(() => { petTriggered = false; }, 400);
});

// ── Single click ──────────────────────────────────────────────────────────────

let clickTimer   = null;
let dblClicked   = false;

canvas.addEventListener('click', () => {
  if (petTriggered || dragMoved) return;
  dblClicked = false;
  clearTimeout(clickTimer);
  clickTimer = setTimeout(() => {
    if (dblClicked || !renderer) return;
    renderer.setEmotion('click', 3000);
    showBubble('click');
  }, 230);
});

// ── Double-click ──────────────────────────────────────────────────────────────

canvas.addEventListener('dblclick', () => {
  dblClicked = true;
  clearTimeout(clickTimer);
  if (!renderer) return;
  renderer.setEmotion('dblclick', 4000);
  showBubble('dblclick');
});

// ── Right-click: use Electron native popup menu (not HTML div) ───────────────
// The HTML menu is confined to the 200×270 pet window.
// Menu.popup() in main renders a real OS menu anywhere on screen.

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  window.electronAPI.showContextMenu();
});
