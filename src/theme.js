// Light or dark. The page follows the system setting until the visitor presses the switch;
// a choice that differs from the system is remembered. Listeners redraw on 'themechange'.
const KEY = 'theme'
const root = document.documentElement
const systemDark = window.matchMedia('(prefers-color-scheme: dark)')

const current = () => (getComputedStyle(root).colorScheme.includes('dark') ? 'dark' : 'light')
const announce = () => window.dispatchEvent(new Event('themechange'))

function remember(theme) {
  try {
    if (theme) localStorage.setItem(KEY, theme)
    else localStorage.removeItem(KEY)
  } catch (e) {
    // Storage can be blocked; the choice then lasts until the page is closed
  }
}

export function initTheme(button) {
  if (button) {
    button.addEventListener('click', () => {
      const next = current() === 'dark' ? 'light' : 'dark'
      const sameAsSystem = next === (systemDark.matches ? 'dark' : 'light')
      if (sameAsSystem) delete root.dataset.theme
      else root.dataset.theme = next
      remember(sameAsSystem ? null : next)
      announce()
    })
  }
  systemDark.addEventListener('change', announce)
}
