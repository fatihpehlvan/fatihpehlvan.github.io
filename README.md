# fatihpehlvan.github.io

Personal page of Fatih Pehlivan. Plain HTML and CSS built with Vite; pushing to `main` deploys to GitHub Pages.

The header is a small battle (`src/battle/`): you command the blue army with five orders, and the
red army is commanded by a tabular Q-learning agent. The simulation in `src/battle/sim.js` is shared
by the page and the training script, so the agent plays the same game it was trained on.

```
npm run train   # retrains the red commander and rewrites src/battle/qtable.json
```

```
npm install
npm run dev     # local preview
npm run build   # output in dist/
```
