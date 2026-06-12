# Japan Toolkit

A small static site with three utilities for life in Japan, built with vanilla TypeScript + HTML + CSS and Vite.

**Live site:** `https://guru-ng.github.io/japan-toolkit/`

## Tools

| Tool | Path | Description |
|---|---|---|
| Era Date Converter | `/date-converter/` | Two-way conversion: Gregorian ↔ Japanese imperial era (Meiji → Reiwa) |
| Postal Code Lookup | `/postal-lookup/` | 7-digit postal code → prefecture/city/town via ZipCloud API |
| PR Points Calculator | `/pr-calculator/` | HSP point score estimator for Japan Permanent Residency |

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:5173/japan-toolkit/` in your browser.

## Build

```bash
npm run build       # outputs to dist/
npm run preview     # local preview of the production build
```

## Project structure

```
japan-toolkit/
├── src/
│   ├── shared/
│   │   ├── style.css          # shared stylesheet
│   │   └── nav.ts             # nav component
│   ├── home.ts                # landing page entry
│   ├── date-converter/
│   │   ├── era-logic.ts       # pure conversion logic (no DOM)
│   │   └── main.ts            # DOM entry point
│   ├── postal-lookup/
│   │   ├── zipcloud.ts        # ZipCloud API wrapper
│   │   └── main.ts
│   └── pr-calculator/
│       ├── scoring.ts         # scoring logic (no DOM)
│       └── main.ts
├── date-converter/index.html  # Vite MPA entry pages
├── postal-lookup/index.html
├── pr-calculator/index.html
├── index.html
├── vite.config.ts
└── .github/workflows/deploy.yml
```

## Deploying to GitHub Pages

1. Push this repo to `github.com/guru-ng/japan-toolkit`.
2. Go to **Settings → Pages** and set the source to **GitHub Actions**.
3. Push to `main` — the workflow in `.github/workflows/deploy.yml` builds and deploys automatically.

The `base: '/japan-toolkit/'` in `vite.config.ts` matches the project-page URL `https://guru-ng.github.io/japan-toolkit/`.

## Notes

- **PR Calculator:** Scoring data sourced from official ISA/MOJ ministerial ordinances (retrieved June 2026): ordinance 930001658, special addition notice 930001665, official points table 001398882. See `src/pr-calculator/scoring.ts` for citations. Do not rely on any calculator for real immigration decisions — verify directly with ISA.
- **Era logic:** The Gregorian↔era conversion uses a manual boundary table in `src/date-converter/era-logic.ts`, cross-checked at runtime against `Intl.DateTimeFormat` with the Japanese calendar.
- **ZipCloud:** Free, no API key required, CORS-enabled. Returns Japanese and kana address components.
