# amanweb

Aman Mamgain's portfolio: selected products, active builds, experience, and writing. The homepage includes a Three.js robot that docks in the hero and roams while the visitor scrolls.

## Local development

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run build
npm run lint
```

## Styling

The UI uses Tailwind CSS v4 through the Vite plugin. Shared colors, typography, content widths, and page gutters are defined in `src/styles/theme.css`; components use Tailwind utilities directly. There is no separate global component stylesheet.

## Content

Homepage copy, projects, launch states, experience, and links live in `src/data/homeContent.ts`. A project may omit `href` while it is in development; add the public URL when it launches.

The article index lives at `/articles/` and includes both local and external writing. Local articles are client-rendered React pages with matching static HTML entries for link-preview metadata. The DeepSeek Harness landscape lives at `/articles/deepseek-harness-plugin-landscape`; its previous `/writing/...` route remains available as an alias.
