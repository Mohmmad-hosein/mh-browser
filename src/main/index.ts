import { app, shell, BrowserWindow, ipcMain, WebContentsView } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import crypto from 'crypto'

let mainWindow: BrowserWindow
let views: Record<string, WebContentsView> = {}
let activeTabId: string | null = null
let viewBounds = { x: 0, y: 112, width: 800, height: 600 }

function isUrlHome(url: string) {
  return url === 'about:blank' || url === '' || url.startsWith('mh://')
}

// مخفی کردن لایه کرومیوم برای نمایش صفحه Home
function updateActiveViewVisibility() {
  if (!mainWindow || !activeTabId || !views[activeTabId]) return
  
  const view = views[activeTabId]
  const url = view.webContents.getURL()
  
  try {
    if (isUrlHome(url)) {
      view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
    } else {
      view.setBounds(viewBounds)
    }
  } catch (e) {}
}

function broadcastTabs() {
  if (!mainWindow) return
  const tabs = Object.keys(views).map(id => {
    const view = views[id]
    const url = view.webContents.getURL()
    return {
      id,
      url,
      title: view.webContents.getTitle() || 'New Tab',
      isLoading: view.webContents.isLoading(),
      canGoBack: view.webContents.navigationHistory.canGoBack(),
      canGoForward: view.webContents.navigationHistory.canGoForward(),
      isHome: isUrlHome(url)
    }
  })
  
  mainWindow.webContents.send('tabs-updated', { tabs, activeTabId })
  updateActiveViewVisibility()
}

function activateTab(id: string) {
  if (activeTabId && views[activeTabId]) {
    try { mainWindow.contentView.removeChildView(views[activeTabId]) } catch(e){}
  }
  activeTabId = id
  if (views[id]) {
    try { mainWindow.contentView.addChildView(views[id]) } catch(e){}
  }
  broadcastTabs()
}

function createTab(url = 'mh://home') { 
  const id = crypto.randomUUID()
  const view = new WebContentsView()
  
  // تیره کردن پس‌زمینه برای جلوگیری از فلش سفید هنگام باز شدن تب
  view.setBackgroundColor('#121212') 
  views[id] = view

  view.webContents.on('did-start-loading', broadcastTabs)
  view.webContents.on('did-stop-loading', broadcastTabs)
  view.webContents.on('page-title-updated', broadcastTabs)
  view.webContents.on('did-navigate', broadcastTabs)
  view.webContents.on('did-navigate-in-page', broadcastTabs)

  // سد امنیتی تب‌های مزاحم
  view.webContents.setWindowOpenHandler((details) => {
    if (details.url && (details.url.startsWith('http://') || details.url.startsWith('https://'))) {
       view.webContents.loadURL(details.url).catch(() => {})
    }
    return { action: 'deny' }
  })

  const finalUrl = isUrlHome(url) ? 'about:blank' : url
  if (isUrlHome(finalUrl)) {
    view.setBounds({ x: 0, y: 0, width: 0, height: 0 })
  }

  view.webContents.loadURL(finalUrl).catch(() => {})
  activateTab(id)
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.webContents.setWindowOpenHandler(() => {
     return { action: 'deny' }
  })
  
  mainWindow.webContents.on('will-navigate', (event) => {
     event.preventDefault()
  })

  // ✨ راه حل نهایی: فقط یک بار اجرا می‌شود
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    createTab('mh://home')
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.on('new-tab', () => createTab('mh://home'))
  
  ipcMain.on('close-tab', (_, id) => {
    if (views[id]) {
      if (activeTabId === id) {
        try { mainWindow.contentView.removeChildView(views[id]) } catch(e){}
      }
      ;(views[id].webContents as any).destroy?.() 
      delete views[id]
      
      const remaining = Object.keys(views)
      if (remaining.length > 0) {
        activateTab(remaining[remaining.length - 1])
      } else {
        app.quit()
      }
      broadcastTabs()
    }
  })

  ipcMain.on('activate-tab', (_, id) => activateTab(id))
  
  ipcMain.on('navigate', (_, id, url) => {
    let finalUrl = url
    if (isUrlHome(url)) {
      finalUrl = 'about:blank'
    } else if (!url.startsWith('http') && !url.startsWith('mh://')) {
      finalUrl = `https://www.google.com/search?q=${encodeURIComponent(url)}`
    }
    views[id]?.webContents.loadURL(finalUrl).catch(() => {})
  })

  ipcMain.on('back', (_, id) => views[id]?.webContents.navigationHistory.goBack())
  ipcMain.on('forward', (_, id) => views[id]?.webContents.navigationHistory.goForward())
  ipcMain.on('reload', (_, id) => views[id]?.webContents.reload())
  ipcMain.on('stop', (_, id) => views[id]?.webContents.stop())
  
  ipcMain.on('set-bounds', (_, bounds) => {
    viewBounds = bounds
    updateActiveViewVisibility()
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})