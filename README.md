# Japan Toolkit

A small static site with three utilities for life in Japan, built with vanilla TypeScript + HTML + CSS and Vite.

**Live site:** `https://guru-ng.github.io/japan-toolkit/`

## Tools

| Tool | Path | Description |
|---|---|---|
| Era Date Converter | `/date-converter/` | Two-way conversion: Gregorian ↔ Japanese imperial era (Meiji → Reiwa) |
| Postal Code Lookup | `/postal-lookup/` | 7-digit postal code → prefecture/city/town via ZipCloud API |
| PR Points Calculator | `/pr-calculator/` | HSP point score estimator for Japan Permanent Residency |

## Guides

SEO-friendly explainer articles under `/guides/`, each cross-linking to its companion tool:

| Guide | Path |
|---|---|
| How Japanese Era Dates Work | `/guides/japanese-eras/` |
| How to Read a Japanese Address | `/guides/japanese-addresses/` |
| Understanding the HSP Points System | `/guides/hsp-points/` |

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
│   │   ├── nav.ts             # nav component
│   │   ├── footer.ts          # footer component
│   │   └── clipboard.ts       # copy-button helper
│   ├── home.ts                # landing page entry
│   ├── guides/main.ts         # shared entry for all guide pages
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
├── privacy-policy/index.html
├── guides/index.html          # guides landing page
├── guides/japanese-eras/index.html
├── guides/japanese-addresses/index.html
├── guides/hsp-points/index.html
├── index.html
├── vite.config.ts
└── .github/workflows/deploy.yml
```

## Deploying to GitHub Pages

1. Push this repo to `github.com/guru-ng/japan-toolkit`.
2. Go to **Settings → Pages** and set the source to **GitHub Actions**.
3. Push to `main` — the workflow in `.github/workflows/deploy.yml` builds and deploys automatically.

The `base: '/japan-toolkit/'` in `vite.config.ts` matches the project-page URL `https://guru-ng.github.io/japan-toolkit/`.

> **Note for Netlify:** Netlify serves from a root domain (not a `/japan-toolkit/` subpath), so a fixed `base: '/japan-toolkit/'` would make all built asset paths 404 there. `vite.config.ts` now sets `base` conditionally: `process.env.DEPLOY_TARGET === 'netlify' ? '/' : '/japan-toolkit/'`. When re-enabling Netlify, set the environment variable `DEPLOY_TARGET=netlify` in **Site settings → Build & deploy → Environment** — no other change is needed, and GitHub Pages builds are unaffected.

## Managing Netlify usage

Netlify's 2026 pricing is credit-based. The free tier includes **300 credits/month**, and each **production deploy costs 15 credits** — so roughly 20 deploys/month uses the whole allowance. Bandwidth (20 credits/GB) and any serverless/background functions (10 credits/GB-hour) also draw from the same pool, but for a static site like this, deploy count is usually the biggest factor.

If credit usage is climbing fast, it's almost always from frequent pushes triggering auto-deploys. Options:
- Batch changes into fewer commits/pushes rather than deploying after every small edit.
- Use **deploy previews** for branches and only deploy to production (push to `main`) when ready.
- Temporarily pause auto-publishing in **Site settings → Build & deploy → Stop builds** while iterating locally, then resume before the final push.
- Check current usage under **Team settings → Billing → Usage** in the Netlify UI.

## Setting up Google AdSense (beginner checklist)

1. **Have a live site with original content** — this site now has SEO meta descriptions on every page plus a `/privacy-policy/` page, which AdSense expects.
2. Apply at [adsense.google.com](https://www.adsense.google.com/) with the site's live URL.
3. Once approved, Google gives you a publisher ID (`ca-pub-XXXXXXXXXXXXXXXX`):
   - Uncomment the AdSense `<script>` tag in the `<head>` of each page (`index.html`, `date-converter/index.html`, `postal-lookup/index.html`, `pr-calculator/index.html`, `privacy-policy/index.html`) and replace `ca-pub-XXXXXXXXXXXXXXXX` with your ID.
   - Add an `ads.txt` file at the site root containing: `google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0`.
4. Each page has a `.ad-slot` placeholder `<div>` where an ad unit can go — replace it with the `<ins class="adsbygoogle">` snippet AdSense provides for each ad unit.
5. Re-deploy after adding the script and `ads.txt` — AdSense will start showing ads once the site passes its review.

## Notes

- **PR Calculator:** Scoring data sourced from official ISA/MOJ ministerial ordinances (retrieved June 2026): ordinance 930001658, special addition notice 930001665, official points table 001398882. See `src/pr-calculator/scoring.ts` for citations. Do not rely on any calculator for real immigration decisions — verify directly with ISA.
- **Era logic:** The Gregorian↔era conversion uses a manual boundary table in `src/date-converter/era-logic.ts`, cross-checked at runtime against `Intl.DateTimeFormat` with the Japanese calendar.
- **ZipCloud:** Free, no API key required, CORS-enabled. Returns Japanese and kana address components.
- **Privacy policy:** `/privacy-policy/` covers cookie/ad usage for AdSense compliance — update it if analytics or ad providers change.
