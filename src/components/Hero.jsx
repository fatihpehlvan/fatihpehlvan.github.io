export default function Hero({ isDark, t }) {
  return (
    <section id="hero" className="text-center py-20 px-4 animate-fade-in">
      <div className="animate-float">
        <div className={`w-24 h-24 bg-gradient-to-br ${isDark ? 'from-purple-500 to-pink-500' : 'from-pink-400 to-pink-500'} rounded-full mx-auto mb-6 flex items-center justify-center text-3xl shadow-lg transition-all duration-500`}>
          👨‍💻
        </div>
      </div>
      <h2 className={`text-5xl font-semibold mb-4 bg-gradient-to-r ${isDark ? 'from-purple-400 to-pink-400' : 'from-pink-500 to-pink-600'} bg-clip-text text-transparent`}>
        {t.greeting}
      </h2>
      <p className={`text-lg max-w-xl mx-auto ${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed transition-colors duration-500`}>
        {t.intro}
      </p>
    </section>
  )
}