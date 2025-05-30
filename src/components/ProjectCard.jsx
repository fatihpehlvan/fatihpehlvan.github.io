import ProjectButton from './ProjectButton.jsx';

export default function ProjectCard({ project, isDark }) {
  return (
    <div
      className={`group p-6 rounded-3xl shadow-md border backdrop-blur-sm transition-all duration-300 transform hover:-translate-y-2 hover:scale-[1.02] relative ${
        isDark
          ? 'bg-gray-800/60 border-gray-700'
          : 'bg-white/90 border-blue-200'
      }`}
    >
      {/* Hover efekti için arka plan gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-r rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 -z-10 ${
          isDark
            ? 'from-green-500 via-blue-500 to-green-600'
            : 'from-blue-400 via-blue-500 to-green-500'
        }`}
      ></div>

      <div className="relative">
        {/* İkon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-md transition-all duration-300 ${
            isDark
              ? 'bg-gray-700 text-green-300 group-hover:scale-105'
              : 'bg-blue-100 text-blue-700 group-hover:scale-105'
          }`}
        >
          {project.icon}
        </div>

        {/* Başlık */}
        <h4
          className={`text-xl font-semibold mb-3 transition-colors duration-300 ${
            isDark
              ? 'text-gray-100 group-hover:text-green-400'
              : 'text-gray-800 group-hover:text-blue-600'
          }`}
        >
          {project.title}
        </h4>

        {/* Açıklama */}
        <p
          className={`mb-6 leading-relaxed transition-colors duration-300 ${
            isDark
              ? 'text-gray-300 group-hover:text-gray-200'
              : 'text-gray-600 group-hover:text-gray-700'
          }`}
        >
          {project.desc}
        </p>

        {/* Butonlar */}
        <div className="flex gap-3 flex-wrap">
          {project.run && (
            <ProjectButton href={project.run} type="primary" isDark={isDark}>
              <svg
                className="w-4 h-4 group-hover/btn:rotate-12 transition-transform duration-300"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z" />
              </svg>
              Demo
            </ProjectButton>
          )}

          <ProjectButton href={project.code} type="secondary" isDark={isDark}>
            <svg
              className="w-4 h-4 group-hover/btn:scale-125 transition-transform duration-300"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Code
          </ProjectButton>
        </div>
      </div>
    </div>
  );
}
