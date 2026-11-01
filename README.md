# DEVIL AI — starter project

A pale-green, deep-space AI chat interface built as a mobile-first PWA.

## Files
- `index.html` — app structure
- `style.css` — space theme, responsive layout and animations
- `script.js` — chat UI, local chat history and API calls
- `api/chat.js` — server-side Groq API route
- `manifest.json` — PWA metadata
- `sw.js` — service worker for app-shell caching
- `icons/icon.svg` — app icon

## Deploy with GitHub + Vercel
1. Upload all files and folders in this project to the root of your GitHub repository.
2. Import that repository into Vercel (Framework Preset: Other; Root Directory: `.`).
3. In Vercel → Project → Settings → Environment Variables, add:
   - Name: `GROQ_API_KEY`
   - Value: your Groq API key
   Apply it to Production (and Preview if you want), then redeploy.
4. Open the deployed HTTPS URL on Android Chrome. Use the browser menu → **Install app** or **Add to Home screen**.

## Important
- Never put your Groq API key in `script.js`, `index.html`, or any public GitHub file.
- Chat history is stored in the current browser's LocalStorage.
- The service worker caches the app shell. Chat requests still need an internet connection.
- If you change cached frontend files later, update `CACHE_NAME` in `sw.js` (for example, `devil-ai-v2`).
