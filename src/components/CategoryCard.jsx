export default function CategoryCard({ category, isDark, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`group p-8 rounded-3xl shadow-md border cursor-pointer relative transform transition-all duration-300 hover:-translate-y-2 ${
        isDark
          ? 'bg-gray-800/60 border-gray-700'
          : 'bg-white/90 border-blue-200'
      } backdrop-blur-sm hover:shadow-xl`}
    >
      {/* Hover'da gradient efekti */}
      <div
        className={`absolute inset-0 bg-gradient-to-r ${category.color} rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 -z-10`}
      ></div>

      <div className="relative text-center">
        {/* Kategori ikonu */}
        <div
          className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl mb-6 mx-auto shadow-lg transition-all duration-300 ${
            category.color
          } group-hover:scale-105`}
        >
          {category.icon}
        </div>

        {/* Başlık */}
        <h4
          className={`text-2xl font-semibold mb-4 transition-colors duration-300 ${
            isDark
              ? 'text-gray-100 group-hover:text-green-400'
              : 'text-gray-800 group-hover:text-blue-600'
          }`}
        >
          {category.title}
        </h4>

        {/* Açıklama */}
        <p
          className={`leading-relaxed transition-colors duration-300 ${
            isDark
              ? 'text-gray-300 group-hover:text-gray-200'
              : 'text-gray-600 group-hover:text-gray-700'
          }`}
        >
          {category.desc}
        </p>

        {/* Ok ikonu */}
        <div
          className={`mt-6 transition-transform duration-300 group-hover:translate-x-1 ${
            isDark ? 'text-green-400' : 'text-blue-500'
          }`}
        >
          <svg
            className="w-6 h-6 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
