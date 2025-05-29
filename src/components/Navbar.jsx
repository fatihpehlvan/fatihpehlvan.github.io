import { useState } from 'react'

export default function Navbar({ isDark, t, scrollToSection }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className={`flex justify-between items-center px-6 py-4 ${isDark ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-md sticky top-0 z-40 ${isDark ? 'border-gray-700' : 'border-pink-100'} border-b transition-all duration-500`}>
      <h1 className={`text-xl font-bold bg-gradient-to-r ${isDark ? 'from-purple-400 to-pink-400' : 'from-pink-500 to-pink-600'} bg-clip-text text-transparent`}>
        {t.name}
      </h1>
      
      {/* Desktop Menu */}
      <ul className="hidden md:flex gap-6">
        {Object.entries(t.nav).map(([key, label]) => (
          <li key={key}>
            <button 
              onClick={() => scrollToSection(key === 'home' ? 'hero' : key)} 
              className={`${isDark ? 'hover:text-purple-400' : 'hover:text-pink-500'} transition-colors duration-300 bg-transparent border-none cursor-pointer`}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`md:hidden p-2 rounded-lg ${isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-pink-50'} transition-colors duration-300`}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isMenuOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={`absolute top-full left-0 right-0 ${isDark ? 'bg-gray-800/95' : 'bg-white/95'} backdrop-blur-md border-t ${isDark ? 'border-gray-700' : 'border-pink-100'} md:hidden`}>
          <ul className="flex flex-col py-4">
            {Object.entries(t.nav).map(([key, label]) => (
              <li key={key}>
                <button 
                  onClick={() => {
                    scrollToSection(key === 'home' ? 'hero' : key)
                    setIsMenuOpen(false)
                  }} 
                  className={`w-full text-left px-6 py-3 ${isDark ? 'hover:text-purple-400 hover:bg-gray-700/50' : 'hover:text-pink-500 hover:bg-pink-50'} transition-colors duration-300 bg-transparent border-none cursor-pointer`}
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