# Design Review: Pomodoro

Reviewed against: brief de conversa (grill-me + frontend-design)
Philosophy: quartzo-branco (light) / noite (dark), sotaque vermelho vibrante, brasa/ember
Date: 2026-07-31

## Screenshots Captured

| Screenshot                                   | Breakpoint         | Description               |
| -------------------------------------------- | ------------------ | ------------------------- |
| `screenshots/review-pomodoro-desktop-1280.png` | Desktop (1280)   | Timer fullscreen + fundo  |
| `screenshots/review-pomodoro-tablet-768.png`   | Tablet (768)     | Adaptação tablet          |
| `screenshots/review-pomodoro-mobile-375.png`   | Mobile (375)     | Adaptação mobile          |

> **Nota de método**: o modelo ativo não suporta entrada de imagem, então os PNGs não
> puderam ser inspecionados visualmente. Esta revisão é **estática, baseada em código/CSS**
> contra o checklist da skill. A validação pixel a pixel (renderização dos polígonos, fontes,
> gradientes) segue pendente e depende de inspeção visual humana ou de um modelo com visão.

## Summary

Estrutura sólida e coerente com o conceito "ember": hierarquia clara (timer como herói),
tokens compartilhados, estados e acessibilidade em boa parte cobertos. Os achados principais
são de consistência de tema (accent em canvas/burst não segue dark mode), foco de teclado
no diálogo e contraste de texto sobre o accent vibrante.

## Must Fix

1. **Accent de canvas/burst não segue o dark mode**: `ACCENT_HEX` em `App.tsx` era fixo
   (`#f43a2e`/`#10a598`), enquanto os tokens CSS trocam para `#ff5346`/`#1fc4b0` em
   `prefers-color-scheme: dark`. O `EmberBurst` e as partículas do `Background3D` usariam o
   vermelho do tema claro no modo escuro. _Fix aplicado_: `resolveAccentHex()` lê a variável
   resolvida via `getComputedStyle`, com fallback.

## Should Fix

1. **Focus trap + retorno de foco no drawer** (`Drawer.tsx`): o diálogo era `aria-modal`
   sem trap — Tab vazava para o fundo, e o foco não voltava à engrenagem ao fechar.
   _Fix aplicado_: Tab cicla dentro do drawer, Esc fecha, e o foco retorna ao gatilho.
2. **`role` inválido no anel de progresso** (`ProgressRing.tsx`): `role="img"` com
   `aria-valuemin/max/now` — `valuenow` só é válido em `role="progressbar"`. _Fix aplicado_.
3. **Contraste AA no texto sobre o accent**: botão primário (branco sobre `#f43a2e`) ≈
   3.8:1 e status "Em andamento" (accent sobre fundo claro) ≈ 3.6:1 — abaixo de 4.5:1.
   No dark, `#ff5346` é mais claro e o contraste cai mais ainda. _Sugestão_: escurecer o
   preenchimento do botão primário com `color-mix(in oklab, var(--accent) 80%, black)` e
   escurecer o texto de status via `color-mix(in oklab, var(--accent) 70%, var(--ink))`
   — não apliquei por ser mudança visual e não conseguir validar a renderização.
4. **Touch targets < 44px**: fechar da gaveta (40px) e botões do segmented (~38px).
   _Fix aplicado_: ambos agora ≥ 44px.
5. **Cabeçalhos semânticos**: "Pomodoro" e "Controles" são `<span>`, e o hero é um `<time>`;
   não há `<h1>`. _Sugestão_: usar `h1` no título da página e `h2` já usados nos cards.

## Could Improve

1. **Mobile-first**: a única media query é `max-width: 720px` (desktop-first). Funciona,
   mas quebrar em `min-width` tornaria a base mobile mais previsível.
2. **Corpo de texto pequeno no mobile**: rótulos 13px (status, ciclos, stat) ficam abaixo
   dos 16px recomendados para leitura em telas pequenas.
3. **`prefers-color-scheme` vs. toggle manual**: o tema segue o SO; não há toggle na UI.
   Consistente com o brief atual, mas vale considerar se um controle explícito é desejado.
4. **Fonte via Google Fonts**: FOIT/FOUT possível; considerar `font-display: swap` explícito
   (o Vite já injeta `display=swap` no link).

## What Works Well

- **Hierarquia**: o timer ocupa o hero fullscreen com peso tipográfico forte; ações e
  controle segmented têm peso secundário bem calibrado.
- **Sistema de tokens**: cores, sombras e raios vêm de variáveis; a troca de tema é
  consistente em todo o CSS.
- **Motion com respeito ao usuário**: `prefers-reduced-motion` tratado no CSS global, no
  `Background3D` e no `EmberBurst`.
- **Acessibilidade básica**: `inert` na gaveta fechada, `aria-label` nos ícones, estado
  vazio no histórico, `aria-pressed` no segmented.
- **Feedback em toda ação**: ripple nos botões, onda + partículas no fundo, ember burst na
  conclusão, status sempre visível no readout.
