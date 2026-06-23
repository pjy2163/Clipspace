# Security Notes

Cliplog handles clipboard data, so the main security goal is to keep the MVP predictable, local, and easy for users to understand.

## Current Protections

- Local-first storage: saved clips are stored in IndexedDB in the user's browser.
- No authentication: the MVP avoids account, password, and profile data.
- No backend sync: copied content is not uploaded by default.
- Content Security Policy: `next.config.ts` defines CSP and other browser security headers.
- Restricted image MIME types: only PNG, JPEG, WebP, and GIF image clips are accepted.
- SVG excluded: SVG is not accepted because it can contain script-like behavior, external references, and XML features that need dedicated sanitization.
- Sensitive-content detection: card numbers, phone-like numbers, API keys, tokens, passwords, and bearer strings are flagged before saving.

## Known Limitations

- Sensitive-content detection is heuristic and can miss real secrets or flag harmless text.
- IndexedDB data is still readable by anyone with access to the same browser profile.
- Local-first storage does not replace device security, browser profile isolation, or OS-level encryption.
- Share actions rely on the browser's Web Share API or clipboard API.
- If ads, analytics, AI APIs, or sync are added later, the CSP and privacy model must be reviewed again.

## Recommended Next Steps

- Add a user setting to require confirmation before saving sensitive-looking clips.
- Add an explicit "private mode" that blocks saving flagged content entirely.
- Add export and delete-all controls for user data portability and cleanup.
- Add production monitoring with privacy-safe events only.
- Add dependency and secret scanning in CI.
- Add CSP regression checks before enabling third-party scripts such as ads.
- If SVG support is needed later, sanitize or rasterize SVG files before storage and rendering.
