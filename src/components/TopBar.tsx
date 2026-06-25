interface Props {
  title: string
  onBack?: () => void
  right?: React.ReactNode
}

export function TopBar({ title, onBack, right }: Props) {
  return (
    <div className="topbar">
      {onBack && (
        <button className="back" onClick={onBack} aria-label="Back">
          ‹
        </button>
      )}
      <h2>{title}</h2>
      <div className="spacer" />
      {right}
    </div>
  )
}
