export default function ProjectButton({ href, type, isDark, children }) {
  const baseClasses = "inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group/btn cursor-pointer"
  
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