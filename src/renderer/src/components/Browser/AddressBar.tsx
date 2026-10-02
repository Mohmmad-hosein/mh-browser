import { useEffect, useState } from 'react'
import type { BrowserTabInfo } from '../../types'

interface Props {
  tab: BrowserTabInfo | undefined
}

export default function AddressBar({ tab }: Props) {
  const [value, setValue] = useState('')

  useEffect(() => {
    if (!tab || tab.isHome) {
      setValue('')
      return
    }
    setValue(tab.url)
  }, [tab?.id, tab?.url, tab?.isHome])

  const navigate = () => {
    if (!tab) return
    window.electronAPI.browser.navigate(tab.id, value)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') navigate()
  }

  const isSecure = value.startsWith('https://')

  return (
    <div className="address-wrapper">
      <div className="security-icon">{isSecure ? '🔒' : 'ⓘ'}</div>
      <input
        className="address-input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search or enter web address"
        spellCheck={false}
      />
      <button className="address-go" onClick={navigate}>Go</button>
    </div>
  )
}