# amanweb

Aman Mamgain's portfolio: an introduction, projects, experience, and writing.

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

Homepage copy, the featured project, other projects, experience, and links live in `src/data/homeContent.ts`.

The article index lives at `/articles/` and includes both local and external writing. Local articles are client-rendered React pages with matching static HTML entries for link-preview metadata. The DeepSeek Harness landscape lives at `/articles/deepseek-harness-plugin-landscape`; its previous `/writing/...` route remains available as an alias.
