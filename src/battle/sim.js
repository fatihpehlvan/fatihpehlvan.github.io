// Battle simulation shared by the page and the training script. No DOM here.
// Two armies of six infantry and four archers. Each commander picks one of five orders;
// units carry the order out on their own.

export const W = 120
export const H = 60
export const DT = 0.05 // seconds per simulation step
export const DECISION = 1 // seconds between commander decisions
export const TIME_LIMIT = 120
export const ORDERS = ['advance', 'hold', 'charge', 'flank', 'fallback']
export const INF = 0
export const ARCH = 1
export const ARMY = { inf: 6, arch: 4 }

export const STATS = [
  { hp: 100, walk: 4.2, run: 6.4, reach: 1.9, dps: 15, arrowTaken: 0.55 },
  { hp: 60, walk: 4.4, run: 5, reach: 1.9, dps: 5, arrowTaken: 1, range: 34, reload: 1.7, arrow: 14 },
]
const ARROW_SPEED = 40
const HIT_RADIUS = 1.25
const SPACING = 1.6

export function rng(seed) {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) | 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const dirOf = (side) => (side === 0 ? 1 : -1)
const homeOf = (side) => (side === 0 ? 8 : W - 8)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))

export function createBattle(seed = Date.now()) {
  const rand = rng(seed)
  const units = []
  for (let side = 0; side < 2; side++) {
    const dir = dirOf(side)
    const front = side === 0 ? 26 : W - 26
    for (let i = 0; i < ARMY.inf; i++) {
      units.push(makeUnit(side, INF, front, H / 2 + (i - (ARMY.inf - 1) / 2) * 3.6, rand))
    }
    for (let j = 0; j < ARMY.arch; j++) {
      units.push(makeUnit(side, ARCH, front - dir * 7, H / 2 + (j - (ARMY.arch - 1) / 2) * 4.6, rand))
    }
  }
  return {
    t: 0,
    units,
    arrows: [],
    orders: ['hold', 'hold'],
    anchor: [26, W - 26],
    dealt: [0, 0],
    over: false,
    winner: -1,
    rand,
  }
}

function makeUnit(side, kind, x, y, rand) {
  const s = STATS[kind]
  const jx = (rand() - 0.5) * 0.8
  const jy = (rand() - 0.5) * 0.8
  return {
    side,
    kind,
    x: x + jx,
    y: y + jy,
    px: x + jx,
    py: y + jy,
    vx: 0,
    vy: 0,
    hp: s.hp,
    cd: kind === ARCH ? rand() * s.reload : 0,
    alive: true,
    slotY: y,
    lane: y < H / 2 ? 6 : H - 6,
    flank: 0,
    diedAt: -1,
  }
}

export function setOrder(b, side, order) {
  if (b.orders[side] === order) return
  b.orders[side] = order
  let sum = 0
  let n = 0
  for (const u of b.units) {
    if (u.side !== side) continue
    u.flank = 0
    if (u.alive && u.kind === INF) {
      sum += u.x
      n++
    }
  }
  if (n) b.anchor[side] = sum / n
}

function nearestEnemy(b, u, kind = -1) {
  let best = null
  let bd = Infinity
  for (const e of b.units) {
    if (!e.alive || e.side === u.side || (kind >= 0 && e.kind !== kind)) continue
    const d = Math.hypot(e.x - u.x, e.y - u.y)
    if (d < bd) {
      bd = d
      best = e
    }
  }
  return [best, bd]
}

function enemyFront(b, side) {
  const dir = dirOf(side)
  let front = dir > 0 ? Infinity : -Infinity
  for (const e of b.units) {
    if (!e.alive || e.side === side) continue
    front = dir > 0 ? Math.min(front, e.x) : Math.max(front, e.x)
  }
  return front
}

function gauss(rand) {
  const u = Math.max(rand(), 1e-9)
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand())
}

export function step(b) {
  if (b.over) return
  b.t += DT

  for (let side = 0; side < 2; side++) {
    const dir = dirOf(side)
    const order = b.orders[side]
    if (order === 'advance') {
      const gap = (enemyFront(b, side) - b.anchor[side]) * dir
      if (gap > 3) b.anchor[side] += dir * STATS[INF].walk * DT
    } else if (order === 'fallback') {
      const d = homeOf(side) - b.anchor[side]
      b.anchor[side] += clamp(d, -STATS[INF].walk * DT, STATS[INF].walk * DT)
    }
  }

  const hits = []
  const moves = []
  for (const u of b.units) {
    u.px = u.x
    u.py = u.y
  }
  for (const u of b.units) {
    if (!u.alive) continue
    const s = STATS[u.kind]
    const dir = dirOf(u.side)
    const order = b.orders[u.side]
    const [e, d] = nearestEnemy(b, u)
    if (!e) continue
    const contact = d <= s.reach
    if (contact) hits.push([e, s.dps * DT, u.side])

    let tx = u.x
    let ty = u.y
    let speed = s.walk
    if (order === 'fallback') {
      tx = homeOf(u.side)
      ty = u.slotY
    } else if (u.kind === INF) {
      if (order === 'charge') {
        tx = e.x
        ty = e.y
        speed = s.run
      } else if (order === 'flank') {
        const [a] = nearestEnemy(b, u, ARCH)
        const goal = a || e
        if (d < 2.5) {
          tx = e.x
          ty = e.y
        } else if (u.flank === 0) {
          tx = goal.x - dir * 2
          ty = u.lane
          speed = s.run
          if (Math.hypot(tx - u.x, ty - u.y) < 4 || (u.x - (goal.x - dir * 6)) * dir > 0) u.flank = 1
        } else {
          tx = goal.x
          ty = goal.y
          speed = s.run
        }
      } else if (order === 'advance') {
        if (d < 6) {
          tx = e.x
          ty = e.y
        } else {
          tx = b.anchor[u.side]
          ty = u.slotY
        }
      } else if (d < 3.5) {
        tx = e.x
        ty = e.y
      }
    } else {
      // Archers
      if (order === 'advance') {
        if (d > s.range * 0.9) {
          tx = b.anchor[u.side] - dir * 7
          ty = u.slotY
        }
      } else if (order === 'charge' && d > s.range * 0.9) {
        tx = e.x
        ty = e.y
      }
      u.cd -= DT
      if (u.cd <= 0 && !contact && d <= s.range) {
        const tf = d / ARROW_SPEED
        const spread = 0.35 + d / s.range
        b.arrows.push({
          side: u.side,
          x0: u.x,
          y0: u.y,
          x1: e.x + e.vx * tf + gauss(b.rand) * spread,
          y1: e.y + e.vy * tf + gauss(b.rand) * spread,
          t: 0,
          tf,
        })
        u.cd = s.reload * (0.85 + 0.3 * b.rand())
      }
    }

    // Units in contact stand and fight, except when ordered to fall back
    if (contact && order !== 'fallback') continue
    moves.push([u, tx, ty, speed * DT])
  }

  // Everyone decided from the same positions; now they all move
  for (const [u, tx, ty, stepLen] of moves) {
    const dx = tx - u.x
    const dy = ty - u.y
    const len = Math.hypot(dx, dy)
    if (len <= stepLen) {
      u.x = tx
      u.y = ty
    } else if (len > 1e-6) {
      u.x += (dx / len) * stepLen
      u.y += (dy / len) * stepLen
    }
  }

  for (const [e, dmg, side] of hits) {
    if (!e.alive) continue
    const real = Math.min(dmg, e.hp)
    e.hp -= real
    b.dealt[side] += real
  }

  for (const a of b.arrows) {
    a.t += DT
    if (a.t < a.tf) continue
    let best = null
    let bd = HIT_RADIUS
    for (const e of b.units) {
      if (!e.alive || e.side === a.side) continue
      const d = Math.hypot(e.x - a.x1, e.y - a.y1)
      if (d < bd) {
        bd = d
        best = e
      }
    }
    if (best) {
      const real = Math.min(STATS[ARCH].arrow * STATS[best.kind].arrowTaken, best.hp)
      best.hp -= real
      b.dealt[a.side] += real
    }
    a.done = true
  }
  b.arrows = b.arrows.filter((a) => !a.done)

  const alive = b.units.filter((u) => u.alive)
  for (let i = 0; i < alive.length; i++) {
    for (let j = i + 1; j < alive.length; j++) {
      const p = alive[i]
      const q = alive[j]
      let dx = q.x - p.x
      let dy = q.y - p.y
      let d = Math.hypot(dx, dy)
      if (d >= SPACING) continue
      if (d < 1e-6) {
        dx = b.rand() - 0.5
        dy = b.rand() - 0.5
        d = Math.hypot(dx, dy)
      }
      const push = (SPACING - d) / 2
      p.x -= (dx / d) * push
      p.y -= (dy / d) * push
      q.x += (dx / d) * push
      q.y += (dy / d) * push
    }
  }

  const counts = [0, 0]
  for (const u of b.units) {
    if (!u.alive) continue
    u.x = clamp(u.x, 1, W - 1)
    u.y = clamp(u.y, 1, H - 1)
    u.vx = (u.x - u.px) / DT
    u.vy = (u.y - u.py) / DT
    if (u.hp <= 0) {
      u.alive = false
      u.hp = 0
      u.diedAt = b.t
      continue
    }
    counts[u.side]++
  }

  if (counts[0] === 0 || counts[1] === 0) {
    b.over = true
    b.winner = counts[0] === counts[1] ? -1 : counts[0] > 0 ? 0 : 1
  } else if (b.t >= TIME_LIMIT) {
    b.over = true
    const hp = [0, 0]
    for (const u of b.units) hp[u.side] += u.hp
    b.winner = Math.abs(hp[0] - hp[1]) < 1 ? -1 : hp[0] > hp[1] ? 0 : 1
  }
}

// ---- What a commander sees ----

const bucket4 = (n) => (n === 0 ? 0 : n <= 2 ? 1 : n <= 4 ? 2 : 3)
const bucket3 = (n) => (n === 0 ? 0 : n <= 2 ? 1 : 2)

export function gap(b) {
  let g = Infinity
  for (const u of b.units) {
    if (!u.alive || u.side !== 0) continue
    for (const e of b.units) {
      if (!e.alive || e.side !== 1) continue
      g = Math.min(g, Math.hypot(e.x - u.x, e.y - u.y))
    }
  }
  return g
}

export const N_STATES = 4 * 3 * 4 * 3 * 4 * 3

// Own and enemy infantry and archers (bucketed counts), the distance between the armies,
// and whether the enemy is coming closer, holding or pulling back.
export function observe(b, side) {
  const c = [
    [0, 0],
    [0, 0],
  ]
  let toward = 0
  let n = 0
  for (const u of b.units) {
    if (!u.alive) continue
    c[u.side][u.kind]++
    if (u.side !== side) {
      toward += u.vx * (side === 0 ? -1 : 1)
      n++
    }
  }
  const o = 1 - side
  const g = gap(b)
  const gapB = g < 4 ? 0 : g < 15 ? 1 : g < 34 ? 2 : 3
  const mean = n ? toward / n : 0
  const motion = mean > 0.8 ? 2 : mean < -0.8 ? 0 : 1
  let s = bucket4(c[side][INF])
  s = s * 3 + bucket3(c[side][ARCH])
  s = s * 4 + bucket4(c[o][INF])
  s = s * 3 + bucket3(c[o][ARCH])
  s = s * 4 + gapB
  return s * 3 + motion
}

export function aliveCount(b, side) {
  let n = 0
  for (const u of b.units) if (u.alive && u.side === side) n++
  return n
}
