const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld("museDesktop", { version: () => ipcRenderer.invoke("app-version") });
