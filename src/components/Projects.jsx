import { useState } from 'react'
import CategoryCard from './CategoryCard.jsx'
import ProjectCard from './ProjectCard.jsx'
import { getCategories, getProjectsByCategory, getBackButtonText } from '../data/projectsData'

export default function Projects({ isDark, t, isTurkish }) {
  const [selectedCategory, setSelectedCategory] = useState(null)
  
  const categories = getCategories(isTurkish)
  const projectsByCategory = getProjectsByCategory(isTurkish)
  const backButtonText = getBackButtonText(isTurkish)

  // Kategori görünümü
  if (!selectedCategory) {
    return (
      <section id="projects" className={`px-6 py-16 ${isDark ? 'bg-gray-900/60' : 'bg-white/60'} backdrop-blur-sm transition-all duration-500`}>
        <div className="max-w-6xl mx-auto">
          <h3 className={`text-3xl font-bold mb-10 text-center bg-gradient-to-r ${isDark ? 'from-purple-400 to-pink-400' : 'from-pink-500 to-pink-600'} bg-clip-text text-transparent`}>
            {t.projects.title}
          </h3>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {categories.map((category, i) => (
              <CategoryCard 
                key={category.id} 
                category={category} 
                isDark={isDark}
                onClick={() => setSelectedCategory(category.id)}
              />
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Proje listesi görünümü
  const currentProjects = projectsByCategory[selectedCategory]
  const currentCategory = categories.find(cat => cat.id === selectedCategory)

  return (
    <section id="projects" className={`px-6 py-16 ${isDark ? 'bg-gray-900/60' : 'bg-white/60'} backdrop-blur-sm transition-all duration-500`}>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => setSelectedCategory(null)}
          className={`mb-8 flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-pink-100 text-pink-600 hover:bg-pink-200'} transition-all duration-300 cursor-pointer`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {backButtonText}
        </button>

        <h3 className={`text-3xl font-bold mb-10 text-center bg-gradient-to-r ${currentCategory.color} bg-clip-text text-transparent`}>
          {currentCategory.title}
        </h3>
        
        <div className="grid md:grid-cols-2 gap-8">
          {currentProjects.map((project, i) => (
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