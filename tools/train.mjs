// Trains the red commander with tabular Q-learning against scripted blue commanders.
// Usage: node tools/train.mjs [episodes] [output]   (default output: src/battle/qtable.json)
import { writeFileSync } from 'node:fs'
import { createBattle, step, setOrder, observe, gap, ORDERS, DECISION, N_STATES, rng } from '../src/battle/sim.js'

const EPISODES = Number(process.argv[2]) || 40000
const A = ORDERS.length
const GAMMA = 0.95
const WIN_BONUS = 3
const Q = new Float64Array(N_STATES * A)
const visits = new Uint32Array(N_STATES * A)
const rand = rng(7)

// Opponents the agent trains against. Each takes the battle and returns an order.
const scripted = {
  rusher: (b) => (gap(b) > 10 ? 'advance' : 'charge'),
  turtle: (b) => (gap(b) > 6 ? 'hold' : 'charge'),
  skirmisher: (b) => {
    const g = gap(b)
    return g > 30 ? 'advance' : g > 6 ? 'hold' : 'charge'
  },
  flanker: (b) => (gap(b) > 32 ? 'advance' : 'flank'),
  kiter: (b) => {
    const g = gap(b)
    return g < 7 ? 'fallback' : g > 30 ? 'advance' : 'hold'
  },
  random: (b, mem) => {
    if (!mem.order || rand() < 0.3) mem.order = ORDERS[Math.floor(rand() * A)]
    return mem.order
  },
}
const names = Object.keys(scripted)

function greedy(s) {
  let best = 0
  for (let a = 1; a < A; a++) if (Q[s * A + a] > Q[s * A + best]) best = a
  return best
}

function act(s, eps) {
  return rand() < eps ? Math.floor(rand() * A) : greedy(s)
}

function update(s, a, r, s2) {
  const k = s * A + a
  visits[k]++
  const alpha = Math.max(0.02, 1 / Math.pow(visits[k], 0.6))
  let target = r
  if (s2 >= 0) {
    let m = -Infinity
    for (let x = 0; x < A; x++) m = Math.max(m, Q[s2 * A + x])
    target += GAMMA * m
  }
  Q[k] += alpha * (target - Q[k])
}

// One battle. Red (side 1) is the learner; blue (side 0) follows a scripted commander.
function battle(opponent, eps, learn, seed) {
  const b = createBattle(seed)
  const mem = {}
  setOrder(b, 0, scripted[opponent](b, mem))
  let s = observe(b, 1)
  let a = act(s, eps)
  setOrder(b, 1, ORDERS[a])
  let last0 = 0
  let last1 = 0
  let next = DECISION
  while (!b.over) {
    step(b)
    if (b.t + 1e-9 < next && !b.over) continue
    next += DECISION
    const r = (b.dealt[1] - last1 - (b.dealt[0] - last0)) / 100
    last0 = b.dealt[0]
    last1 = b.dealt[1]
    if (b.over) {
      const bonus = b.winner === 1 ? WIN_BONUS : b.winner === 0 ? -WIN_BONUS : 0
      if (learn) update(s, a, r + bonus, -1)
      break
    }
    setOrder(b, 0, scripted[opponent](b, mem))
    const s2 = observe(b, 1)
    if (learn) update(s, a, r, s2)
    s = s2
    a = act(s, eps)
    setOrder(b, 1, ORDERS[a])
  }
  return b.winner
}

function evaluate(games = 200) {
  const out = {}
  for (const name of names) {
    const tally = { win: 0, draw: 0, loss: 0 }
    for (let g = 0; g < games; g++) {
      const w = battle(name, 0, false, 900000 + g)
      if (w === 1) tally.win++
      else if (w === 0) tally.loss++
      else tally.draw++
    }
    out[name] = tally
  }
  return out
}

const t0 = Date.now()
console.log('before training', JSON.stringify(evaluate(60)))
for (let ep = 0; ep < EPISODES; ep++) {
  const eps = Math.max(0.05, 0.4 * (1 - ep / (EPISODES * 0.8)))
  battle(names[ep % names.length], eps, true, 1000 + ep)
  if ((ep + 1) % 10000 === 0) console.log(`${ep + 1} battles, ${((Date.now() - t0) / 1000).toFixed(0)} s`)
}
const result = evaluate(200)
console.log('after training', JSON.stringify(result))

// Store only the states the agent has visited; the rest stay at zero.
let visited = 0
const rows = {}
for (let s = 0; s < N_STATES; s++) {
  let seen = 0
  for (let a = 0; a < A; a++) seen += visits[s * A + a]
  if (!seen) continue
  visited++
  rows[s] = Array.from(Q.subarray(s * A, s * A + A), (v) => Math.round(v * 1000) / 1000)
}
const out = process.argv[3] || new URL('../src/battle/qtable.json', import.meta.url)
writeFileSync(
  out,
  JSON.stringify({ orders: ORDERS, episodes: EPISODES, opponents: names, states: N_STATES, rows }),
)
console.log(`visited ${visited} of ${N_STATES} states; wrote ${out}`)
