// The battle on the page: drawing, order buttons and the red commander's Q-values.
import {
  createBattle,
  step,
  setOrder,
  observe,
  aliveCount,
  ORDERS,
  DT,
  DECISION,
  W,
  H,
  INF,
  STATS,
} from './sim.js'
import table from './qtable.json'

const LABELS = { advance: 'Advance', hold: 'Hold', charge: 'Charge', flank: 'Flank', fallback: 'Fall back' }
const PAL = {
  margin: '#f2f3ee',
  paper: '#e7ebde',
  grid: 'rgba(29, 35, 32, 0.075)',
  ink: '#1d2320',
  muted: '#545e57',
  blue: '#1c4f9c',
  blueFill: '#d2ddf0',
  red: '#a82c25',
  redFill: '#f2d8d4',
}
const LETTERS = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'
const SQUARE = 10 // field units per lettered grid square
const ARMY_SIZE = 10

const qRow = (s) => table.rows[s] || [0, 0, 0, 0, 0]
function best(row) {
  let b = 0
  for (let a = 1; a < row.length; a++) if (row[a] > row[b]) b = a
  return b
}
const clock = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`

export function startBattle(el) {
  const ctx = el.canvas.getContext('2d')
  let b = null
  let started = false
  let running = false
  let acc = 0
  let last = 0
  let nextDecision = 0
  let visible = true
  let Wp = 0
  let Hp = 0
  let dpr = 1
  let s = 1
  let m = 20
  let ox = 0
  let oy = 0
  let frameLayer = null

  const X = (x) => ox + x * s
  const Y = (y) => oy + y * s

  // ---- the red commander ----
  function decideRed(apply) {
    const row = qRow(observe(b, 1))
    const choice = best(row)
    if (apply) setOrder(b, 1, ORDERS[choice])
    const scale = Math.max(1, ...row.map(Math.abs))
    el.qItems.forEach((li, i) => {
      const w = 50 + 50 * Math.max(-1, Math.min(1, row[i] / scale))
      li.querySelector('i').style.width = `${w}%`
      li.querySelector('.qv').textContent = row[i].toFixed(2).replace('-', '−')
      li.classList.toggle('chosen', apply && i === choice)
    })
  }

  // ---- drawing ----
  function layout() {
    const r = el.canvas.getBoundingClientRect()
    Wp = Math.round(r.width)
    Hp = Math.round(r.height)
    if (!Wp || !Hp) return false
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    el.canvas.width = Math.round(Wp * dpr)
    el.canvas.height = Math.round(Hp * dpr)
    m = Wp < 640 ? 14 : 20
    s = Math.min((Wp - 2 * m) / W, (Hp - 2 * m) / H)
    ox = (Wp - W * s) / 2
    oy = (Hp - H * s) / 2
    frameLayer = paintFrame()
    return true
  }

  function paintFrame() {
    const c = document.createElement('canvas')
    c.width = Math.round(Wp * dpr)
    c.height = Math.round(Hp * dpr)
    const g = c.getContext('2d')
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    const fx = Math.round(X(0) - m)
    const fy = Math.round(Y(0) - m)
    const fw = Math.round(W * s + 2 * m)
    const fh = Math.round(H * s + 2 * m)
    g.fillStyle = PAL.margin
    g.fillRect(fx, fy, fw, fh)
    g.fillStyle = PAL.paper
    g.fillRect(X(0), Y(0), W * s, H * s)
    g.strokeStyle = PAL.grid
    g.lineWidth = 1
    g.beginPath()
    for (let x = SQUARE; x < W; x += SQUARE) {
      const px = Math.round(X(x)) + 0.5
      g.moveTo(px, Y(0))
      g.lineTo(px, Y(H))
    }
    for (let y = SQUARE; y < H; y += SQUARE) {
      const py = Math.round(Y(y)) + 0.5
      g.moveTo(X(0), py)
      g.lineTo(X(W), py)
    }
    g.stroke()
    g.strokeStyle = PAL.ink
    g.lineWidth = 1
    g.strokeRect(Math.round(X(0)) - 0.5, Math.round(Y(0)) - 0.5, Math.round(W * s) + 1, Math.round(H * s) + 1)
    g.lineWidth = 1.5
    g.strokeRect(fx + 0.75, fy + 0.75, fw - 1.5, fh - 1.5)
    g.font = `500 ${Wp < 640 ? 9 : 11}px "Barlow Condensed", "Arial Narrow", sans-serif`
    g.fillStyle = PAL.muted
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    for (let n = 0; n * SQUARE < W; n++) {
      const x = X(n * SQUARE + SQUARE / 2)
      g.fillText(LETTERS[n], x, Y(0) - m / 2)
      g.fillText(LETTERS[n], x, Y(H) + m / 2)
    }
    for (let n = 0; n * SQUARE < H; n++) {
      const y = Y(n * SQUARE + SQUARE / 2)
      g.fillText(String(n + 1), X(0) - m / 2, y)
      g.fillText(String(n + 1), X(W) + m / 2, y)
    }
    return c
  }

  function centroid(side) {
    let x = 0
    let y = 0
    let n = 0
    let front = side === 0 ? -Infinity : Infinity
    let back = side === 0 ? Infinity : -Infinity
    for (const u of b.units) {
      if (!u.alive || u.side !== side) continue
      x += u.x
      y += u.y
      n++
      front = side === 0 ? Math.max(front, u.x) : Math.min(front, u.x)
      back = side === 0 ? Math.min(back, u.x) : Math.max(back, u.x)
    }
    return n ? { x: x / n, y: y / n, front, back } : null
  }

  function arrow(x0, y0, cx, cy, x1, y1, width, dashed) {
    ctx.lineWidth = width
    ctx.setLineDash(dashed ? [6, 5] : [])
    ctx.beginPath()
    ctx.moveTo(X(x0), Y(y0))
    ctx.quadraticCurveTo(X(cx), Y(cy), X(x1), Y(y1))
    ctx.stroke()
    ctx.setLineDash([])
    const a = Math.atan2(Y(y1) - Y(cy), X(x1) - X(cx))
    const h = 5 + width * 2
    ctx.beginPath()
    ctx.moveTo(X(x1) + Math.cos(a) * h * 0.6, Y(y1) + Math.sin(a) * h * 0.6)
    ctx.lineTo(X(x1) + Math.cos(a + 2.5) * h, Y(y1) + Math.sin(a + 2.5) * h)
    ctx.lineTo(X(x1) + Math.cos(a - 2.5) * h, Y(y1) + Math.sin(a - 2.5) * h)
    ctx.closePath()
    ctx.fill()
  }

  // Each side's current order, drawn the way a battle map would
  function drawOrder(side) {
    const c = centroid(side)
    const e = centroid(1 - side)
    if (!c || !e) return
    const dir = side === 0 ? 1 : -1
    const col = side === 0 ? PAL.blue : PAL.red
    ctx.save()
    ctx.globalAlpha = 0.5
    ctx.strokeStyle = col
    ctx.fillStyle = col
    const order = b.orders[side]
    const x0 = c.front + dir * 2.5
    if (order === 'advance' || order === 'charge') {
      const reach = Math.min(order === 'charge' ? 14 : 10, Math.abs(e.front - x0) - 2)
      if (reach > 2) {
        const x1 = x0 + dir * reach
        const y1 = c.y + (e.y - c.y) * 0.3
        arrow(x0, c.y, (x0 + x1) / 2, c.y, x1, y1, order === 'charge' ? 3 : 2, order === 'advance')
      }
    } else if (order === 'hold') {
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(X(x0), Y(c.y - 9))
      ctx.lineTo(X(x0), Y(c.y + 9))
      for (let y = c.y - 9; y <= c.y + 9.01; y += 3) {
        ctx.moveTo(X(x0), Y(y))
        ctx.lineTo(X(x0 + dir * 1.2), Y(y))
      }
      ctx.stroke()
    } else if (order === 'flank') {
      for (const lane of [7, H - 7]) {
        const x1 = e.back - dir * 1
        arrow(x0, c.y + (lane < H / 2 ? -3 : 3), (x0 + x1) / 2, lane, x1, lane + (lane < H / 2 ? 4 : -4), 2, false)
      }
    } else if (order === 'fallback') {
      const xb = c.back - dir * 2
      arrow(xb, c.y, xb - dir * 5, c.y, xb - dir * 10, c.y, 2, false)
    }
    ctx.restore()
  }

  function drawUnit(u, x, y, size) {
    const col = u.side === 0 ? PAL.blue : PAL.red
    const w = size
    const h = size * 0.7
    const r = size * 0.62
    ctx.lineWidth = 1.3
    ctx.beginPath()
    if (u.side === 0) ctx.rect(x - w / 2, y - h / 2, w, h)
    else {
      ctx.moveTo(x, y - r)
      ctx.lineTo(x + r, y)
      ctx.lineTo(x, y + r)
      ctx.lineTo(x - r, y)
      ctx.closePath()
    }
    ctx.fillStyle = u.side === 0 ? PAL.blueFill : PAL.redFill
    ctx.fill()
    ctx.strokeStyle = col
    ctx.stroke()
    if (u.kind === INF) {
      ctx.lineWidth = 1
      ctx.beginPath()
      if (u.side === 0) {
        ctx.moveTo(x - w / 2, y - h / 2)
        ctx.lineTo(x + w / 2, y + h / 2)
        ctx.moveTo(x + w / 2, y - h / 2)
        ctx.lineTo(x - w / 2, y + h / 2)
      } else {
        const q = r * 0.5
        ctx.moveTo(x - q, y - q)
        ctx.lineTo(x + q, y + q)
        ctx.moveTo(x + q, y - q)
        ctx.lineTo(x - q, y + q)
      }
      ctx.stroke()
    } else {
      ctx.beginPath()
      ctx.arc(x, y, Math.max(1.6, size * 0.15), 0, 2 * Math.PI)
      ctx.fillStyle = col
      ctx.fill()
    }
    const frac = u.hp / STATS[u.kind].hp
    if (frac < 0.999) {
      const by = y + (u.side === 0 ? h / 2 : r) + 2.5
      ctx.fillStyle = 'rgba(29, 35, 32, 0.18)'
      ctx.fillRect(x - w / 2, by, w, 2.5)
      ctx.fillStyle = col
      ctx.fillRect(x - w / 2, by, w * frac, 2.5)
    }
  }

  function draw(alpha) {
    if (!frameLayer) return
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.drawImage(frameLayer, 0, 0, Wp, Hp)
    const size = Math.max(9, Math.min(17, s * 2.3))

    // Fallen units stay on the map as small crosses
    ctx.strokeStyle = 'rgba(84, 94, 87, 0.45)'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    for (const u of b.units) {
      if (u.alive) continue
      const x = X(u.x)
      const y = Y(u.y)
      const q = size * 0.28
      ctx.moveTo(x - q, y - q)
      ctx.lineTo(x + q, y + q)
      ctx.moveTo(x + q, y - q)
      ctx.lineTo(x - q, y + q)
    }
    ctx.stroke()

    if (started) {
      drawOrder(0)
      drawOrder(1)
    }

    ctx.strokeStyle = 'rgba(29, 35, 32, 0.75)'
    ctx.lineWidth = 1.2
    ctx.beginPath()
    for (const a of b.arrows) {
      const p = Math.min(1, (a.t + alpha * DT) / a.tf)
      const dx = a.x1 - a.x0
      const dy = a.y1 - a.y0
      const len = Math.hypot(dx, dy) || 1
      const x = a.x0 + dx * p
      const y = a.y0 + dy * p
      ctx.moveTo(X(x - (dx / len) * 1.3), Y(y - (dy / len) * 1.3))
      ctx.lineTo(X(x), Y(y))
    }
    ctx.stroke()

    const alive = b.units.filter((u) => u.alive)
    alive.sort((p, q) => p.y - q.y)
    for (const u of alive) {
      drawUnit(u, X(u.px + (u.x - u.px) * alpha), Y(u.py + (u.y - u.py) * alpha), size)
    }
  }

  // ---- game flow ----
  function updateStatus() {
    el.blueCount.textContent = aliveCount(b, 0)
    el.redCount.textContent = aliveCount(b, 1)
    el.clock.textContent = clock(b.t)
  }

  function updateButtons() {
    for (const btn of el.buttons) {
      btn.setAttribute('aria-pressed', String(started && btn.dataset.order === b.orders[0]))
    }
  }

  function finish() {
    running = false
    const lostBlue = ARMY_SIZE - aliveCount(b, 0)
    const lostRed = ARMY_SIZE - aliveCount(b, 1)
    const title = b.winner === 0 ? 'Victory' : b.winner === 1 ? 'Defeat' : 'Draw'
    el.resultTitle.textContent = title
    el.resultDetail.textContent = `You lost ${lostBlue} of ${ARMY_SIZE}, red lost ${lostRed} of ${ARMY_SIZE}, in ${clock(b.t)}.`
    el.result.hidden = false
    el.hint.textContent = ''
    el.live.textContent = `${title}. ${el.resultDetail.textContent}`
  }

  function tick(now) {
    if (!running) return
    const dt = Math.min(0.1, (now - last) / 1000)
    last = now
    acc += dt
    let n = 0
    while (acc >= DT && n < 8 && !b.over) {
      step(b)
      acc -= DT
      n++
      if (b.t + 1e-9 >= nextDecision && !b.over) {
        nextDecision += DECISION
        decideRed(true)
      }
    }
    updateStatus()
    draw(b.over ? 1 : acc / DT)
    if (b.over) finish()
    else requestAnimationFrame(tick)
  }

  function order(name) {
    if (!b || b.over) return
    setOrder(b, 0, name)
    if (!started) {
      started = true
      decideRed(true)
      nextDecision = b.t + DECISION
      el.hint.textContent = 'Red answers every second.'
      running = true
      last = performance.now()
      requestAnimationFrame(tick)
    }
    updateButtons()
  }

  function reset() {
    b = createBattle((Math.random() * 2 ** 32) >>> 0)
    started = false
    running = false
    acc = 0
    el.result.hidden = true
    el.hint.textContent = 'Give an order to start the battle.'
    decideRed(false)
    updateButtons()
    updateStatus()
    draw(1)
  }

  if (el.episodes) el.episodes.textContent = table.episodes.toLocaleString('en-US')
  for (const btn of el.buttons) btn.addEventListener('click', () => order(btn.dataset.order))
  el.again.addEventListener('click', reset)
  document.addEventListener('keydown', (e) => {
    if (!visible || e.ctrlKey || e.metaKey || e.altKey) return
    const t = e.target
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return
    const k = Number(e.key)
    if (k >= 1 && k <= ORDERS.length) {
      e.preventDefault()
      order(ORDERS[k - 1])
    }
  })
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting
  }).observe(el.canvas)
  new ResizeObserver(() => {
    if (layout() && b) draw(1)
  }).observe(el.canvas)

  reset()
}
