export interface BrowserTabInfo {
  id: string
  url: string
  title: string
  isLoading: boolean
  canGoBack: boolean
  canGoForward: boolean
  isHome: boolean
}

declare global {
  interface Window {
    electronAPI: {
      browser: {
        onTabsUpdated: (callback: (data: { tabs: BrowserTabInfo[], activeTabId: string | null }) => void) => () => void
        setBounds: (bounds: { x: number, y: number, width: number, height: number }) => void
        newTab: () => void
        closeTab: (id: string) => void
        activateTab: (id: string) => void
        navigate: (id: string, url: string) => void
        back: (id: string) => void
        forward: (id: string) => void
        reload: (id: string) => void
        stop: (id: string) => void
      }
    }
  }
}