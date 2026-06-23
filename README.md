# Cliplog

Cliplog is a local-first clipboard dashboard for collecting copied text, links, code snippets, and pasted images into a readable timeline.

I started this project because copied references are easy to lose while studying, debugging, or collecting materials for a team project. Cliplog focuses on a small but useful workflow: copy something, open the web app, paste or import it, and review everything by date, type, and workspace.

## Features

- Save clipboard text with a paste shortcut or import button
- Paste image clips and image memos
- Organize clips into personal and team workspaces
- Group saved clips by date in a dense responsive timeline
- Detect links, code, contact-like text, and sensitive-looking content
- Infer simple titles for copied links
- Add threaded memos to each clip
- Search, filter, pin, share, and delete clips
- Resize the workspace panels for different screen sizes

## Privacy Model

Cliplog is intentionally local-first for the MVP.

- No login is required.
- Clipboard data is stored in the browser with IndexedDB.
- The app does not send saved clips to a backend.
- Sensitive-looking text is flagged before saving so the user can review it.
- Pasted images are limited to `image/png`, `image/jpeg`, `image/webp`, and `image/gif`.
- SVG images are excluded for now because they can contain scripts, event handlers, external references, and XML behavior that requires stricter sanitization.

See [SECURITY.md](./SECURITY.md) for the current security notes and next hardening steps.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- IndexedDB for browser-side storage
- Vercel-ready deployment

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Project Structure

```text
src/app/          Next.js app entry
src/components/   UI components
src/lib/          clipboard, image, storage, and share logic
src/styles/       shared UI class tokens
src/types/        shared TypeScript types
```

## Deployment

Cliplog can be deployed as a standard Next.js project on Vercel.

For future monetization, ads can be added after the CSP is updated to allow only the required ad provider domains.

## Roadmap

- Browser extension or desktop helper for automatic clipboard capture
- Optional AI summary and category suggestions
- User-controlled export/import
- Better monitoring for production errors and security-relevant events
- Team sharing with explicit permission and stronger data isolation
