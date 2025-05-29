export default function Projects({ isDark, t }) {
  const projects = [
    {
      title: 'Voronoi Visualizer',
      desc: 'A visual simulation of Voronoi diagrams using custom sweep logic.',
      code: 'https://github.com/fatihpehlivan/voronoi',
      run: 'https://fatihpehlivan.github.io/voronoi',
      icon: '🔷'
    },
    {
      title: 'Shadow Mapping Demo',
      desc: 'Real-time shadows with WebGL & Babylon.js.',
      code: 'https://github.com/fatihpehlivan/shadow-demo',
      run: null,
      icon: '🌗'
    },
    {
      title: 'AI Art Generator',
      desc: 'Generate beautiful artwork using machine learning algorithms.',
      code: 'https://github.com/fatihpehlivan/ai-art',
      run: 'https://fatihpehlivan.github.io/ai-art',
      icon: '🎨'
    },
    {
      title: 'Portfolio Website',
      desc: 'Personal portfolio built with React and modern design principles.',
      code: 'https://github.com/fatihpehlivan/portfolio',
      run: 'https://fatihpehlivan.com',
      icon: '💼'
    }
  ]

  return (
    <section id="projects" className={`px-6 py-16 ${isDark ? 'bg-gray-900/60' : 'bg-white/60'} backdrop-blur-sm transition-all duration-500`}>
      <div className="max-w-6xl mx-auto">
        <h3 className={`text-3xl font-bold mb-10 text-center bg-gradient-to-r ${isDark ? 'from-purple-400 to-pink-400' : 'from-pink-500 to-pink-600'} bg-clip-text text-transparent`}>
          {t.projects.title}
        </h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, i) => (
            <ProjectCard 
              key={i} 
              project={project} 
              isDark={isDark} 
            />
          ))}
        </div>
      </div>
    </section>
  )
}

// Project Card Component
function ProjectCard({ project, isDark }) {
  return (
    <div className={`project-card-hover group p-6 ${isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-white/90 border-pink-200'} backdrop-blur-sm rounded-3xl shadow-md border hover:shadow-2xl transition-all duration-300 transform cursor-pointer relative`}>
      {/* Gradient border effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${isDark ? 'from-purple-500 via-pink-500 to-purple-600' : 'from-pink-400 via-pink-500 to-pink-600'} rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10`}></div>
      
      <div className="relative">
        {/* Project Icon */}
        <div className={`w-16 h-16 bg-gradient-to-br ${isDark ? 'from-purple-400 to-pink-400' : 'from-pink-200 to-pink-300'} rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-125 group-hover:rotate-6 transition-all duration-500 shadow-lg`}>
          {project.icon}
        </div>

        <h4 className={`text-xl font-semibold mb-3 ${isDark ? 'text-gray-100 group-hover:text-purple-400' : 'text-gray-800 group-hover:text-pink-600'} transition-colors duration-300`}>
          {project.title}
        </h4>
        
        <p className={`${isDark ? 'text-gray-300 group-hover:text-gray-200' : 'text-gray-600 group-hover:text-gray-700'} mb-6 leading-relaxed transition-colors duration-300`}>
          {project.desc}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 flex-wrap">
          {project.run && (
            <ProjectButton
              href={project.run}
              type="primary"
              isDark={isDark}
            >
              <svg className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
              </svg>
              Demo
            </ProjectButton>
          )}
          
          <ProjectButton
            href={project.code}
            type="secondary"
            isDark={isDark}
          >
            <svg className="w-4 h-4 group-hover/btn:scale-125 transition-transform duration-300" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Code
          </ProjectButton>
        </div>
      </div>
    </div>
  )
}

// Project Button Component
function ProjectButton({ href, type, isDark, children }) {
  const baseClasses = "inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group/btn"
  
  const typeClasses = {
    primary: isDark 
      ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white" 
      : "bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white",
    secondary: isDark
      ? "bg-gray-700 text-purple-400 border-2 border-gray-600 hover:bg-gray-600 hover:border-purple-400"
      : "bg-pink-100 text-pink-600 border-2 border-pink-300 hover:bg-pink-200 hover:border-pink-400"
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClasses} ${typeClasses[type]}`}
    >
      {children}
    </a>
  )
}