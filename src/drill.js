// A small tactical map: ten units and a commander that change formation on each order.
// The units march in once when the page loads; after that they only move when clicked.

const SOLDIERS = 10
const UP = -Math.PI / 2
const NAMES = ['Line', 'Wedge', 'Column', 'Two ranks', 'Circle']
const BLUE = '#2e5b8a'
const INK = '#1d2433'
const GRID = 'rgba(29, 36, 51, 0.07)'

function formation(kind, w, h) {
  const s = Math.min(w / 260, h / 180)
  const cx = w / 2
  const cy = h / 2
  const pts = []

  if (kind === 0) {
    // One rank across the map, commander behind the middle
    const gap = 21 * s
    for (let i = 0; i < SOLDIERS; i++) pts.push({ x: cx + (i - (SOLDIERS - 1) / 2) * gap, y: cy - 6 * s, a: UP })
    pts.push({ x: cx, y: cy + 26 * s, a: UP })
  } else if (kind === 1) {
    // Wedge pointing forward, commander inside it
    const dx = 15 * s
    const dy = 15 * s
    const top = cy - 40 * s
    pts.push({ x: cx, y: top, a: UP })
    for (let k = 1; k < SOLDIERS; k++) {
      const r = Math.ceil(k / 2)
      const side = k % 2 ? -1 : 1
      pts.push({ x: cx + side * r * dx, y: top + r * dy, a: UP })
    }
    pts.push({ x: cx, y: top + 3 * dy, a: UP })
  } else if (kind === 2) {
    // Two files, commander at the head
    const dx = 10 * s
    const dy = 16 * s
    const top = cy - 36 * s
    for (let i = 0; i < SOLDIERS; i++) {
      const row = Math.floor(i / 2)
      pts.push({ x: cx + (i % 2 ? dx : -dx), y: top + 18 * s + row * dy, a: UP })
    }
    pts.push({ x: cx, y: top - 4 * s, a: UP })
  } else if (kind === 3) {
    // Two ranks of five
    const gap = 22 * s
    for (let i = 0; i < SOLDIERS; i++) {
      const row = Math.floor(i / 5)
      pts.push({ x: cx + ((i % 5) - 2) * gap, y: cy - 14 * s + row * 20 * s, a: UP })
    }
    pts.push({ x: cx, y: cy + 38 * s, a: UP })
  } else {
    // Circle facing outward, commander in the middle
    const r = 46 * s
    for (let i = 0; i < SOLDIERS; i++) {
      const t = UP + (i / SOLDIERS) * Math.PI * 2
      pts.push({ x: cx + Math.cos(t) * r, y: cy + Math.sin(t) * r, a: t })
    }
    pts.push({ x: cx, y: cy, a: UP })
  }
  return pts
}

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

function lerpAngle(a, b, t) {
  let d = b - a
  while (d > Math.PI) d -= 2 * Math.PI
  while (d < -Math.PI) d += 2 * Math.PI
  return a + d * t
}

// Small seeded generator so the opening scatter looks the same on every visit
function seeded(seed) {
  let x = seed
  return () => {
    x = (x * 1664525 + 1013904223) % 4294967296
    return x / 4294967296
  }
}

export function startDrill(canvas, caption) {
  const ctx = canvas.getContext('2d')
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  let w = 0
  let h = 0
  let dpr = 1
  let current = 0
  let running = false
  const units = []

  function resize() {
    const rect = canvas.getBoundingClientRect()
    w = rect.width
    h = rect.height
    dpr = window.devicePixelRatio || 1
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    const step = 20 * Math.min(w / 260, h / 180)
    ctx.strokeStyle = GRID
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let x = step; x < w; x += step) {
      ctx.moveTo(Math.round(x) + 0.5, 0)
      ctx.lineTo(Math.round(x) + 0.5, h)
    }
    for (let y = step; y < h; y += step) {
      ctx.moveTo(0, Math.round(y) + 0.5)
      ctx.lineTo(w, Math.round(y) + 0.5)
    }
    ctx.stroke()

    units.forEach((u, i) => {
      const commander = i === SOLDIERS
      const r = commander ? 5 : 4
      const color = commander ? INK : BLUE
      ctx.fillStyle = color
      ctx.strokeStyle = color
      ctx.lineWidth = 1.6
      ctx.beginPath()
      ctx.arc(u.x, u.y, r, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(u.x + Math.cos(u.a) * r, u.y + Math.sin(u.a) * r)
      ctx.lineTo(u.x + Math.cos(u.a) * (r + 6), u.y + Math.sin(u.a) * (r + 6))
      ctx.stroke()
    })
  }

  function frame(now) {
    let moving = false
    units.forEach((u) => {
      if (!u.move) return
      const m = u.move
      const p = Math.min(1, Math.max(0, (now - m.start) / m.dur))
      if (p < 1) moving = true
      const e = easeInOut(p)
      u.x = m.fx + (m.tx - m.fx) * e
      u.y = m.fy + (m.ty - m.fy) * e
      if (m.dist < 2) u.a = lerpAngle(m.fa, m.ta, e)
      else if (p < 0.15) u.a = lerpAngle(m.fa, m.heading, p / 0.15)
      else if (p > 0.85) u.a = lerpAngle(m.heading, m.ta, (p - 0.85) / 0.15)
      else u.a = m.heading
      if (p >= 1) u.move = null
    })
    draw()
    if (moving) requestAnimationFrame(frame)
    else running = false
  }

  function order(kind, dur, stagger) {
    const targets = formation(kind, w, h)
    const now = performance.now()
    units.forEach((u, i) => {
      const t = targets[i]
      if (reduceMotion || dur === 0) {
        u.x = t.x
        u.y = t.y
        u.a = t.a
        u.move = null
        return
      }
      const dx = t.x - u.x
      const dy = t.y - u.y
      u.move = {
        fx: u.x,
        fy: u.y,
        fa: u.a,
        tx: t.x,
        ty: t.y,
        ta: t.a,
        dist: Math.hypot(dx, dy),
        heading: Math.atan2(dy, dx),
        start: now + i * stagger,
        dur,
      }
    })
    if (reduceMotion || dur === 0) {
      draw()
    } else if (!running) {
      running = true
      requestAnimationFrame(frame)
    }
  }

  function announce() {
    const name = NAMES[current]
    caption.textContent = `${name}. Click the units for the next order.`
    canvas.setAttribute(
      'aria-label',
      `Eleven units on a map in ${name.toLowerCase()} formation. Press to give them the next formation.`,
    )
  }

  function next() {
    current = (current + 1) % NAMES.length
    announce()
    order(current, 900, 30)
  }

  resize()
  const rand = seeded(7)
  for (let i = 0; i <= SOLDIERS; i++) {
    units.push({ x: w * (0.1 + 0.8 * rand()), y: h * (0.55 + 0.4 * rand()), a: rand() * Math.PI * 2, move: null })
  }
  announce()
  order(current, 1400, 45)
  draw()

  canvas.addEventListener('click', next)
  canvas.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      next()
    }
  })

  new ResizeObserver(() => {
    const oldW = w
    const oldH = h
    resize()
    if (Math.abs(oldW - w) < 0.5 && Math.abs(oldH - h) < 0.5) {
      draw()
      return
    }
    order(current, 0, 0)
  }).observe(canvas)
}
