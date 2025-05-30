import { useState } from 'react'

export default function Navbar({ isDark, t, scrollToSection }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className={`flex justify-between items-center px-6 py-4 sticky top-0 z-40 border-b backdrop-blur-md transition-all duration-500 ${
      isDark ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-blue-100'
    }`}>
      {/* Başlık */}
      <h1 className={`text-xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
        isDark ? 'from-green-400 to-blue-400' : 'from-blue-600 to-blue-400'
      }`}>
        {t.name}
      </h1>

      {/* Desktop Menü */}
      <ul className="hidden md:flex gap-6">
        {Object.entries(t.nav).map(([key, label]) => (
          <li key={key}>
            <button
              onClick={() => scrollToSection(key === 'home' ? 'hero' : key)}
              className={`transition-colors duration-300 bg-transparent border-none cursor-pointer ${
                isDark ? 'text-gray-300 hover:text-green-400' : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      {/* Mobile Menü Butonu */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`md:hidden p-2 rounded-lg transition-colors duration-300 ${
          isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-blue-50'
        }`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menü */}
      {isMenuOpen && (
        <div className={`absolute top-full left-0 right-0 md:hidden backdrop-blur-md border-t ${
          isDark ? 'bg-gray-900/95 border-gray-700' : 'bg-white/95 border-blue-100'
        }`}>
          <ul className="flex flex-col py-4">
            {Object.entries(t.nav).map(([key, label]) => (
              <li key={key}>
                <button
                  onClick={() => {
                    scrollToSection(key === 'home' ? 'hero' : key)
                    setIsMenuOpen(false)
                  }}
                  className={`w-full text-left px-6 py-3 transition-colors duration-300 bg-transparent border-none cursor-pointer ${
                    isDark ? 'text-gray-300 hover:text-green-400 hover:bg-gray-700/50' : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  )
}
