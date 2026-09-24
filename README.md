# InkPlan

**A handwriting-first productivity PWA for people who think on paper.**

[Live Demo](https://inkplan-zeta.vercel.app) · [Report an Issue](https://github.com/harshshrivastav0207/inkplan/issues)

---

## The Idea

Most productivity apps force a trade-off. Handwriting apps like GoodNotes don't plan your day. Task apps like Todoist don't let you write. Anyone who thinks with a pen ends up juggling four separate tools just to get through a normal day.

InkPlan is a single workspace built around the act of writing. You plan, focus, track habits, and journal — all with a pen — while a personal world grows in the background as you focus.

The goal was not another note-taking app. It was a calmer, quieter alternative to the productivity software that treats you like a metric.

---

## What It Does

### Write with a real pen

A handwriting engine with pressure sensitivity, stroke smoothing, a highlighter, and a stroke-based eraser. Not a webform. Actual ink on a page.

### Plan a day without guilt

Tasks with due dates and priorities. Today, Upcoming, and Completed views. Overdue items are visible, not punished.

### Focus with a timer that means something

Pomodoro sessions with ambient audio. Every completed minute grows a personal world — a tree, a pond, a cottage, a lantern. Nothing decays. Nothing is lost when you stop.

### Track habits quietly

Water intake with a weekly history. Budget with monthly totals and category breakdowns. Notes with pages, themes, and export.

### See patterns, not vanity metrics

Focus minutes over time, task completion rate, water streaks, spending by category. Every chart answers a real question. None of them are decoration.

### Works offline. Syncs when it can.

Everything runs on-device first. Cloud sync is optional. If the network disappears, the app keeps working exactly as it did.

### Installable on any device

A real PWA. Install it on iOS or Android from the browser. No app store. No account required to start.

---

## Technical Highlights

Three things in this project were genuinely hard to get right.

### Local-first architecture with optional cloud sync

The entire app runs on IndexedDB (via Dexie). Every read comes from local storage. Every write is instant. A background sync engine delivers changes to Supabase without ever blocking the UI.

Conflicts resolve silently using last-write-wins per record, with tombstones for deletes. The sync queue survives browser restarts and drains automatically when the network returns.

### Handwriting that feels like handwriting

The pen engine uses Perfect Freehand for stroke smoothing and pressure curves, on top of a raw HTML5 canvas. Palm-rejection is handled with a heuristic that skips touch input when a stylus is active. Zoom and pan use a single viewport transform so the cursor always aligns with the ink.

### Multi-user account isolation

When the cloud sync was added, a subtle bug appeared: local data from one account was being uploaded under a different account. The fix required a per-device identity layer, an idempotent cleanup path, and pre-flight cross-account detection in the sync engine — the kind of bug that only appears when you actually use the product.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Local storage | Dexie (IndexedDB) |
| Cloud | Supabase (Postgres + Auth) |
| Handwriting | Perfect Freehand |
| Charts | Recharts |
| Hosting | Vercel |

---

## What Was Built

Roughly 250 hours of focused work across a full product cycle:

- Product research and scope definition
- Data model and local-first architecture
- Handwriting engine from scratch
- Seven integrated modules
- PWA packaging and cloud sync
- Account isolation and conflict resolution
- Cross-device testing on desktop, tablet, and phone
- Deployment and monitoring

Every module was built end to end: schema, repository, reactive hook, UI, states, and testing.

---

## Source Availability

InkPlan is a personal product and portfolio project. The repository is public so that other developers can review the architecture and see the craft behind it.

**The source is not licensed for reuse, redistribution, or commercial use.** If you find an idea here worth borrowing, I take it as a compliment — but please build your own version rather than deploying mine.

If you are working on a similar problem and want to talk through the architecture, I am happy to help. Open an issue or reach out.

---

## About Me

**Harsh Shrivastav**

I build calm, thoughtful software for people who care about how their tools feel.

- GitHub: [@harshshrivastav0207](https://github.com/harshshrivastav0207)

If you are hiring, collaborating, or just want to talk about local-first apps, get in touch.

---

*If InkPlan interests you, a star on this repo helps more developers find it.*