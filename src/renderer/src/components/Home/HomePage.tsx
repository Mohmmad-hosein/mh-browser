import { useState } from 'react'

interface Props {
  tabId: string | undefined
}

export default function HomePage({ tabId }: Props) {
  const [search, setSearch] = useState('')

  const submit = () => {
    if (!tabId || !search.trim()) return
    window.electronAPI.browser.navigate(tabId, search)
  }

  return (
    <main className="home-page">
      <div className="home-content">
        <h1>MH Browser</h1>
        <p className="home-subtitle">Fast. Private. Simple.</p>

        <div className="home-search">
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && submit()}
            placeholder="Search the web or enter a URL"
            autoFocus
          />
          <button onClick={submit}>Search</button>
        </div>

        <div className="quick-links">
          <button onClick={() => tabId && window.electronAPI.browser.navigate(tabId, 'https://www.google.com')}>Google</button>
          <button onClick={() => tabId && window.electronAPI.browser.navigate(tabId, 'https://www.youtube.com')}>YouTube</button>
          <button onClick={() => tabId && window.electronAPI.browser.navigate(tabId, 'https://github.com')}>GitHub</button>
        </div>
      </div>
    </main>
  )
}