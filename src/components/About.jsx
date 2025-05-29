export default function About({ isDark, t }) {
  return (
    <section id="about" className={`px-6 py-16 ${isDark ? 'bg-gradient-to-br from-gray-800 to-gray-900' : 'bg-gradient-to-br from-pink-100 to-pink-50'} transition-all duration-500`}>
      <div className="max-w-4xl mx-auto text-center">
        <h3 className={`text-3xl font-bold mb-8 bg-gradient-to-r ${isDark ? 'from-purple-400 to-pink-400' : 'from-pink-500 to-pink-600'} bg-clip-text text-transparent`}>
          {t.about.title}
        </h3>
        
        <div className={`${isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-white/90 border-pink-200'} backdrop-blur-sm rounded-3xl p-8 shadow-lg border hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}>
          <p className={`text-lg leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-500`}>
            {t.about.text}
          </p>
        </div>
    
      </div>
    </section>
  )
}

// Skills Component
function Skills({ isDark }) {
  const skills = [
    { name: "React", level: 90, icon: "⚛️" },
    { name: "WebGL", level: 85, icon: "🎮" },
    { name: "Three.js", level: 80, icon: "🎨" },
    { name: "AI/ML", level: 75, icon: "🤖" },
    { name: "Node.js", level: 85, icon: "🟢" },
    { name: "Python", level: 88, icon: "🐍" }
  ]

  return (
    <div className="mt-12">
      <h4 className={`text-2xl font-semibold mb-8 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
        Skills & Technologies
      </h4>
      
      <div className="grid md:grid-cols-2 gap-6">
        {skills.map((skill, i) => (
          <div 
            key={i}
            className={`p-4 ${isDark ? 'bg-gray-800/40 border-gray-700' : 'bg-white/60 border-pink-200'} rounded-2xl border backdrop-blur-sm hover:shadow-lg transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{skill.icon}</span>
                <h5 className={`font-semibold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                  {skill.name}
                </h5>
              </div>
              <span className={`text-sm font-medium ${isDark ? 'text-purple-400' : 'text-pink-600'}`}>
                {skill.level}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className={`w-full h-2 ${isDark ? 'bg-gray-700' : 'bg-pink-100'} rounded-full overflow-hidden`}>
              <div 
                className={`h-full bg-gradient-to-r ${isDark ? 'from-purple-500 to-pink-500' : 'from-pink-500 to-pink-600'} rounded-full transition-all duration-1000 ease-out`}
                style={{ width: `${skill.level}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}