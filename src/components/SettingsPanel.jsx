export default function SettingsPanel({ isDark, setIsDark, isTurkish, setIsTurkish }) {
  return (
    <div className="fixed top-20 right-4 z-50 flex flex-col gap-3">
      {/* Dark Mode Toggle */}
      <button
        onClick={() => setIsDark(!isDark)}
        className={`p-3 rounded-full backdrop-blur-md hover:scale-110 transition-all duration-300 shadow-lg ${
          isDark
            ? 'bg-gray-800 text-yellow-400 border border-gray-700'
            : 'bg-white/90 text-gray-700 border border-blue-200'
        }`}
        title={isDark ? "Light Mode" : "Dark Mode"}
      >
        {isDark ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        )}
      </button>

      {/* Language Toggle */}
      <button
        onClick={() => setIsTurkish(!isTurkish)}
        className={`px-4 py-3 rounded-full font-semibold text-sm backdrop-blur-md hover:scale-110 transition-all duration-300 shadow-lg ${
          isDark
            ? 'bg-gray-800 text-blue-400 border border-gray-700'
            : 'bg-white/90 text-blue-700 border border-blue-200'
        }`}
        title={isTurkish ? "Switch to English" : "Türkçe'ye Geç"}
      >
        {isTurkish ? "EN" : "TR"}
      </button>
    </div>
  )
}
