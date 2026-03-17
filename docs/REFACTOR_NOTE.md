# Refactor: App at project root

The app now lives at **project root** (no `frontend/` subfolder).

- **Source:** `src/` (features, shared, app, layouts, routes, config, etc.)
- **Config:** `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `components.json`, `.env` at root.
- **Commands:** Run `npm run dev`, `npm run build` from the project root.

If a `frontend/` folder still exists (e.g. deletion failed due to locked files), you can **delete it manually** after closing any tools (IDE, terminal, Node) that might be using it. The active codebase is at root. The folder is in `.gitignore` so it will not be committed.
