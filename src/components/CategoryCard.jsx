export default function CategoryCard({ category, isDark, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`group p-8 ${isDark ? 'bg-gray-800/60 border-gray-700' : 'bg-white/90 border-pink-200'} backdrop-blur-sm rounded-3xl shadow-md border hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 cursor-pointer relative`}
    >
      {/* Gradient border effect */}
      <div className={`absolute inset-0 bg-gradient-to-r ${category.color} rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10`}></div>
      
      <div className="relative text-center">
        {/* Category Icon */}
        <div className={`w-20 h-20 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg`}>
          {category.icon}
        </div>

        <h4 className={`text-2xl font-semibold mb-4 ${isDark ? 'text-gray-100 group-hover:text-purple-400' : 'text-gray-800 group-hover:text-pink-600'} transition-colors duration-300`}>
          {category.title}
        </h4>
        
        <p className={`${isDark ? 'text-gray-300 group-hover:text-gray-200' : 'text-gray-600 group-hover:text-gray-700'} leading-relaxed transition-colors duration-300`}>
          {category.desc}
        </p>

        {/* Arrow Icon */}
        <div className={`mt-6 ${isDark ? 'text-purple-400' : 'text-pink-500'} group-hover:translate-x-2 transition-transform duration-300`}>
          <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>
    </div>
  )
}