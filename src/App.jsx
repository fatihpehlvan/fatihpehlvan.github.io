import { useEffect, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Projects from './components/Projects.jsx'
import Contact from './components/Contact.jsx'
import SettingsPanel from './components/SettingsPanel.jsx'

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
    intro: "Grafikler • Yapay Zeka • Algoritmalar • Öğretmek • Problem Çözmek",
    nav: {
      home: "Ana Sayfa",
      about: "Hakkımda",
      projects: "Projeler",
      contact: "İletişim"
    },
    about: {
      title: "Hakkımda",
      subtitle: "Kim olduğumu ve ne yaptığımı öğrenin",
      text: "Hacettepe Üniversitesi Bilgisayar Mühendisliği bölümünden 2024 yılında bölüm 3.sü olarak mezun oldum. Şu anda Bilkent Üniversitesi'nde yüksek lisans yapıyorum. Bilgisayar grafikleri ve algoritmaların birleştiği sistemleri kurmaktan keyif alıyorum. Görsellikten çok, sezgisel ve anlamlı yapılar kurmaya odaklanıyorum. Öğrendiklerimi paylaşmayı, kavramları sadeleştirerek anlatmayı ve teknik detayların içindeki sadeliği bulmayı seviyorum.",
      experience: {
        title: "Deneyim",
        items: [
          {
            period: "2024 - Devam",
            title: "Yüksek Lisans Öğrencisi",
            company: "Bilkent Üniversitesi",
            description: "Bilgisayar grafikleri ve yapay zeka üzerine araştırma"
          },
          {
            period: "2019 - 2024",
            title: "Lisans Öğrencisi",
            company: "Hacettepe Üniversitesi",
            description: "Bilgisayar Mühendisliği bölüm 3.sü olarak mezun oldum. Algoritmalar, grafikler ve sistem tasarımı konularında sağlam bir altyapı edindim."
          }
        ]
      },
      interests: {
        title: "İlgi Alanlarım",
        items: ["🧠 Algoritmalar", "🕹️ Oyun Sistemleri", "📚 Öğretmek", "🎧 Lo-fi müzik", "🧩 Geometrik Problemler"]
      }
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
    intro: "Graphics • AI • Algorithms • Teaching • Problem Solving",
    nav: {
      home: "Home",
      about: "About",
      projects: "Projects",
      contact: "Contact"
    },
    about: {
      title: "About Me",
      subtitle: "Get to know who I am and what I do",
      text: "I graduated from Hacettepe University as the 3rd in my department in 2024, and I'm currently a master's student at Bilkent University. I'm passionate about building systems at the intersection of computer graphics and algorithms. Rather than visual design or modeling, I focus on structure, intuition, and problem-solving. I enjoy teaching what I learn and designing solutions that feel logical and purposeful.",
      experience: {
        title: "Experience",
        items: [
          {
            period: "2024 - Present",
            title: "Graduate Student",
            company: "Bilkent University",
            description: "Research in computer graphics and artificial intelligence"
          },
          {
            period: "2019 - 2024",
            title: "Undergraduate Student",
            company: "Hacettepe University",
            description: "Graduated as the 3rd in Computer Engineering. Built strong foundations in algorithms, graphics, and system design."
          }
        ]
      },
      interests: {
        title: "My Interests",
        items: ["🧠 Algorithms", "🕹️ Game Systems", "📚 Teaching", "🎧 Lo-fi Music", "🧩 Geometric Problems"]
      }
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

        <Projects isDark={isDark} t={t} isTurkish={isTurkish} />

        <Contact isDark={isDark} t={t} />

      </main>
    </div>
  )
}

export default App