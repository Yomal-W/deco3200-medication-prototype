# Steady — Home Medication Device (Prototype)

Interactive prototype for **DECO3200**, University of Sydney.

`Steady` is the touchscreen interface of a proposed **pharmacist-connected home
medication device**. The device receives a pharmacist-verified routine and
presents/dispenses the correct scheduled medication at the right time, so an
older adult can keep managing their medication independently.

The physical casing is simulated with cardboard around an iPad. This repository
is only the screen experience running inside it.

> **Prototype only.** Frontend only — no backend, no database, no auth, no
> pharmacy integration. All medication data is fictional sample content, and
> nothing here is medical advice. Refreshing the page resets the prototype.

## Running it

```bash
npm install
npm run dev      # local dev server
npm run lint     # eslint
npm run build    # type-check + production build
```

Designed first for **iPad/tablet landscape**, and responsive down to tablet
portrait and laptop browser windows.

## Running it at the fair

Open the page in a **fresh browser tab** and put the browser in full screen.
A fresh tab has no previous page, so an accidental left-edge swipe cannot
navigate away from the prototype.

Touch-first details worth knowing:

- Every task is completable with taps. Nothing depends on hover, long-press,
  drag or horizontal swipe.
- Screens use **hash routes** (`#/today`, `#/dose/morning`, ...), so browser
  Back/Forward and iPad edge swipes move *within* the prototype. In-app Back
  and Home actions are always present, so participants never need them.
- History entries that no longer match the current state (for example an old
  "complete" screen after a reset) fall back to a sensible screen.
- The header and bottom navigation sit outside the scrolling area, so
  navigation never covers content. There is one vertical scrolling surface
  per screen, and a **More below** control appears when there is more to see.
- Browser zoom and pinch-to-zoom are left enabled.

## Facilitator mode

For the research team at the user-testing fair:

- **Laptop:** `Ctrl` + `Shift` + `D`
- **Tablet:** tap the `Steady` device mark in the header **five times**
- Close with `Esc`

Scenarios: *Morning medication due*, *Prescription changed*. Plus *Reset
prototype*. Switching a scenario resets state so every participant starts from
the same place.

## Medication imagery

Medications are drawn locally as inline SVG — there are no photographs, no
image files and no external image requests, so the prototype renders
identically with or without internet.

Medicines are told apart by **silhouette and relative size first** (small round,
round scored, oval, caplet, capsule, large chalky tablet), never by colour
alone, and every tablet is drawn to a consistent scale relative to the others.
The imagery is **illustrative** and the interface says so: a medicine's real
appearance varies by manufacturer and supplier, so the name, dose and verified
routine stay authoritative.

Why illustrations rather than product photography, and what to record if real
images are added later: [`docs/asset-sources.md`](docs/asset-sources.md).

## Participant flows

1. **Take a dose** — Today → Medication ready now → View medication →
   Dispense medication → dispensing animation → Medication dispensed →
   I've taken these → Morning medication complete → What's next?
2. **Understand a change** — Today → prescription change notice → previous vs
   new dose, when it starts, who changed it and who verified it → I understand
   → back to Today.
3. **Check a medication** — Medications → tap a medication → illustration,
   times, instructions, purpose, prescriber and pharmacist
   (`#/medications/metformin`).

## Structure

```
src/
  components/   reusable UI (buttons, cards, timeline, icons, facilitator panel)
  screens/      screen-level components
  data/         fictional medication + scenario data
  state/        prototype state hooks
  styles/       design tokens and CSS
  types/        shared TypeScript types
  utils/        simulated clock and formatting helpers
```

Built with React + TypeScript + Vite. No UI framework and no runtime
dependencies beyond React. Deploys to GitHub Pages under the base path
`/deco3200-medication-prototype/`.
