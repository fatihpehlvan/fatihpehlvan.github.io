// About.jsx - Detaylı ve farklı tasarım
function About({ isDark, t }) {
  return (
    <section 
      id="about" 
      className={`py-20 px-6 ${
        isDark ? 'bg-gray-800' : 'bg-white'
      }`}
    >
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            {t.about.title}
          </h2>
          <p className={`text-lg ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {t.about.subtitle}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Sol taraf - Ana açıklama */}
          <div>
            <p className={`text-lg leading-relaxed mb-8 ${
              isDark ? 'text-gray-300' : 'text-gray-700'
            }`}>
              {t.about.text}
            </p>
            
            {/* İlgi alanları */}
            <div className="mb-8">
              <h3 className={`text-xl font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                {t.about.interests.title}
              </h3>
              <div className="flex flex-wrap gap-3">
                {t.about.interests.items.map((interest, index) => (
                  <span 
                    key={index}
                    className={`px-4 py-2 rounded-full text-sm ${
                      isDark 
                        ? 'bg-gray-700 text-gray-300' 
                        : 'bg-pink-100 text-pink-800'
                    }`}
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sağ taraf - Yetenekler ve deneyim */}
          

            {/* Deneyim */}
            <div>
              <h3 className={`text-xl font-semibold mb-6 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                {t.about.experience.title}
              </h3>
              <div className="space-y-6">
                {t.about.experience.items.map((item, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      isDark 
                        ? 'bg-gray-700 border-blue-500' 
                        : 'bg-gray-50 border-pink-500'
                    }`}
                  >
                    <div className={`text-sm font-medium ${
                      isDark ? 'text-blue-400' : 'text-pink-600'
                    }`}>
                      {item.period}
                    </div>
                    <h4 className={`font-semibold ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}>
                      {item.title}
                    </h4>
                    <div className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {item.company}
                    </div>
                    <p className={`text-sm mt-2 ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
    </section>
  )
}

export default About