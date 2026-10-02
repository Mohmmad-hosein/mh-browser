import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  browser: {
    onTabsUpdated: (callback) => {
      const listener = (_event, data) => callback(data)
      ipcRenderer.on('tabs-updated', listener)
      return () => ipcRenderer.removeListener('tabs-updated', listener)
    },
    setBounds: (bounds) => ipcRenderer.send('set-bounds', bounds),
    newTab: () => ipcRenderer.send('new-tab'),
    closeTab: (id) => ipcRenderer.send('close-tab', id),
    activateTab: (id) => ipcRenderer.send('activate-tab', id),
    navigate: (id, url) => ipcRenderer.send('navigate', id, url),
    back: (id) => ipcRenderer.send('back', id),
    forward: (id) => ipcRenderer.send('forward', id),
    reload: (id) => ipcRenderer.send('reload', id),
    stop: (id) => ipcRenderer.send('stop', id)
  }
})