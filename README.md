# WHS Learning Sites

This project replaces the Google Sites pages with a single static site that can be deployed on Render.

## How it is organized

- Each program has one editable page file:
  - `DTECH/index.md`
  - `DVC/index.md`
  - `Food/index.md`
  - `Textiles/index.md`
  - `WOOD/index.md`
- Shared design and layout live in `_includes/` and `assets/`.
- Shared branding images live in `images/`.

## Staff update workflow

1. Open the program folder that needs an update.
2. Edit that folder's `index.md` file.
3. Change the text in the page body or replace placeholder links in the `quickLinks` section at the top.
4. Commit the change in GitHub.
5. Render rebuilds the site automatically.

## Local development

```bash
npm install
npm run dev
```

## Render setup

Use the repository root as the Render project.

- Build command: `npm install && npm run build`
- Publish directory: `dist`

If you want browser-based editing later, the next sensible step is to add a Git-backed CMS after the content structure is settled.