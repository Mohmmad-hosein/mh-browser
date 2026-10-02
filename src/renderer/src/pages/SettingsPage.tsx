export default function SettingsPage() {
  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Configure your MH Browser experience.</p>
      </div>
      <section className="settings-section">
        <h2>General</h2>
        <div className="setting-row">
          <div>
            <strong>Search Engine</strong>
            <p>Google</p>
          </div>
          <select defaultValue="google">
            <option value="google">Google</option>
            <option value="duckduckgo">DuckDuckGo</option>
            <option value="bing">Bing</option>
          </select>
        </div>
        <div className="setting-row">
          <div>
            <strong>Startup Page</strong>
            <p>MH Browser New Tab</p>
          </div>
          <span className="setting-status">Active</span>
        </div>
      </section>
      <section className="settings-section">
        <h2>About</h2>
        <div className="about-card">
          <div className="about-logo">MH</div>
          <div>
            <strong>MH Browser</strong>
            <p>Version 0.1.0</p>
            <p>Built with Electron + React + TypeScript.</p>
          </div>
        </div>
      </section>
    </div>
  )
}