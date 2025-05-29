import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Contact from './components/Contact'
import SettingsPanel from './components/SettingsPanel'

function App() {
  const [isDark, setIsDark] = useState(false)
  const [isTurkish, setIsTurkish] = useState(true)

  useEffect(() => {
    // Müzik çalma
    const audio = new Audio('/lofi.mp3')
    audio.volume = 0.15
    audio.loop = true
    audio.play().catch(() => {})
  }, [])

  // Content based on language
  const content = {
    tr: {
      name: "Fatih Pehlivan",
      greeting: "Merhaba, ben Fatih 👋",
      intro: "Bilgisayar grafikleri, yapay zeka ve anlamlı tasarım konusunda tutkulu bir bilgisayar mühendisiyim.",
      nav: {
        home: "Ana Sayfa",
        about: "Hakkımda", 
        projects: "Projeler",
        contact: "İletişim"
      },
      about: {
        title: "Hakkımda",
        text: "Bilkent Üniversitesi'nde yüksek lisans öğrencisiyim ve bilgisayar grafikleri ile akıllı sistemlerin kesişimini keşfediyorum. Görsel sistemler kurmayı, öğrendiklerimi açıklamayı ve sezgisel araçlar tasarlamayı seviyorum."
      },
      projects: {
        title: "Projelerim"
      },
      contact: {
        title: "İletişime Geçelim ✉️",
        email: "fpehlivan1542@gmail.com",
        footer: "© 2025 Fatih Pehlivan"
      }
    },
    en: {
      name: "Fatih Pehlivan",
      greeting: "Hi, I'm Fatih 👋",
      intro: "I'm a computer engineer passionate about graphics, AI, and meaningful design.",
      nav: {
        home: "Home",
        about: "About",
        projects: "Projects", 
        contact: "Contact"
      },
      about: {
        title: "About Me",
        text: "I'm a graduate student at Bilkent University, exploring the intersection of computer graphics and intelligent systems. I love building visual systems, explaining what I learn, and designing tools that feel intuitive."
      },
      projects: {
        title: "Projects"
      },
      contact: {
        title: "Let's get in touch ✉️",
        email: "fpehlivan1542@gmail.com",
        footer: "© 2025 Fatih Pehlivan"
      }
    }
  }

  const t = content[isTurkish ? 'tr' : 'en']

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  return (
    <div className={isDark ? 'dark' : ''}>
      <main className={`${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-pink-100 via-pink-50 to-white'} text-gray-800 dark:text-gray-100 min-h-screen transition-all duration-500`}>
        
        <SettingsPanel 
          isDark={isDark} 
          setIsDark={setIsDark} 
          isTurkish={isTurkish} 
          setIsTurkish={setIsTurkish} 
        />

        <Navbar isDark={isDark} t={t} scrollToSection={scrollToSection} />
        
        <Hero isDark={isDark} t={t} />

        <About isDark={isDark} t={t} />

        <Projects isDark={isDark} t={t} />

        <Contact isDark={isDark} t={t} />

      </main>
    </div>
  )
}

export default App