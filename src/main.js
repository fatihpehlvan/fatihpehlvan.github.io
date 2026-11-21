import '@fontsource/spectral/400.css'
import '@fontsource/spectral/600.css'
import '@fontsource/barlow-condensed/500.css'
import '@fontsource/barlow-condensed/600.css'
import './style.css'
import { startDrill } from './drill.js'

const canvas = document.getElementById('drill')
const caption = document.getElementById('drill-caption')
if (canvas && caption) startDrill(canvas, caption)
