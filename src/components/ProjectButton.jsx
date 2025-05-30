export default function ProjectButton({ href, type, isDark, children }) {
  const baseClasses =
    "inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium hover:-translate-y-1 hover:shadow-lg transition-all duration-300 group/btn cursor-pointer";

  const typeClasses = {
    primary: isDark
      ? "bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
      : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white",

    secondary: isDark
      ? "bg-gray-800 text-green-400 border-2 border-gray-600 hover:bg-gray-700 hover:border-green-400"
      : "bg-white text-blue-600 border-2 border-blue-300 hover:bg-blue-50 hover:border-blue-500",
  };

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`${baseClasses} ${typeClasses[type]}`}
    >
      {children}
    </a>
  );
}
