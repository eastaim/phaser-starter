# phaser-starter

Phaser 3 웹 게임 템플릿. GitHub Pages 자동 배포까지 연결된 상태로 시작합니다.

## 새 게임 시작하기

```bash
gh repo create MyGame --template eastaim/phaser-starter --public --clone
cd MyGame
npm install
npm run dev
```

**배포 경로는 자동입니다.** `vite.config.ts`가 `GITHUB_REPOSITORY`에서 저장소 이름을 읽어
`base`를 정하므로 새 이름으로 만들어도 고칠 것이 없습니다. 로컬 개발은 `/`에서 뜹니다.

첫 push 후 Pages 소스를 Actions로 한 번만 지정하면 됩니다:

```bash
gh api -X POST repos/{owner}/MyGame/pages -f build_type=workflow
```

## 명령

```bash
npm run dev      # 개발 서버 http://localhost:5173/
npm run check    # tsc + eslint + vitest  ← 작업 완료 판단 기준
npm test         # 테스트만
npm run build    # 타입 검사 후 dist/ 생성
npm run preview  # 빌드 결과 확인
```

## 들어 있는 것

- **Vite 8 + TypeScript 6 + Phaser 3.90** (Matter.js 물리 포함)
- **ESLint + Prettier + Vitest** 설정 완료
- **GitHub Actions → Pages 자동 배포** — `npm run check` 통과해야 배포됨
- **씬 3분할** — Boot(텍스처 생성) / Game(물리·입력) / UI(HUD, 별도 씬으로 동시 실행)
- **순수 규칙 레이어** — `src/game/`은 Phaser를 import하지 않아 게임 없이 테스트 가능
- **`ScoreService` 추상화** — 지금은 localStorage, 나중에 서버로 교체 시 구현체 하나만 추가
- **이미지 에셋 0개** — 공은 런타임에 Graphics로 그림
- **데모 게임** — 공을 떨어뜨려 착지시키면 점수. 지우고 본인 게임으로 교체하세요

## 무엇을 지우고 무엇을 남길 것인가

| 지우고 새로 쓸 것 | 그대로 둘 것 |
| --- | --- |
| `src/game/rules.ts`의 데모 규칙 | 순수 함수로 유지한다는 원칙 |
| `src/game/config.ts`의 공 테이블 | 튜닝 값을 한 파일에 모은다는 원칙 |
| `GameScene`의 데모 루프 | 씬 3분할, 입력 처리 방식 |
| `tests/rules.test.ts` | 규칙을 테스트로 고정한다는 방식 |
| — | `services/`, 빌드·린트 설정, CI 워크플로 |

코드를 만지기 전에 [CLAUDE.md](CLAUDE.md)의 **Gotchas** 절을 읽으세요. 재발하면 원인을 찾기 어려운
함정들이 정리되어 있습니다.
