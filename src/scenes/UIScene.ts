import Phaser from 'phaser';

import { BALL_KINDS, LAYOUT } from '../game/config';
import type { ScoreService } from '../services/ScoreService';
import { ballTextureKey } from './BootScene';
import { GameEvents } from './GameScene';

/** Canvas text uses system fonts, so a CJK-capable stack needs no font file. */
const FONT = '"Apple SD Gothic Neo", "Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif';

/**
 * HUD, run alongside GameScene via `scene.launch()` rather than inside it, so
 * overlays stay interactive while the physics scene is paused or frozen.
 */
export class UIScene extends Phaser.Scene {
  private scoreText!: Phaser.GameObjects.Text;
  private bestText!: Phaser.GameObjects.Text;
  private nextPreview!: Phaser.GameObjects.Image;

  constructor() {
    super('UIScene');
  }

  create(): void {
    const game = this.scene.get('GameScene');

    this.scoreText = this.add.text(24, 22, '0', {
      fontFamily: FONT,
      fontSize: '40px',
      color: '#ffffff',
      fontStyle: 'bold',
    });
    this.bestText = this.add.text(24, 68, '최고 0', {
      fontFamily: FONT,
      fontSize: '17px',
      color: '#ffffffaa',
    });

    this.add
      .text(LAYOUT.width - 24, 22, 'NEXT', {
        fontFamily: FONT,
        fontSize: '14px',
        color: '#ffffff88',
      })
      .setOrigin(1, 0);
    this.nextPreview = this.add.image(LAYOUT.width - 46, 66, ballTextureKey(0));

    void this.loadBest();

    const onScore = (score: number) => this.scoreText.setText(String(score));
    const onNext = (kind: number) => {
      this.nextPreview.setTexture(ballTextureKey(kind));
      this.nextPreview.setScale(Math.min(1, 22 / BALL_KINDS[kind].radius));
    };

    game.events.on(GameEvents.score, onScore);
    game.events.on(GameEvents.next, onNext);

    // Without this the listeners pile up on GameScene across restarts.
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      game.events.off(GameEvents.score, onScore);
      game.events.off(GameEvents.next, onNext);
    });
  }

  private async loadBest(): Promise<void> {
    const service = this.registry.get('scoreService') as ScoreService | undefined;
    const best = (await service?.getBest()) ?? 0;
    this.bestText.setText(`최고 ${best}`);
  }
}
