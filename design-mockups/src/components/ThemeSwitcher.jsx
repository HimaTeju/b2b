const OPTIONS = [
  { key: 'a', label: 'A · Workshop Warm' },
  { key: 'b', label: 'B · Directory Bold' },
  { key: 'c', label: 'C · Simple Trust' }
]

function ThemeSwitcher({ theme, setTheme }) {
  return (
    <div className="theme-switch">
      {OPTIONS.map(opt => (
        <button
          key={opt.key}
          className={`theme-switch__btn${theme === opt.key ? ' theme-switch__btn--active' : ''}`}
          onClick={() => setTheme(opt.key)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default ThemeSwitcher
