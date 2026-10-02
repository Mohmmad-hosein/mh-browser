import type { BrowserTabInfo } from '../../types'

interface Props {
  tab: BrowserTabInfo | undefined
}

export default function BrowserControls({ tab }: Props) {
  const goBack = () => tab && window.electronAPI.browser.back(tab.id)
  const goForward = () => tab && window.electronAPI.browser.forward(tab.id)
  const reload = () => tab && window.electronAPI.browser.reload(tab.id)
  const stop = () => tab && window.electronAPI.browser.stop(tab.id)
  const goHome = () => tab && window.electronAPI.browser.navigate(tab.id, 'mh://home')

  return (
    <div className="browser-controls">
      <button className="control-button" disabled={!tab?.canGoBack} onClick={goBack} title="Back">←</button>
      <button className="control-button" disabled={!tab?.canGoForward} onClick={goForward} title="Forward">→</button>
      <button className="control-button" onClick={tab?.isLoading ? stop : reload} title={tab?.isLoading ? 'Stop' : 'Reload'}>
        {tab?.isLoading ? '×' : '↻'}
      </button>
      <button className="control-button" onClick={goHome} title="Home">⌂</button>
    </div>
  )
}