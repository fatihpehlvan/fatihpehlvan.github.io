export default function Contact({ isDark, t }) {
  return (
    <footer
      id="contact"
      className={`px-6 py-12 border-t transition-all duration-500 ${
        isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-100 border-blue-100'
      }`}
    >
      <div className="max-w-4xl mx-auto">
        {/* Başlık ve mail */}
        <div className="text-center mb-12">
          <h3
            className={`text-3xl font-semibold mb-6 ${
              isDark ? 'text-gray-100' : 'text-gray-800'
            }`}
          >
            {t.contact.title}
          </h3>

          <a
            href={`mailto:${t.contact.email}`}
            className={`inline-block text-lg font-mono font-medium transition-colors duration-300 ${
              isDark
                ? 'text-green-400 hover:text-green-300'
                : 'text-blue-600 hover:text-blue-700'
            }`}
          >
            {t.contact.email}
          </a>
        </div>

        {/* Sosyal Medya Bağlantıları */}
        <SocialLinks isDark={isDark} />

        {/* Footer yazısı */}
        <div
          className={`mt-8 pt-6 border-t text-center ${
            isDark ? 'border-gray-700' : 'border-blue-100'
          }`}
        >
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t.contact.footer}
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLinks({ isDark }) {
  const socialLinks = [
    {
      name: 'GitHub',
      url: 'https://github.com/fatihpehlivan',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.21 11.39.6.11.79-.26.79-.58v-2.23c-3.34.73-4.03-1.42-4.03-1.42-.55-1.39-1.34-1.76-1.34-1.76-1.09-.74.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49.99.11-.78.42-1.31.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.23a11.53 11.53 0 0 1 6.01 0c2.28-1.55 3.29-1.23 3.29-1.23.66 1.65.25 2.87.12 3.17.77.84 1.24 1.91 1.24 3.22 0 4.61-2.8 5.62-5.48 5.92.43.37.83 1.1.83 2.22v3.29c0 .32.19.7.8.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
        </svg>
      )
    },
    {
      name: 'LinkedIn',
      url: 'https://linkedin.com/in/fatihpehlivan',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45z" />
        </svg>
      )
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/fatihpehlivan',
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 4.57a10 10 0 0 1-2.83.78 4.94 4.94 0 0 0 2.16-2.72 9.86 9.86 0 0 1-3.13 1.19 4.92 4.92 0 0 0-8.39 4.49C7.69 8.1 4.06 6.13 1.64 3.16a4.92 4.92 0 0 0-.67 2.48c0 1.71.87 3.21 2.19 4.1a4.9 4.9 0 0 1-2.23-.62v.06a4.93 4.93 0 0 0 3.95 4.83 4.99 4.99 0 0 1-2.22.08 4.94 4.94 0 0 0 4.6 3.42A9.87 9.87 0 0 1 0 19.54a13.94 13.94 0 0 0 7.55 2.21c9.06 0 14-7.5 14-14v-.64A9.94 9.94 0 0 0 24 4.59z" />
        </svg>
      )
    }
  ];

  return (
    <div className="flex justify-center gap-6">
      {socialLinks.map((link, i) => (
        <a
          key={i}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={link.name}
          className={`p-3 rounded-full transition-all duration-300 hover:scale-110 ${
            isDark
              ? 'bg-gray-700 text-gray-300 hover:text-green-400 hover:bg-gray-600'
              : 'bg-blue-100 text-blue-600 hover:text-blue-700 hover:bg-blue-200'
          }`}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
}
