import Phaser from 'phaser';

import { LAYOUT, PHYSICS } from './game/config';
import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { UIScene } from './scenes/UIScene';
import { LocalScoreService } from './services/LocalScoreService';
import type { ScoreService } from './services/ScoreService';
import './style.css';

// The one place the app decides where scores live. Swapping in a server-backed
// implementation later is a change to this line and nothing else.
const scoreService: ScoreService = new LocalScoreService();

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: LAYOUT.width,
  height: LAYOUT.height,
  backgroundColor: '#141a24',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'matter',
    matter: {
      gravity: { x: 0, y: PHYSICS.gravityY },
      debug: false,
    },
  },
  scene: [BootScene, GameScene, UIScene],
  callbacks: {
    // preBoot runs before any scene is created, so scenes can rely on this.
    preBoot: (game) => game.registry.set('scoreService', scoreService),
  },
});

// Dev-only debug handle: lets you poke at scenes and the physics world from the
// browser console (`__game.scene.getScene('GameScene')`). Stripped from builds.
if (import.meta.env.DEV) {
  (window as unknown as { __game: Phaser.Game }).__game = game;
}
