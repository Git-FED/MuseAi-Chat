const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
function createWindow() { const win = new BrowserWindow({ width: 920, height: 760, minWidth: 420, minHeight: 560, webPreferences: { preload: path.join(__dirname, "preload.js"), contextIsolation: true, nodeIntegration: false } }); win.loadFile(path.join(__dirname, "../app/index.html")); }
app.whenReady().then(() => { createWindow(); app.on("activate", () => { if (!BrowserWindow.getAllWindows().length) createWindow(); }); });
app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
ipcMain.handle("app-version", () => app.getVersion());
