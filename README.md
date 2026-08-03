# Pomodoro

Timer Pomodoro com foco em motivação visual: um fundo 3D animado de polígonos que se
fragmentam a cada clique (onda de repulsão) e se reconstroem — perfeito para períodos de
foco.

## Funcionalidades

- Timer Pomodoro com sessões de **foco**, **pausa curta** e **pausa longa**
- Fases: `focus`, `shortBreak`, `longBreak` com configurável de duração
- **Fundo 3D interativo** (`Background3D`): polígonos flutuantes que fragmentam com a
  explosão do clique e se reorganizam em perímetro após ~5s sem interação
- Onda expansiva no ponto do clique (`ClickWave`) e "ember burst" ao concluir sessão
- Persistência em `localStorage` (estado do timer + histórico de sessões)
- Notificações do navegador ao concluir sessão
- Tema claro/escuro seguindo `prefers-color-scheme`, com `prefers-reduced-motion` respeitado
- Acessibilidade: gaveta com focus-trap, `aria-live` no status, alvos de toque ≥ 44px

## Stack

- [Vite](https://vitejs.dev/) + [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- Testes com [Vitest](https://vitest.dev/) + Testing Library
- Lint com [Oxlint](https://oxc.rs/docs/guide/usage/linter/)

## Começando

Requisitos: Node.js ≥ 18.

```bash
npm install     # instala dependências
npm run dev     # servidor de desenvolvimento (http://127.0.0.1:5173)
```

## Scripts

| Comando           | Descrição                          |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Servidor de desenvolvimento (Vite) |
| `npm run build`   | Type-check (`tsc -b`) + build (`vite build`)            |
| `npm run preview` | Pré-visualiza o build de produção    |
| `npm run lint`    | Oxlint                             |
| `npm test`        | Vitest (unit)                      |

## Estrutura

```
src/
├── background/      # Motor do fundo 3D (física, fragmentação/reconstrução)
│   ├── types.ts     # Modelo de dados (Piece, Shard, etc.)
│   ├── constants.ts # Parâmetros de física
│   ├── shards.ts    # Polígonos estáticos + estado inicial
│   ├── geometry.ts  # Helpers de geometria (clip, contorno)
│   └── simulation.ts# createSimulation: loop de física e explosão
├── components/      # UI (Background3D, TimerCard, Drawer, Settings, History…)
├── hooks/           # usePomodoro, useHistory
├── lib/             # lógica pura (timer, storage, notify, format)
└── test/            # setup de testes
docs/
├── DESIGN_REVIEW.md # revisão de design
└── screenshots/     # capturas da revisão
```

## Contribuir

Rode `npm run lint`, `npm run build` e `npm test` antes de abrir um PR.