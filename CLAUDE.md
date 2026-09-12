# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

A Phaser 3 web game template: Vite + TypeScript + Phaser 3.90 (Matter.js physics), deployed as a
static site to GitHub Pages by GitHub Actions.

The game in `src/` is a **placeholder demo** — drop balls, score them when they land. It exists to
prove the pipeline end to end. Replace it with the real game; keep the structure around it.

Player-facing copy is Korean. There is no backend.

## Commands

```bash
npm run dev      # Vite dev server at http://localhost:5173/
npm run check    # tsc --noEmit && eslint . && vitest run  ← must pass before calling work done
npm test         # vitest only
npm run build    # type-check then produce dist/
```

CI runs `npm run check` before building, so a failing check blocks deployment.

## Architecture

**Game rules never touch Phaser.** `src/game/` holds rules and tuning as pure modules that do not
import Phaser, so the rule set is unit-tested without booting a game. Scenes translate engine
events into calls on those functions and apply the result. Do not move rule logic into a scene —
that is the one change that makes the whole thing untestable.

- `src/game/config.ts` — the **only** place tuning lives: the ball table, spawn weights, layout,
  physics constants. A magic number in a scene is a bug.
- `src/game/rules.ts` — pure functions. `pickKind()` takes the random value as an argument instead
  of calling `Math.random()`, which is what makes it deterministic and testable.
- `src/scenes/BootScene.ts` — draws ball textures at runtime with `Graphics`. **No image assets
  ship.** To use real art, load files here; nothing else knows anything but the texture keys.
- `src/scenes/GameScene.ts` — Matter world, input, game loop.
- `src/scenes/UIScene.ts` — runs *alongside* GameScene via `scene.launch()`, not inside it, so
  overlays stay interactive while the physics scene is paused.
- `src/services/ScoreService.ts` — the persistence boundary. The game never calls `localStorage`
  or `fetch` directly. Adding a leaderboard later means one new implementation plus the single
  injection line in `main.ts`.

## Gotchas

These cost real debugging time. Do not reintroduce them.

- **Never tween `scale` on a `Phaser.Physics.Matter.Image`.** Phaser's Matter transform rescales
  the physics body too. If the object is destroyed mid-tween, the tween keeps writing to a dead
  body and throws inside Matter, killing the whole game loop — the game freezes silently with no
  visible error. Tween alpha instead, and `killTweensOf()` before `destroy()`.
- **Never mutate the physics world inside a collision callback.** Queue the work and apply it in
  `update()`. Removing a body mid-step corrupts the engine.
- **A body spawns at rest, so `speed < threshold` is true on its first frame.** Any "has it
  settled?" check must first require that the body has actually moved, or it fires at spawn. The
  demo's scoring hit exactly this.
- Prefer a gate that is *guaranteed* to become true (e.g. "has exceeded a speed threshold") over
  a positional one (e.g. "has crossed below a line"). A positional gate can silently never open.
- `Rectangle.setStrokeStyle(width, color, alpha)` takes alpha as a third argument. Packing it into
  the colour (`0xffffff22`) renders a wrong hue with no error.
- **Do not hardcode `base` in `vite.config.ts`.** It is derived from `GITHUB_REPOSITORY` so a repo
  created from this template works under any name. Hardcoding it 404s every asset on deploy.

## Testing a game without a visible browser

A hidden browser tab is throttled to ~1 FPS, so waiting on wall-clock time gives misleading
results. Drive the loop directly instead:

```js
const g = window.__game;                       // dev-only handle, see main.ts
for (let i = 0, t = performance.now(); i < 200; i++) { t += 16.666; g.step(t, 16.666); }
```

## Documentation

Follow the `save-docs` skill for anything under `docs/`.
