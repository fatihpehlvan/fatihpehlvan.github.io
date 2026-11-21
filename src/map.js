// The header map. Contour lines are the value function V(s) of the objective: the negative
// cost of reaching it from each cell. The blue squad takes the greedy action at every step.
// Click or use the arrow keys to move the objective; the value spreads out again from there.

const PAL = {
  margin: '#f2f3ee',
  paper: '#e7ebde',
  grid: 'rgba(29, 35, 32, 0.075)',
  ink: '#1d2320',
  muted: '#545e57',
  contour: 'rgba(138, 90, 51, 0.5)',
  contourIndex: 'rgba(112, 68, 33, 0.88)',
  label: '#6f421c',
  waterFill: '#b5cadb',
  waterEdge: '#4a77a0',
  woods: '#bfd1b1',
  tree: '#5c7b4f',
  building: '#2a2f2b',
  blue: '#1c4f9c',
  blueFill: '#d2ddf0',
  red: '#a82c25',
}
const TINT = [168, 120, 66]
const TINT_ALPHA = [0.2, 0.13, 0.08, 0.045]

const PASS = 0
const WATER = 1
const BRIDGE = 2
const BUILDING = 3
const RESERVED = 4

const WOODS_COST = 2.5
const STEP = 4 // contour interval, in steps
const INDEX = 5 // every fifth contour is heavier and labelled
const GRID = 6 // cells per lettered grid square
const LETTERS = 'ABCDEFGHJKLMNOPQRSTUVWXYZ'
const SPEED = 11 // cells per second on open ground
const REVEAL = 1.6 // seconds for the value to spread over the whole map
const START = [0.2, 0.17]
const OBJECTIVE = [0.84, 0.3]
// Wedge facing east, leader in front
const FORMATION = [
  [0, 0],
  [-1.6, -1.2],
  [-1.6, 1.2],
  [-3.2, -2.4],
  [-3.2, 2.4],
  [-4.8, -1.2],
  [-4.8, 1.2],
]
const DIRS = [
  [1, 0, 1],
  [-1, 0, 1],
  [0, 1, 1],
  [0, -1, 1],
  [1, 1, Math.SQRT2],
  [1, -1, Math.SQRT2],
  [-1, 1, Math.SQRT2],
  [-1, -1, Math.SQRT2],
]
// Marching squares: corners above the level are tl=8, tr=4, br=2, bl=1.
// Edges are 0 top, 1 right, 2 bottom, 3 left. Saddles (5, 10) are resolved with the centre.
const CASES = {
  1: [[3, 2]],
  2: [[2, 1]],
  3: [[3, 1]],
  4: [[0, 1]],
  6: [[0, 2]],
  7: [[0, 3]],
  8: [[0, 3]],
  9: [[0, 2]],
  11: [[0, 1]],
  12: [[3, 1]],
  13: [[1, 2]],
  14: [[3, 2]],
}

function mulberry32(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

class Heap {
  constructor() {
    this.keys = []
    this.vals = []
    this.lastKey = 0
  }
  get size() {
    return this.keys.length
  }
  push(key, val) {
    const k = this.keys
    const v = this.vals
    let i = k.length
    k.push(key)
    v.push(val)
    while (i > 0) {
      const p = (i - 1) >> 1
      if (k[p] <= key) break
      k[i] = k[p]
      v[i] = v[p]
      i = p
    }
    k[i] = key
    v[i] = val
  }
  pop() {
    const k = this.keys
    const v = this.vals
    const topKey = k[0]
    const topVal = v[0]
    const lastKey = k.pop()
    const lastVal = v.pop()
    const n = k.length
    if (n > 0) {
      let i = 0
      for (;;) {
        let c = 2 * i + 1
        if (c >= n) break
        if (c + 1 < n && k[c + 1] < k[c]) c++
        if (k[c] >= lastKey) break
        k[i] = k[c]
        v[i] = v[c]
        i = c
      }
      k[i] = lastKey
      v[i] = lastVal
    }
    this.lastKey = topKey
    return topVal
  }
}

function chaikin(pts, rounds) {
  for (let k = 0; k < rounds; k++) {
    const out = [pts[0]]
    for (let n = 0; n < pts.length - 1; n++) {
      const [x0, y0] = pts[n]
      const [x1, y1] = pts[n + 1]
      out.push([x0 * 0.75 + x1 * 0.25, y0 * 0.75 + y1 * 0.25], [x0 * 0.25 + x1 * 0.75, y0 * 0.25 + y1 * 0.75])
    }
    out.push(pts[pts.length - 1])
    pts = out
  }
  return pts
}

export function startMap({ canvas, cartouche, objectiveOut, live }) {
  const ctx = canvas.getContext('2d')
  const still = window.matchMedia('(prefers-reduced-motion: reduce)')

  let W = 0
  let H = 0
  let dpr = 1
  let cs = 14
  let cols = 0
  let rows = 0
  let ox = 0
  let oy = 0
  let N = 0
  let kind, cost, woods, dist, reach, slotDist
  let base, terrain, frame
  let tintCanvas, tintCtx, tintImg, tintA, tintB
  let riverHalf = 1.2
  let bridgeRows = []
  let houses = []
  let goal = -1
  let goalFrac = OBJECTIVE
  let reveal = Infinity
  let dMax = 0
  let units = []
  let running = false
  let lastT = 0
  let introDone = false
  let announceTimer = 0

  const idx = (c, r) => r * cols + c
  const open = (i) => cost[i] < Infinity
  const px = (c) => ox + c * cs
  const py = (r) => oy + r * cs
  const colOf = (i) => i % cols
  const rowOf = (i) => (i - (i % cols)) / cols
  const clampC = (c) => Math.max(0, Math.min(cols - 1, c))
  const clampR = (r) => Math.max(0, Math.min(rows - 1, r))
  const cellOf = (u) => idx(clampC(Math.floor(u.x)), clampR(Math.floor(u.y)))
  const gridRef = (i) => LETTERS[Math.floor(colOf(i) / GRID)] + (Math.floor(rowOf(i) / GRID) + 1)

  function riverX(y) {
    const t = y / rows
    return cols * (0.57 + 0.05 * Math.sin(t * 5.4 + 0.6) + 0.022 * Math.sin(t * 13 + 2))
  }

  function makeTerrain() {
    const rand = mulberry32(1542)
    kind.fill(PASS)
    cost.fill(1)
    woods.fill(0)
    riverHalf = cs < 14 ? 1.0 : 1.25

    for (let r = 0; r < rows; r++) {
      const y = r + 0.5
      const x0 = riverX(y)
      const slope = riverX(y + 0.5) - riverX(y - 0.5)
      const k = Math.sqrt(1 + slope * slope)
      for (let c = 0; c < cols; c++) {
        if (Math.abs(c + 0.5 - x0) / k < riverHalf) {
          const i = idx(c, r)
          kind[i] = WATER
          cost[i] = Infinity
        }
      }
    }

    bridgeRows = [Math.round(rows * 0.26), Math.round(rows * 0.72)]
    for (const b of bridgeRows) {
      for (let r = b; r <= b + 1 && r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = idx(c, r)
          if (kind[i] === WATER) {
            kind[i] = BRIDGE
            cost[i] = 1
          }
        }
      }
    }

    const blobs = [
      [0.31, 0.2, 0.085],
      [0.46, 0.5, 0.07],
      [0.77, 0.63, 0.1],
      [0.9, 0.16, 0.065],
      [0.16, 0.43, 0.06],
      [0.66, 0.9, 0.06],
    ]
    for (const [bx, by, br] of blobs) {
      const cx = bx * cols
      const cy = by * rows
      const rad = Math.max(2.2, Math.min(br * cols, rows * 0.3))
      const p1 = rand() * 6.28
      const p2 = rand() * 6.28
      const r0 = Math.max(0, Math.floor(cy - rad * 1.5))
      const r1 = Math.min(rows, Math.ceil(cy + rad * 1.5))
      const c0 = Math.max(0, Math.floor(cx - rad * 1.5))
      const c1 = Math.min(cols, Math.ceil(cx + rad * 1.5))
      for (let r = r0; r < r1; r++) {
        for (let c = c0; c < c1; c++) {
          const dx = c + 0.5 - cx
          const dy = r + 0.5 - cy
          const a = Math.atan2(dy, dx)
          const edge = rad * (0.82 + 0.16 * Math.sin(3 * a + p1) + 0.1 * Math.sin(5 * a + p2))
          const i = idx(c, r)
          if (Math.hypot(dx, dy) < edge && kind[i] === PASS) {
            woods[i] = 1
            cost[i] = WOODS_COST
          }
        }
      }
    }

    // A village east of the southern bridge
    houses = []
    const vb = bridgeRows[1]
    const vx = riverX(vb + 1) + riverHalf + 3
    const vy = vb - 1.5
    const spots = [
      [0, 0],
      [1.6, 0.3],
      [0.4, 1.8],
      [2.6, 1.7],
      [1.3, -1.6],
      [3.4, -0.2],
      [2.2, 3.4],
    ]
    for (const [hx, hy] of spots) {
      const c = Math.floor(vx + hx)
      const r = Math.floor(vy + hy)
      if (c < 0 || r < 0 || c >= cols || r >= rows) continue
      const i = idx(c, r)
      if (kind[i] !== PASS) continue
      kind[i] = BUILDING
      cost[i] = Infinity
      woods[i] = 0
      houses.push([c, r, rand()])
    }
  }

  // The title block sits on top of the map on wide screens; units never walk under it.
  function reserveCartouche() {
    if (!cartouche || getComputedStyle(cartouche).position !== 'absolute') return
    const cr = canvas.getBoundingClientRect()
    const kr = cartouche.getBoundingClientRect()
    const pad = 0
    const x0 = kr.left - cr.left - pad
    const x1 = kr.right - cr.left + pad
    const y0 = kr.top - cr.top - pad
    const y1 = kr.bottom - cr.top + pad
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = px(c)
        const cy = py(r)
        if (cx + cs > x0 && cx < x1 && cy + cs > y0 && cy < y1) {
          const i = idx(c, r)
          kind[i] = RESERVED
          cost[i] = Infinity
          woods[i] = 0
        }
      }
    }
    houses = houses.filter(([c, r]) => kind[idx(c, r)] === BUILDING)
  }

  function nearestOpen(cx, cy, taken, needReach = true) {
    let best = -1
    let bd = Infinity
    for (let i = 0; i < N; i++) {
      if (!open(i) || (needReach && !reach[i]) || (taken && taken.has(i))) continue
      const d = (colOf(i) + 0.5 - cx) ** 2 + (rowOf(i) + 0.5 - cy) ** 2
      if (d < bd) {
        bd = d
        best = i
      }
    }
    return best
  }

  function canStep(c, r, dc, dr) {
    const c2 = c + dc
    const r2 = r + dr
    if (c2 < 0 || r2 < 0 || c2 >= cols || r2 >= rows) return -1
    const j = idx(c2, r2)
    if (!open(j)) return -1
    if (dc && dr && (!open(idx(c2, r)) || !open(idx(c, r2)))) return -1
    return j
  }

  function findReach() {
    reach.fill(0)
    const s = nearestOpen(START[0] * cols, START[1] * rows, null, false)
    if (s < 0) return
    const queue = [s]
    reach[s] = 1
    while (queue.length) {
      const i = queue.pop()
      const c = colOf(i)
      const r = rowOf(i)
      for (const [dc, dr] of DIRS) {
        const j = canStep(c, r, dc, dr)
        if (j >= 0 && !reach[j]) {
          reach[j] = 1
          queue.push(j)
        }
      }
    }
  }

  // Shortest path cost to `src` with 8-way moves. For the objective this is -V(s).
  function dijkstra(src, out) {
    out.fill(Infinity)
    let far = 0
    if (src < 0) return far
    const heap = new Heap()
    out[src] = 0
    heap.push(0, src)
    while (heap.size) {
      const i = heap.pop()
      const d = heap.lastKey
      if (d > out[i]) continue
      if (d > far) far = d
      const c = colOf(i)
      const r = rowOf(i)
      for (const [dc, dr, len] of DIRS) {
        const j = canStep(c, r, dc, dr)
        if (j < 0) continue
        const nd = d + (len * (cost[i] + cost[j])) / 2
        if (nd < out[j]) {
          out[j] = nd
          heap.push(nd, j)
        }
      }
    }
    return far
  }

  function solve() {
    dMax = dijkstra(goal, dist)
  }

  // The greedy action: step to the neighbour with the best one-step lookahead
  function greedy(i, field = dist) {
    const c = colOf(i)
    const r = rowOf(i)
    let best = -1
    let bq = Infinity
    for (const [dc, dr, len] of DIRS) {
      const j = canStep(c, r, dc, dr)
      if (j < 0 || !(field[j] < field[i])) continue
      const q = field[j] + (len * (cost[i] + cost[j])) / 2
      if (q < bq) {
        bq = q
        best = j
      }
    }
    return best
  }

  function placeSquad() {
    const taken = new Set()
    units = FORMATION.map(([fx, fy], n) => {
      const i = nearestOpen(START[0] * cols + fx, START[1] * rows + fy, taken)
      taken.add(i)
      return { x: colOf(i) + 0.5, y: rowOf(i) + 0.5, tx: null, ty: null, slot: -1, lead: n === 0 }
    })
  }

  // Holding positions: the closest cells around the objective that are two cells apart
  function assignSlots() {
    const gc = colOf(goal)
    const gr = rowOf(goal)
    const cand = []
    for (let r = gr - 7; r <= gr + 7; r++) {
      for (let c = gc - 7; c <= gc + 7; c++) {
        if (c < 0 || r < 0 || c >= cols || r >= rows) continue
        const j = idx(c, r)
        if (j === goal || !open(j) || !reach[j]) continue
        if (dist[j] < 1.8 || dist[j] > 9) continue
        cand.push(j)
      }
    }
    cand.sort((a, b) => dist[a] - dist[b])
    const slots = []
    for (const gap of [2, 1]) {
      for (const j of cand) {
        if (slots.length >= units.length) break
        if (slots.includes(j)) continue
        const near = slots.some(
          (k) => Math.max(Math.abs(colOf(k) - colOf(j)), Math.abs(rowOf(k) - rowOf(j))) < gap,
        )
        if (!near) slots.push(j)
      }
    }
    for (const u of units) u.slot = -1
    const order = units.map((_, n) => n).sort((a, b) => dist[cellOf(units[a])] - dist[cellOf(units[b])])
    for (const n of order) {
      const u = units[n]
      let bi = -1
      let bd = Infinity
      slots.forEach((j, s) => {
        if (j < 0) return
        const d = (colOf(j) + 0.5 - u.x) ** 2 + (rowOf(j) + 0.5 - u.y) ** 2
        if (d < bd) {
          bd = d
          bi = s
        }
      })
      if (bi >= 0) {
        u.slot = slots[bi]
        slots[bi] = -1
      }
    }
    units.forEach((u, n) => {
      if (u.slot >= 0) dijkstra(u.slot, slotDist[n])
    })
  }

  const nearSlot = (u, n, i) => u.slot >= 0 && slotDist[n][i] <= 7

  function settle() {
    for (const u of units) {
      const j = u.slot >= 0 ? u.slot : goal
      u.x = colOf(j) + 0.5
      u.y = rowOf(j) + 0.5
      u.tx = null
    }
  }

  function stepUnits(dt) {
    let moving = false
    units.forEach((u, n) => {
      let budget = dt
      for (let guard = 0; guard < 4 && budget > 0; guard++) {
        if (u.tx === null) {
          const i = cellOf(u)
          if (!(dist[i] <= reveal)) break // the value has not reached this unit yet
          const j = nearSlot(u, n, i) ? greedy(i, slotDist[n]) : greedy(i)
          if (j < 0) break // holding
          u.tx = colOf(j) + 0.5
          u.ty = rowOf(j) + 0.5
        }
        const dx = u.tx - u.x
        const dy = u.ty - u.y
        const len = Math.hypot(dx, dy)
        const here = cost[cellOf(u)]
        const speed = SPEED / (here < Infinity ? here : 1)
        const can = speed * budget
        moving = true
        if (can >= len) {
          u.x = u.tx
          u.y = u.ty
          u.tx = null
          budget -= len / speed
        } else {
          u.x += (dx / len) * can
          u.y += (dy / len) * can
          budget = 0
        }
      }
    })
    return moving
  }

  function layer() {
    const c = document.createElement('canvas')
    c.width = Math.round(W * dpr)
    c.height = Math.round(H * dpr)
    const g = c.getContext('2d')
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    return [c, g]
  }

  function paintBase() {
    const [c, g] = layer()
    g.fillStyle = PAL.paper
    g.fillRect(ox, oy, cols * cs, rows * cs)
    g.strokeStyle = PAL.grid
    g.lineWidth = 1
    g.beginPath()
    for (let n = GRID; n < cols; n += GRID) {
      const x = Math.round(px(n)) + 0.5
      g.moveTo(x, oy)
      g.lineTo(x, oy + rows * cs)
    }
    for (let n = GRID; n < rows; n += GRID) {
      const y = Math.round(py(n)) + 0.5
      g.moveTo(ox, y)
      g.lineTo(ox + cols * cs, y)
    }
    g.stroke()
    base = c
  }

  function paintTerrain() {
    const [c, g] = layer()
    g.save()
    g.beginPath()
    g.rect(ox, oy, cols * cs, rows * cs)
    g.clip()

    // Woods: a union of discs, laid down slightly transparent so the value tint shows through
    const [wc, wg] = layer()
    wg.fillStyle = PAL.woods
    for (let i = 0; i < N; i++) {
      if (!woods[i]) continue
      wg.beginPath()
      wg.arc(px(colOf(i) + 0.5), py(rowOf(i) + 0.5), cs * 0.78, 0, 2 * Math.PI)
      wg.fill()
    }
    g.globalAlpha = 0.85
    g.drawImage(wc, 0, 0, W, H)
    g.globalAlpha = 1

    const rand = mulberry32(77)
    g.strokeStyle = PAL.tree
    g.lineWidth = 1
    for (let i = 0; i < N; i++) {
      if (!woods[i] || rand() > 0.34) continue
      const x = px(colOf(i) + 0.25 + rand() * 0.5)
      const y = py(rowOf(i) + 0.25 + rand() * 0.5)
      g.beginPath()
      g.arc(x, y, cs * 0.2, 0, 2 * Math.PI)
      g.stroke()
    }

    const line = new Path2D()
    for (let y = -1; y <= rows + 1; y += 0.5) {
      if (y === -1) line.moveTo(px(riverX(y)), py(y))
      else line.lineTo(px(riverX(y)), py(y))
    }
    g.lineCap = 'round'
    g.lineJoin = 'round'
    g.strokeStyle = PAL.waterEdge
    g.lineWidth = riverHalf * 2 * cs + 2
    g.stroke(line)
    g.strokeStyle = PAL.waterFill
    g.lineWidth = riverHalf * 2 * cs - 0.8
    g.stroke(line)

    for (const b of bridgeRows) {
      const yc = py(b + 1)
      const xc = px(riverX(b + 1))
      const half = riverHalf * cs + cs * 0.9
      const hh = cs * 0.8
      g.fillStyle = PAL.paper
      g.fillRect(xc - half, yc - hh, half * 2, hh * 2)
      g.strokeStyle = PAL.ink
      g.lineWidth = 1.3
      g.beginPath()
      g.moveTo(xc - half - 4, yc - hh - 3)
      g.lineTo(xc - half, yc - hh)
      g.lineTo(xc + half, yc - hh)
      g.lineTo(xc + half + 4, yc - hh - 3)
      g.moveTo(xc - half - 4, yc + hh + 3)
      g.lineTo(xc - half, yc + hh)
      g.lineTo(xc + half, yc + hh)
      g.lineTo(xc + half + 4, yc + hh + 3)
      g.stroke()
    }

    g.fillStyle = PAL.building
    for (const [hc, hr, s] of houses) {
      const w = cs * (0.62 + s * 0.25)
      const h = cs * 0.55
      g.fillRect(px(hc + 0.5) - w / 2, py(hr + 0.5) - h / 2, w, h)
    }
    g.restore()
    terrain = c
  }

  function paintFrame() {
    const [c, g] = layer()
    const mw = cols * cs
    const mh = rows * cs
    g.fillStyle = PAL.margin
    g.fillRect(0, 0, W, oy)
    g.fillRect(0, oy + mh, W, H - oy - mh)
    g.fillRect(0, oy, ox, mh)
    g.fillRect(ox + mw, oy, W - ox - mw, mh)
    g.strokeStyle = PAL.ink
    g.lineWidth = 1
    g.strokeRect(ox - 0.5, oy - 0.5, mw + 1, mh + 1)
    g.lineWidth = 1.5
    g.strokeRect(0.75, 0.75, W - 1.5, H - 1.5)

    // Grid references in the margins
    g.font = `500 ${cs < 14 ? 10 : 11}px "Barlow Condensed", "Arial Narrow", sans-serif`
    g.fillStyle = PAL.muted
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    for (let n = 0; n * GRID < cols; n++) {
      const x = px((n * GRID + Math.min(cols, (n + 1) * GRID)) / 2)
      g.fillText(LETTERS[n], x, oy / 2)
      g.fillText(LETTERS[n], x, oy + mh + (H - oy - mh) / 2)
    }
    for (let n = 0; n * GRID < rows; n++) {
      const y = py((n * GRID + Math.min(rows, (n + 1) * GRID)) / 2)
      g.fillText(String(n + 1), ox / 2, y)
      g.fillText(String(n + 1), ox + mw + (W - ox - mw) / 2, y)
    }
    g.beginPath()
    for (let n = GRID; n < cols; n += GRID) {
      const x = Math.round(px(n)) + 0.5
      g.moveTo(x, oy - 4)
      g.lineTo(x, oy)
      g.moveTo(x, oy + mh)
      g.lineTo(x, oy + mh + 4)
    }
    for (let n = GRID; n < rows; n += GRID) {
      const y = Math.round(py(n)) + 0.5
      g.moveTo(ox - 4, y)
      g.lineTo(ox, y)
      g.moveTo(ox + mw, y)
      g.lineTo(ox + mw + 4, y)
    }
    g.strokeStyle = PAL.ink
    g.lineWidth = 1
    g.stroke()

    // Scale bar, in steps
    const segs = cs < 14 ? 1 : 2
    const bw = 5 * cs
    const sx = Math.round(ox + mw - segs * bw - 44)
    const sy = Math.round(oy + mh - 16)
    g.fillStyle = 'rgba(242, 243, 238, 0.9)'
    g.fillRect(sx - 10, sy - 18, segs * bw + 54, 30)
    g.fillStyle = PAL.ink
    g.fillRect(sx, sy, bw, 5)
    g.strokeStyle = PAL.ink
    g.strokeRect(sx + 0.5, sy + 0.5, segs * bw - 1, 4)
    g.textBaseline = 'alphabetic'
    g.fillText('0', sx, sy - 5)
    if (segs === 2) g.fillText('5', sx + bw, sy - 5)
    g.textAlign = 'left'
    g.fillText(`${5 * segs} steps`, sx + segs * bw - 3, sy - 5)
    frame = c
  }

  function drawTint() {
    const data = tintImg.data
    for (let i = 0; i < N; i++) {
      const d = dist[i]
      tintA[i] = open(i) && d <= reveal ? TINT_ALPHA[Math.floor(d / (STEP * INDEX))] || 0 : 0
    }
    // Blocked cells borrow their neighbours' tint, so smoothing leaves no pale rim along the river
    for (let pass = 0; pass < 3; pass++) {
      tintB.set(tintA)
      for (let i = 0; i < N; i++) {
        if (open(i)) continue
        const c = colOf(i)
        const r = rowOf(i)
        let a = 0
        for (const [dc, dr] of DIRS) {
          const c2 = c + dc
          const r2 = r + dr
          if (c2 < 0 || r2 < 0 || c2 >= cols || r2 >= rows) continue
          a = Math.max(a, tintB[idx(c2, r2)])
        }
        tintA[i] = a
      }
    }
    for (let i = 0; i < N; i++) {
      const o = i * 4
      data[o] = TINT[0]
      data[o + 1] = TINT[1]
      data[o + 2] = TINT[2]
      data[o + 3] = Math.round(tintA[i] * 255)
    }
    tintCtx.putImageData(tintImg, 0, 0)
    ctx.imageSmoothingEnabled = true
    ctx.drawImage(tintCanvas, ox, oy, cols * cs, rows * cs)
  }

  function drawContours() {
    const lim = reveal
    const val = (i) => (dist[i] <= lim ? -dist[i] : -lim)
    const normal = new Path2D()
    const heavy = new Path2D()
    const labelSegs = new Map()
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        const a = idx(c, r)
        const b = a + 1
        const e = a + cols + 1
        const f = a + cols
        if (!open(a) || !open(b) || !open(e) || !open(f)) continue
        const va = val(a)
        const vb = val(b)
        const ve = val(e)
        const vf = val(f)
        const hi = Math.max(va, vb, ve, vf)
        const lo = Math.min(va, vb, ve, vf)
        if (hi === lo || !(lo > -Infinity)) continue
        const n0 = Math.max(1, Math.ceil(-hi / STEP))
        const n1 = Math.floor(-lo / STEP)
        const x0 = px(c + 0.5)
        const y0 = py(r + 0.5)
        for (let n = n0; n <= n1; n++) {
          const L = -n * STEP
          if (!(L > -lim)) continue // the value has not settled this far out yet
          const code = (va > L ? 8 : 0) | (vb > L ? 4 : 0) | (ve > L ? 2 : 0) | (vf > L ? 1 : 0)
          if (code === 0 || code === 15) continue
          let pairs = CASES[code]
          if (code === 5 || code === 10) {
            const above = (va + vb + ve + vf) / 4 > L
            pairs =
              (code === 5) === above
                ? [
                    [0, 3],
                    [1, 2],
                  ]
                : [
                    [0, 1],
                    [3, 2],
                  ]
          }
          const pt = (edge) => {
            if (edge === 0) return [x0 + (cs * (L - va)) / (vb - va), y0]
            if (edge === 1) return [x0 + cs, y0 + (cs * (L - vb)) / (ve - vb)]
            if (edge === 2) return [x0 + (cs * (L - vf)) / (ve - vf), y0 + cs]
            return [x0, y0 + (cs * (L - va)) / (vf - va)]
          }
          const isIndex = n % INDEX === 0
          const path = isIndex ? heavy : normal
          for (const [e1, e2] of pairs) {
            const [xa, ya] = pt(e1)
            const [xb, yb] = pt(e2)
            path.moveTo(xa, ya)
            path.lineTo(xb, yb)
            if (isIndex) {
              if (!labelSegs.has(n)) labelSegs.set(n, [])
              labelSegs.get(n).push([xa, ya, xb, yb])
            }
          }
        }
      }
    }
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = PAL.contour
    ctx.lineWidth = 1
    ctx.stroke(normal)
    ctx.strokeStyle = PAL.contourIndex
    ctx.lineWidth = 1.5
    ctx.stroke(heavy)
    drawLabels(labelSegs)
  }

  // Index contours are labelled along a line from the objective towards the middle of the map
  function drawLabels(segs) {
    const gx = px(colOf(goal) + 0.5)
    const gy = py(rowOf(goal) + 0.5)
    let dx = ox + (cols * cs) / 2 - gx
    let dy = oy + rows * cs * 0.6 - gy
    const len = Math.hypot(dx, dy) || 1
    dx /= len
    dy /= len
    ctx.font = `500 ${cs < 14 ? 10 : 11}px "Barlow Condensed", "Arial Narrow", sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    const placed = []
    for (const [n, list] of segs) {
      const want = n * STEP * cs
      const ax = gx + dx * want
      const ay = gy + dy * want
      let best = null
      let bd = (cs * 5) ** 2
      for (const s of list) {
        const d = ((s[0] + s[2]) / 2 - ax) ** 2 + ((s[1] + s[3]) / 2 - ay) ** 2
        if (d < bd) {
          bd = d
          best = s
        }
      }
      if (!best) continue
      const mx = (best[0] + best[2]) / 2
      const my = (best[1] + best[3]) / 2
      if (placed.some(([x, y]) => Math.hypot(x - mx, y - my) < 30)) continue
      if (units.some((u) => Math.hypot(px(u.x) - mx, py(u.y) - my) < cs * 1.6)) continue
      placed.push([mx, my])
      let a = Math.atan2(best[3] - best[1], best[2] - best[0])
      if (a > Math.PI / 2) a -= Math.PI
      if (a < -Math.PI / 2) a += Math.PI
      const text = '−' + n * STEP
      ctx.save()
      ctx.translate(mx, my)
      ctx.rotate(a)
      ctx.lineWidth = 3.5
      ctx.strokeStyle = PAL.paper
      ctx.strokeText(text, 0, 0)
      ctx.fillStyle = PAL.label
      ctx.fillText(text, 0, 0)
      ctx.restore()
    }
  }

  // The leader's planned route: the greedy policy followed to the objective, drawn dashed
  function drawRoute() {
    const lead = units[0]
    if (!lead) return
    let i = cellOf(lead)
    if (!(dist[i] <= reveal) || nearSlot(lead, 0, i)) return
    let pts = [[px(lead.x), py(lead.y)]]
    if (lead.tx !== null) {
      pts.push([px(lead.tx), py(lead.ty)])
      i = idx(clampC(Math.floor(lead.tx)), clampR(Math.floor(lead.ty)))
    }
    for (let n = 0; n < 600 && dist[i] > 2.4; n++) {
      const j = greedy(i)
      if (j < 0) break
      i = j
      pts.push([px(colOf(i) + 0.5), py(rowOf(i) + 0.5)])
    }
    if (pts.length < 4) return
    pts = chaikin(pts, 2)
    const path = new Path2D()
    path.moveTo(pts[0][0], pts[0][1])
    for (let n = 1; n < pts.length; n++) path.lineTo(pts[n][0], pts[n][1])
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = 'rgba(231, 235, 222, 0.85)'
    ctx.lineWidth = 6
    ctx.stroke(path)
    ctx.strokeStyle = PAL.blue
    ctx.lineWidth = 2.2
    ctx.setLineDash([7, 5])
    ctx.stroke(path)
    ctx.setLineDash([])
    const [x1, y1] = pts[pts.length - 1]
    const [x0, y0] = pts[Math.max(0, pts.length - 5)]
    const a = Math.atan2(y1 - y0, x1 - x0)
    const s = 9
    ctx.beginPath()
    ctx.moveTo(x1 + Math.cos(a) * s * 0.7, y1 + Math.sin(a) * s * 0.7)
    ctx.lineTo(x1 + Math.cos(a + 2.5) * s, y1 + Math.sin(a + 2.5) * s)
    ctx.lineTo(x1 + Math.cos(a - 2.5) * s, y1 + Math.sin(a - 2.5) * s)
    ctx.closePath()
    ctx.fillStyle = PAL.blue
    ctx.fill()
  }

  // Friendly infantry, as on a military map: a framed rectangle with a cross.
  // The leader carries the headquarters staff.
  function drawUnit(u) {
    const w = cs * 1.0
    const h = cs * 0.7
    const x0 = px(u.x) - w / 2
    const y0 = py(u.y) - h / 2
    ctx.fillStyle = PAL.blueFill
    ctx.fillRect(x0, y0, w, h)
    ctx.strokeStyle = PAL.blue
    ctx.lineWidth = 1.4
    ctx.strokeRect(x0, y0, w, h)
    ctx.lineWidth = 1.1
    ctx.beginPath()
    ctx.moveTo(x0, y0)
    ctx.lineTo(x0 + w, y0 + h)
    ctx.moveTo(x0 + w, y0)
    ctx.lineTo(x0, y0 + h)
    if (u.lead) {
      ctx.moveTo(x0, y0 + h)
      ctx.lineTo(x0, y0 + h * 1.9)
    }
    ctx.stroke()
  }

  function drawFlag() {
    const x = px(colOf(goal) + 0.5)
    const y = py(rowOf(goal) + 0.5)
    const hgt = cs * 2.1
    ctx.strokeStyle = PAL.ink
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x, y - hgt)
    ctx.stroke()
    ctx.fillStyle = PAL.red
    ctx.beginPath()
    ctx.moveTo(x + 0.75, y - hgt)
    ctx.lineTo(x + cs * 1.35, y - hgt + cs * 0.45)
    ctx.lineTo(x + 0.75, y - hgt + cs * 0.9)
    ctx.closePath()
    ctx.fill()
    ctx.fillStyle = PAL.ink
    ctx.beginPath()
    ctx.arc(x, y, 2.2, 0, 2 * Math.PI)
    ctx.fill()
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, W, H)
    ctx.drawImage(base, 0, 0, W, H)
    if (goal >= 0) drawTint()
    ctx.drawImage(terrain, 0, 0, W, H)
    if (goal >= 0) {
      drawContours()
      drawRoute()
    }
    for (const u of [...units].sort((a, b) => a.y - b.y)) drawUnit(u)
    if (goal >= 0) drawFlag()
    ctx.drawImage(frame, 0, 0, W, H)
  }

  function tick(t) {
    const dt = Math.min(0.05, (t - lastT) / 1000)
    lastT = t
    if (reveal < Infinity) {
      reveal += dt * Math.max(dMax / REVEAL, 30)
      if (reveal > dMax + STEP) reveal = Infinity
    }
    const moving = still.matches ? false : stepUnits(dt)
    draw()
    if (reveal < Infinity || moving) requestAnimationFrame(tick)
    else {
      running = false
      introDone = true
    }
  }

  function run() {
    if (running) return
    running = true
    lastT = performance.now()
    requestAnimationFrame(tick)
  }

  function setGoal(i, animate) {
    if (i < 0) return
    goal = i
    goalFrac = [(colOf(i) + 0.5) / cols, (rowOf(i) + 0.5) / rows]
    solve()
    assignSlots()
    for (const u of units) u.tx = null
    reveal = animate && !still.matches ? 0 : Infinity
    if (objectiveOut) objectiveOut.textContent = gridRef(goal)
    draw()
    run()
  }

  function moveGoal(i) {
    if (i < 0 || i === goal) return
    setGoal(i, true)
    clearTimeout(announceTimer)
    announceTimer = setTimeout(() => {
      if (live) live.textContent = `Objective moved to square ${gridRef(goal)}.`
    }, 500)
  }

  function build() {
    const rect = canvas.getBoundingClientRect()
    const w = Math.round(rect.width)
    const h = Math.round(rect.height)
    if (w < 80 || h < 80) return false
    W = w
    H = h
    dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(W * dpr)
    canvas.height = Math.round(H * dpr)
    const small = W < 640
    const margin = small ? 16 : 22
    cs = small ? 12 : 14
    cols = Math.floor((W - 2 * margin) / cs)
    rows = Math.floor((H - 2 * margin) / cs)
    ox = Math.floor((W - cols * cs) / 2)
    oy = Math.floor((H - rows * cs) / 2)
    N = cols * rows
    kind = new Uint8Array(N)
    cost = new Float32Array(N)
    woods = new Uint8Array(N)
    dist = new Float64Array(N) // float32 would round path costs and break the stale-entry check
    reach = new Uint8Array(N)
    slotDist = FORMATION.map(() => new Float64Array(N))
    makeTerrain()
    reserveCartouche()
    findReach()
    tintCanvas = document.createElement('canvas')
    tintCanvas.width = cols
    tintCanvas.height = rows
    tintCtx = tintCanvas.getContext('2d')
    tintImg = tintCtx.createImageData(cols, rows)
    tintA = new Float32Array(N)
    tintB = new Float32Array(N)
    paintBase()
    paintTerrain()
    paintFrame()
    placeSquad()
    return true
  }

  function refresh() {
    if (!build()) return
    const g = nearestOpen(goalFrac[0] * cols, goalFrac[1] * rows)
    if (!introDone) {
      setGoal(g, true)
      return
    }
    setGoal(g, false)
    if (!still.matches) settle()
    draw()
  }

  canvas.addEventListener('click', (e) => {
    if (!N) return
    const r = canvas.getBoundingClientRect()
    const x = (e.clientX - r.left - ox) / cs
    const y = (e.clientY - r.top - oy) / cs
    if (x < 0 || y < 0 || x >= cols || y >= rows) return
    moveGoal(nearestOpen(x, y))
  })

  canvas.addEventListener('keydown', (e) => {
    const step = e.shiftKey ? 4 : 1
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key]
    if (!d || goal < 0) return
    e.preventDefault()
    const c = colOf(goal)
    const r = rowOf(goal)
    // Hop over water or buildings in the direction of travel
    for (let s = step; s < step + 8; s++) {
      const nc = c + d[0] * s
      const nr = r + d[1] * s
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) return
      const i = idx(nc, nr)
      if (open(i) && reach[i]) {
        moveGoal(i)
        return
      }
    }
  })

  let resizeTimer = 0
  const ro = new ResizeObserver(() => {
    clearTimeout(resizeTimer)
    resizeTimer = setTimeout(refresh, introDone ? 120 : 0)
  })
  ro.observe(canvas)
  if (cartouche) ro.observe(cartouche)
  still.addEventListener?.('change', refresh)
}
