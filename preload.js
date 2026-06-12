const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Character lifecycle
  selectCharacter:   (char)      => ipcRenderer.send("character-selected", char),
  changeCharacter:   ()          => ipcRenderer.send("change-character"),

  // Character events → renderer
  onInitCharacter:   (cb) => ipcRenderer.on("init-character", (_, c) => cb(c)),
  onSetEmotion:      (cb) => ipcRenderer.on("set-emotion",    (_, e) => cb(e)),

  // Show native right-click menu (avoids HTML menu being clipped inside window)
  showContextMenu:   ()          => ipcRenderer.send("show-context-menu"),

  // Transparent hit-test
  setIgnoreMouse:    (ignore, opts) => ipcRenderer.send("set-ignore-mouse", ignore, opts),

  // Manual IPC window drag
  startWindowDrag:   (mx, my)   => ipcRenderer.send("start-window-drag", mx, my),
  moveWindow:        (mx, my)   => ipcRenderer.send("move-window",       mx, my),
  stopWindowDrag:    ()          => ipcRenderer.send("stop-window-drag"),
});
