import type { Screen } from '../App'
import { TopBar } from '../components/TopBar'
import { RELEASES } from '../data/changelog'
import { APP_NAME } from '../version'

export function ReleaseNotesScreen({ go }: { go: (s: Screen) => void }) {
  return (
    <>
      <TopBar title="What’s New" onBack={() => go('home')} />
      <div className="screen-body">
        <p className="muted small">{APP_NAME} release history.</p>
        {RELEASES.map((rel) => (
          <div className="release" key={rel.version}>
            <div className="head">
              <span className="vtag">v{rel.version}</span>
              <strong>{rel.title}</strong>
              <span className="date">{rel.date}</span>
            </div>
            {rel.highlights.length > 0 && (
              <ul style={{ paddingLeft: 18, margin: '8px 0' }}>
                {rel.highlights.map((h, i) => (
                  <li key={i} style={{ marginBottom: 4 }}>{h}</li>
                ))}
              </ul>
            )}
            <div className="card-surface" style={{ padding: 12 }}>
              {rel.changes.map((c, i) => (
                <div className="change" key={i}>
                  <span className={`tag ${c.type}`}>{c.type}</span>
                  <span>{c.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
