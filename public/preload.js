const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  selectFile: () => ipcRenderer.invoke('select-file'),
  selectSaveFile: (defaultName) => ipcRenderer.invoke('select-save-file', defaultName),
  
  // Menu actions
  onMenuOpenImage: (callback) => ipcRenderer.on('menu-open-image', callback),
  onMenuSaveAnalysis: (callback) => ipcRenderer.on('menu-save-analysis', callback),
  onMenuCameraCapture: (callback) => ipcRenderer.on('menu-camera-capture', callback),
  onMenuImageProcessing: (callback) => ipcRenderer.on('menu-image-processing', callback),
  onMenuMetallurgicalAnalysis: (callback) => ipcRenderer.on('menu-metallurgical-analysis', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
