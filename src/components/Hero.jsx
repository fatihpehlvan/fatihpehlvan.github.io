export default function Hero({ isDark, t }) {
  return (
    <section id="hero" className="text-center py-20 px-4 animate-fade-in">
      <div className="animate-float">
        <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl shadow-lg transition-all duration-500 ${
          isDark
            ? 'bg-gray-800 text-green-400'
            : 'bg-blue-100 text-blue-700'
        }`}>
          👨‍💻
        </div>
      </div>

      <h2 className={`text-5xl font-semibold mb-4 ${
        isDark
          ? 'text-green-400'
          : 'text-blue-700'
      } transition-colors duration-500`}>
        {t.greeting}
      </h2>

      <p className={`text-lg max-w-xl mx-auto leading-relaxed transition-colors duration-500 ${
        isDark ? 'text-gray-300' : 'text-gray-600'
      }`}>
        {t.intro}
      </p>
    </section>
  );
}
