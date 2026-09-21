# MediFlow — Home Medication Device (Prototype)

Interactive prototype for **DECO3200**, University of Sydney.

`MediFlow` is the touchscreen interface of a proposed **pharmacist-connected home
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

## The three user-testing activities

A session is one continuous journey through an empty device becoming a stocked,
in-use one. The three think-aloud activities follow each other without any
facilitator input:

| Stage | What the participant does |
| --- | --- |
| **1. Empty** | MediFlow has nothing in it. They load the pharmacy pack and the six medications appear. |
| **2. Ready** | Today is now populated. They complete the morning routine. |
| **3. Low stock** | Confirming the morning dose is what reveals that one medication has run low. They find it in Medications and ask the pharmacy to restock. |

Because a session cannot wait several hours for the afternoon and evening
routines, Today offers **"Skip to 1:00 PM"** once the dose that was due has
been completed. It moves the simulated clock to the next routine time and
nothing else — no dose is dispensed, completed or duplicated by skipping, and
earlier history stays exactly as it was recorded. It only ever moves forward,
and it is hidden while a dose is still waiting to be dealt with.

Which medication runs low is **picked at random once per session** and then held
in state, so it never changes as the participant navigates. A reset picks a new
one for the next participant.

Nothing beyond Today and Help exists until the device has been stocked —
`#/medications`, `#/medications/:id`, `#/dose/*` and `#/whats-next` all fall
back to the empty Today, so setup cannot be skipped by typing a URL.

Two different physical actions, kept linguistically separate:

- **Load medication** — putting the pharmacy pack into the device (activity 1).
- **Dispense medication** — the device releasing the dose that is due now
  into the tray (activity 2).

## Facilitator mode

For the research team at the user-testing fair:

- **Laptop:** `Ctrl` + `Shift` + `D`
- **Tablet:** tap the date under the greeting **five times**
- Close with `Esc`

Controls: jump to any of the three session stages, see (or pin) which
medication is low this session, toggle the optional prescription-change
scenario, and reset the session for the next participant. Reset returns to an
empty device at `#/today`, scrolled to the top, with a fresh random pick.

The three activities run in sequence on their own — these controls are for
resetting, recovering and demonstrating.

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
