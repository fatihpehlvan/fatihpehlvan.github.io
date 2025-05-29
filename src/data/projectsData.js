export const getCategories = (isTurkish) => [
  {
    id: 'ml',
    title: isTurkish ? 'Makine Öğrenmesi & AI' : 'Machine Learning & AI',
    desc: isTurkish ? 'Yapay zeka ve makine öğrenmesi projeleri' : 'Artificial intelligence and machine learning projects',
    icon: '🤖',
    color: 'from-blue-500 to-purple-500'
  },
  {
    id: 'graphics',
    title: isTurkish ? 'Bilgisayar Grafikleri' : 'Computer Graphics',
    desc: isTurkish ? 'WebGL, Three.js ve görsel programlama projeleri' : 'WebGL, Three.js and visual programming projects',
    icon: '🎨',
    color: 'from-green-500 to-teal-500'
  }
]

export const getProjectsByCategory = (isTurkish) => ({
  ml: [
    {
      title: 'AI Art Generator',
      desc: isTurkish 
        ? 'Stable Diffusion kullanarak makine öğrenmesi algoritmaları ile güzel sanat eserleri üretme.'
        : 'Generate beautiful artwork using machine learning algorithms with Stable Diffusion.',
      code: 'https://github.com/fatihpehlivan/ai-art',
      run: 'https://fatihpehlivan.github.io/ai-art',
      icon: '🎨'
    },
    {
      title: isTurkish ? 'Sinir Ağı Stil Transferi' : 'Neural Style Transfer',
      desc: isTurkish
        ? 'Derin sinir ağlarını kullanarak görüntüler arasında sanatsal stil transferi.'
        : 'Transfer artistic styles between images using deep neural networks.',
      code: 'https://github.com/fatihpehlivan/neural-style',
      run: null,
      icon: '🖼️'
    },
    {
      title: isTurkish ? 'Metin Sınıflandırma Modeli' : 'Text Classification Model',
      desc: isTurkish
        ? 'Transformerlar kullanarak metin sınıflandırması için doğal dil işleme modeli.'
        : 'Natural language processing model for text classification using transformers.',
      code: 'https://github.com/fatihpehlvan/text-classifier',
      run: 'https://fatihpehlivan.github.io/text-classifier',
      icon: '📝'
    }
  ],
  graphics: [
    {
      title: 'Voronoi Visualizer',
      desc: isTurkish
        ? 'Özel tarama mantığı kullanarak Voronoi diyagramlarının görsel simülasyonu.'
        : 'A visual simulation of Voronoi diagrams using custom sweep logic.',
      code: 'https://github.com/fatihpehlivan/voronoi',
      run: 'https://fatihpehlivan.github.io/voronoi',
      icon: '🔷'
    },
    {
      title: isTurkish ? 'Gölge Haritalama Demosu' : 'Shadow Mapping Demo',
      desc: isTurkish
        ? '3D rendering için WebGL ve Babylon.js ile gerçek zamanlı gölgeler.'
        : 'Real-time shadows with WebGL & Babylon.js for 3D rendering.',
      code: 'https://github.com/fatihpehlivan/shadow-demo',
      run: null,
      icon: '🌗'
    },
    {
      title: isTurkish ? 'Parçacık Sistemi' : 'Particle System',
      desc: isTurkish
        ? 'Three.js kullanarak fizik simülasyonu ile interaktif parçacık sistemi.'
        : 'Interactive particle system with physics simulation using Three.js.',
      code: 'https://github.com/fatihpehlivan/particles',
      run: 'https://fatihpehlivan.github.io/particles',
      icon: '✨'
    }
  ]
})

export const getBackButtonText = (isTurkish) => 
  isTurkish ? 'Geri Dön' : 'Back'