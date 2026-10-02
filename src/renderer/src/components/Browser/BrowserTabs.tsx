import type { BrowserTabInfo } from '../../types'

interface BrowserTabsProps {
  tabs: BrowserTabInfo[]
  activeTabId: string | null
  onSelect: (id: string) => void
  onClose: (id: string) => void
  onNew: () => void
}

export default function BrowserTabs({
  tabs,
  activeTabId,
  onSelect,
  onClose,
  onNew,
}: BrowserTabsProps) {
  return (
    <div className="tabs-container">
      <div className="tabs-list">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId
          return (
            <div
              key={tab.id}
              className={`browser-tab ${isActive ? 'active' : ''}`}
              onClick={() => onSelect(tab.id)}
            >
              <div className="tab-icon">
                {tab.isLoading ? <span className="loading-icon">◌</span> : <span>🌐</span>}
              </div>
              <span className="tab-title">{tab.title || 'New Tab'}</span>
              <button
                className="tab-close"
                onClick={(event) => {
                  event.stopPropagation()
                  onClose(tab.id)
                }}
                title="Close tab"
              >
                ×
              </button>
            </div>
          )
        })}
        <button className="new-tab-button" onClick={onNew} title="New Tab">
          +
        </button>
      </div>
    </div>
  )
}