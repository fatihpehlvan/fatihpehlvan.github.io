import '@fontsource/spectral/400.css'
import '@fontsource/spectral/600.css'
import '@fontsource/barlow-condensed/500.css'
import '@fontsource/barlow-condensed/600.css'
import './style.css'
import { startBattle } from './battle/game.js'

const canvas = document.getElementById('field')

if (canvas) {
  const $ = (sel) => document.querySelector(sel)
  const begin = () =>
    startBattle({
      canvas,
      buttons: [...document.querySelectorAll('.orders button')],
      qItems: [...document.querySelectorAll('.q li')],
      blueCount: $('#blue-count'),
      redCount: $('#red-count'),
      clock: $('#battle-clock'),
      hint: $('#battle-hint'),
      result: $('.result'),
      resultTitle: $('.result-title'),
      resultDetail: $('.result-detail'),
      again: $('.again'),
      live: $('#battle-live'),
      episodes: $('#episodes'),
    })
  // The map draws its grid letters in Barlow Condensed, so wait briefly for the fonts
  const fonts = document.fonts ? document.fonts.ready : Promise.resolve()
  Promise.race([fonts, new Promise((resolve) => setTimeout(resolve, 900))]).then(begin)
}
