const { app, BrowserWindow, ipcMain, Menu, Tray, screen, nativeImage } = require("electron");
const path = require("path");

const APP_ICON = path.join(__dirname, "assets", "icon.png");

let selectionWindow = null;
let petWindow       = null;
let tray            = null;
let currentCharacter = null;

// Manual drag state
let dragState = null;

// ── Windows ───────────────────────────────────────────────────────────────────

function createSelectionWindow() {
  selectionWindow = new BrowserWindow({
    width: 720,
    height: 560,
    resizable: false,
    frame: true,
    center: true,
    title: "Choose Your Nakama",
    backgroundColor: "#0d0d1a",
    icon: APP_ICON,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  selectionWindow.loadFile("renderer/selection.html");

  selectionWindow.on("closed", () => {
    selectionWindow = null;
    if (!petWindow) app.quit();
  });
}

function createPetWindow(character) {
  currentCharacter = character;
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  petWindow = new BrowserWindow({
    width: 200,
    height: 270,
    x: width  - 220,
    y: height - 300,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  petWindow.loadFile("renderer/pet.html");
  petWindow.setIgnoreMouseEvents(false);

  petWindow.webContents.once("did-finish-load", () => {
    petWindow.webContents.send("init-character", character);
  });

  petWindow.on("closed", () => {
    petWindow    = null;
    dragState    = null;
    tray && tray.destroy();
    tray = null;
    app.quit();
  });

  buildTray(character);
}

// ── Tray ──────────────────────────────────────────────────────────────────────

function buildTray(character) {
  if (tray) { tray.destroy(); tray = null; }

  // Create a simple 16x16 colored PNG icon from a data URL
  const color = (character.color || "#f7c948").replace("#", "");
  const r = parseInt(color.substring(0,2),16);
  const g = parseInt(color.substring(2,4),16);
  const b = parseInt(color.substring(4,6),16);

  // Build a tiny 8x8 PNG buffer (solid colored square)
  const png = createMinimalPNG(16, r, g, b);
  let icon = nativeImage.createFromBuffer(png);
  if (icon.isEmpty()) icon = nativeImage.createFromDataURL(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU5ErkJggg=='
  );

  tray = new Tray(icon);
  // On macOS also set a text title so it's always visible in menu bar
  if (process.platform === 'darwin') tray.setTitle('⚓');
  tray.setToolTip(`${character.name} – Desktop Pet\nRight-click for menu`);

  rebuildTrayMenu(character);
}

function rebuildTrayMenu(character) {
  if (!tray) return;
  const menu = Menu.buildFromTemplate([
    { label: character.name, enabled: false },
    { label: character.role, enabled: false },
    { type: "separator" },
    {
      label: "Emotions",
      submenu: [
        { label: "😄 Happy",    click: () => sendEmotion("happy")   },
        { label: "⚡ Excited",  click: () => sendEmotion("excited") },
        { label: "😠 Angry",    click: () => sendEmotion("angry")   },
        { label: "😢 Sad",      click: () => sendEmotion("sad")     },
        { label: "👋 Wave",     click: () => sendEmotion("wave")    },
        { label: "😴 Sleep",    click: () => sendEmotion("sleep")   },
      ],
    },
    {
      label: "Actions",
      submenu: [
        { label: "⚔️  Signature Move", click: () => sendEmotion("click")    },
        { label: "💥 Ultimate!",       click: () => sendEmotion("dblclick") },
        { label: "🤚 Pet",             click: () => sendEmotion("pet")      },
      ],
    },
    { type: "separator" },
    { label: "🔀 Change Character",  click: changeCharacter },
    { label: "👁  Show / Hide",      click: togglePet       },
    { type: "separator" },
    { label: "Quit",                 click: () => app.quit() },
  ]);
  tray.setContextMenu(menu);
}

// Builds a minimal valid 16×16 solid-color PNG
function createMinimalPNG(size, r, g, b) {
  // Use the pako/zlib approach — build a raw PNG manually
  // Signature
  const sig = Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]);

  // IHDR
  const ihdr = buildChunk('IHDR', (() => {
    const d = Buffer.alloc(13);
    d.writeUInt32BE(size, 0); d.writeUInt32BE(size, 4);
    d[8]=8; d[9]=2; d[10]=0; d[11]=0; d[12]=0;
    return d;
  })());

  // Raw pixel rows: filter byte (0) + RGB per pixel
  const rowLen = 1 + size * 3;
  const raw    = Buffer.alloc(size * rowLen);
  for (let y = 0; y < size; y++) {
    const base = y * rowLen;
    raw[base] = 0; // filter none
    for (let x = 0; x < size; x++) {
      raw[base + 1 + x*3]   = r;
      raw[base + 1 + x*3+1] = g;
      raw[base + 1 + x*3+2] = b;
    }
  }

  const zlib   = require("zlib");
  const idat   = buildChunk('IDAT', zlib.deflateSync(raw));
  const iend   = buildChunk('IEND', Buffer.alloc(0));
  return Buffer.concat([sig, ihdr, idat, iend]);
}

function buildChunk(type, data) {
  const len  = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const tBuf = Buffer.from(type, 'ascii');
  const crc  = require("zlib").crc32(Buffer.concat([tBuf, data]));
  const cBuf = Buffer.alloc(4); cBuf.writeUInt32BE(crc >>> 0, 0);
  return Buffer.concat([len, tBuf, data, cBuf]);
}

// ── Native right-click popup menu ─────────────────────────────────────────────

function buildContextMenu() {
  return Menu.buildFromTemplate([
    { label: "Emotions", enabled: false },
    { label: "😄 Happy",    click: () => sendEmotion("happy")   },
    { label: "⚡ Excited",  click: () => sendEmotion("excited") },
    { label: "😠 Angry",    click: () => sendEmotion("angry")   },
    { label: "😢 Sad",      click: () => sendEmotion("sad")     },
    { label: "👋 Wave",     click: () => sendEmotion("wave")    },
    { label: "😴 Sleep",    click: () => sendEmotion("sleep")   },
    { type: "separator" },
    { label: "Actions", enabled: false },
    { label: "⚔️  Signature Move", click: () => sendEmotion("click")    },
    { label: "💥 Ultimate!",       click: () => sendEmotion("dblclick") },
    { label: "🤚 Pet",             click: () => sendEmotion("pet")      },
    { type: "separator" },
    { label: "🔀 Change Character",  click: changeCharacter },
    { label: "👁  Show / Hide",      click: togglePet       },
    { label: "Quit",                 click: () => app.quit() },
  ]);
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function sendEmotion(emotion) {
  if (petWindow) petWindow.webContents.send("set-emotion", emotion);
}

function togglePet() {
  if (!petWindow) return;
  petWindow.isVisible() ? petWindow.hide() : petWindow.show();
}

function changeCharacter() {
  if (petWindow) {
    petWindow.removeAllListeners("closed");
    petWindow.close();
    petWindow = null;
  }
  dragState = null;
  tray && tray.destroy(); tray = null;
  createSelectionWindow();
}

// ── IPC handlers ──────────────────────────────────────────────────────────────

ipcMain.on("character-selected", (_, character) => {
  if (selectionWindow) {
    selectionWindow.removeAllListeners("closed");
    selectionWindow.close();
    selectionWindow = null;
  }
  if (petWindow) {
    petWindow.removeAllListeners("closed");
    petWindow.close();
    petWindow = null;
  }
  createPetWindow(character);
});

ipcMain.on("change-character", () => changeCharacter());

// Native right-click popup — reliable, not clipped inside pet window
ipcMain.on("show-context-menu", () => {
  if (!petWindow) return;
  buildContextMenu().popup({ window: petWindow });
});

ipcMain.on("set-ignore-mouse", (_, ignore, options) => {
  if (petWindow) petWindow.setIgnoreMouseEvents(ignore, options || {});
});

// Manual window drag
ipcMain.on("start-window-drag", (_, mx, my) => {
  if (!petWindow) return;
  const [wx, wy] = petWindow.getPosition();
  dragState = { mx, my, wx, wy };
});

ipcMain.on("move-window", (_, mx, my) => {
  if (!petWindow || !dragState) return;
  petWindow.setPosition(
    dragState.wx + (mx - dragState.mx),
    dragState.wy + (my - dragState.my)
  );
});

ipcMain.on("stop-window-drag", () => { dragState = null; });

// ── Boot ──────────────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  if (process.platform === "darwin") app.dock.setIcon(APP_ICON);
  createSelectionWindow();
});
app.on("window-all-closed", () => app.quit());
