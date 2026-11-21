import '@fontsource/spectral/400.css'
import '@fontsource/spectral/400-italic.css'
import '@fontsource/spectral/600.css'
import '@fontsource/barlow-condensed/500.css'
import '@fontsource/barlow-condensed/600.css'
import './style.css'
import { startMap } from './map.js'

const canvas = document.getElementById('map')

if (canvas) {
  const begin = () =>
    startMap({
      canvas,
      cartouche: document.querySelector('.cartouche'),
      objectiveOut: document.getElementById('obj-ref'),
      live: document.getElementById('map-live'),
    })
  // The map draws its labels in Barlow Condensed, so wait briefly for the fonts
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve()
  Promise.race([fonts, new Promise((resolve) => setTimeout(resolve, 900))]).then(begin)
}
