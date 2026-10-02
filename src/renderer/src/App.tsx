import { useEffect, useMemo, useState } from 'react'
import type { BrowserTabInfo } from './types'

import BrowserTabs from './components/Browser/BrowserTabs'
import BrowserControls from './components/Browser/BrowserControls'
import AddressBar from './components/Browser/AddressBar'
import HomePage from './components/Home/HomePage'
import SettingsPage from './pages/SettingsPage'

const TOOLBAR_HEIGHT = 112

function App() {
  const [tabs, setTabs] = useState<BrowserTabInfo[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const activeTab = useMemo(
    () => tabs.find((tab) => tab.id === activeTabId),
    [tabs, activeTabId]
  )

  useEffect(() => {
    const unsubscribe = window.electronAPI.browser.onTabsUpdated((data) => {
      setTabs(data.tabs)
      setActiveTabId(data.activeTabId)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    const sendBounds = () => {
      window.electronAPI.browser.setBounds({
        x: 0,
        y: TOOLBAR_HEIGHT,
        width: window.innerWidth,
        height: window.innerHeight - TOOLBAR_HEIGHT,
      })
    }

    sendBounds()
    window.addEventListener('resize', sendBounds)
    return () => window.removeEventListener('resize', sendBounds)
  }, [])

  useEffect(() => {
    const handleKeyboard = (event: KeyboardEvent) => {
      const modifier = event.ctrlKey || event.metaKey
      if (!modifier) return

      if (event.key.toLowerCase() === 'l') {
        event.preventDefault()
        const input = document.querySelector<HTMLInputElement>('.address-input')
        input?.focus()
        input?.select()
      }
      if (event.key.toLowerCase() === 't') {
        event.preventDefault()
        window.electronAPI.browser.newTab()
      }
      if (event.key.toLowerCase() === 'w') {
        event.preventDefault()
        if (activeTabId) window.electronAPI.browser.closeTab(activeTabId)
      }
      if (event.key.toLowerCase() === 'r') {
        event.preventDefault()
        if (activeTabId) window.electronAPI.browser.reload(activeTabId)
      }
    }

    window.addEventListener('keydown', handleKeyboard)
    return () => window.removeEventListener('keydown', handleKeyboard)
  }, [activeTabId])

  const newTab = () => {
    setShowSettings(false)
    window.electronAPI.browser.newTab()
  }

  const selectTab = (id: string) => {
    setShowSettings(false)
    window.electronAPI.browser.activateTab(id)
  }

  const closeTab = (id: string) => {
    window.electronAPI.browser.closeTab(id)
  }

  return (
    <div className="app">
      <header className="browser-header">
        <BrowserTabs
          tabs={tabs}
          activeTabId={activeTabId}
          onSelect={selectTab}
          onClose={closeTab}
          onNew={newTab}
        />
        <div className="navigation-bar">
          <BrowserControls tab={activeTab} />
          <AddressBar tab={activeTab} />
          <button
            className="settings-button"
            onClick={() => setShowSettings((value) => !value)}
            title="Settings"
          >
            ⚙
          </button>
        </div>
      </header>

      <div className="app-content">
        {showSettings ? (
          <SettingsPage />
        ) : activeTab?.isHome ? (
          <HomePage tabId={activeTab.id} />
        ) : null}
      </div>
    </div>
  )
}

export default App