# Daily Dopamine Menu

An ADHD-friendly menu of solo feel-good activities to reach for instead of doomscrolling.
Mid-Century Modern × 1970s Space Age: walnut, warm lamp glow, chrome trim, grey-turquoise corduroy.

- A large pool of activities, but only **3–4 per category** are shown at a time.
- **Shuffle** re-rolls the menu, preferring items you haven't just seen.
- **Decide for me** picks one of the visible, unfinished items.
- **Tap an activity** to mark it done (strike-through). Tap again to undo.
- The menu and today's done list are remembered on the device and reset each day.
- **Doomscroll interceptor**: an iOS Shortcuts automation (or MacroDroid on Android) opens
  the app at `#intercept-<app>` whenever a feed app opens. The app shows one pick instead,
  with a hold-to-confirm escape hatch, and counts the scrolls you dodged. Setup steps are
  in the app (footer → "Doomscroll interceptor"); logic lives in `src/intercept.jsx`.
- Add or edit activities in `src/menu.js`.

```bash
npm install
npm run dev      # local dev server
npm run build    # static build in dist/
```

Built with React, Tailwind CSS and Lucide icons.
