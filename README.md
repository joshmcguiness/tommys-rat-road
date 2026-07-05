# Tommy's Rat Road

A Crossy Road–style endless hopper where every character is a rat. Hop across roads,
rivers, and bike paths, collect cheese to unlock new rats, and climb the global leaderboard.
Every 100 jumps the rat dives into a sewer and the next level runs 10% faster.

**Play it:** https://joshmcguiness.github.io/tommys-rat-road/

## Controls

- **Desktop:** arrow keys / WASD
- **Touch (iPad/phone):** on-screen D-pad or swipe

## How it's built

- `index.html` — the entire game: canvas renderer (45° isometric), game logic, sounds, UI. No dependencies.
- `worker/` — Cloudflare Worker + KV powering the global leaderboard (`GET/POST /scores`).

## Deploying

- **Game:** GitHub Pages serves `index.html` from the `main` branch.
- **Leaderboard:** `cd worker && npx wrangler deploy`
