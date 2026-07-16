# National Curebound research + donor ZIP dashboard

Interactive maps for Curebound research partnerships and donor accounts by ZIP.

**Live site:** https://jestr-collab.github.io/CureboundResearch/

## Run locally

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually http://127.0.0.1:5173).

## Build

```bash
npm run build
npm run preview
```

## GitHub Pages

Pushes to `main` build and deploy via Actions. In the repo settings, set **Pages → Source** to **GitHub Actions** (not “Deploy from a branch”).

## PNG exports

Meeting-ready PNGs live in `exports/`:

- `curebound-research-map.png` — map plus full partnership details on the left
- `donor-accounts-by-zip.png` — donor ZIP point map

Regenerate anytime:

```bash
npm run export:png
```

Preview export layouts in the browser:

- `export-research.html`
- `export-donor.html`

## Notes

- Left widget: research programs by state
- Right widget: one point per donor account (Billing ZIP)
- Theme accent: `#f0ff5a`
