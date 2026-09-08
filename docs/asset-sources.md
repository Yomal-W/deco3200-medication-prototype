# Medication imagery — sources and decisions

## Decision

Medication imagery in this prototype is **drawn locally as inline SVG**. There
are no photographic assets, no image files and no external image requests.

See [`src/components/TabletShape.tsx`](../src/components/TabletShape.tsx) for the
drawing, and the `appearance` field in
[`src/data/medications.ts`](../src/data/medications.ts) for each medicine's
shape, size, finish and tint.

## Why not photographs

We investigated using real product photography first. We did not use any,
for these reasons:

1. **The canonical open source is retired.** The US National Library of
   Medicine's *Pillbox* was the reference set of openly available pill
   photographs. It was retired on 28 January 2021. Its archived files are
   published with the explicit statement that they are not maintained and
   **should not be used for pill identification**.
   <https://www.nlm.nih.gov/pubs/techbull/ja20/ja20_pillbox_discontinue.html>
   <https://datadiscovery.nlm.nih.gov/Drugs-and-Chemicals/Pillbox-retired-January-28-2021-/crzr-uvwg>

2. **No consistent, clearly licensed set exists for our six medicines.**
   Wikimedia Commons has scattered one-off photographs (for example
   <https://commons.wikimedia.org/wiki/File:Metformin_500mg_Tablets.jpg>) taken
   by different photographers, at different scales, on different backgrounds
   and from different markets. Commercial stock libraries (Getty, iStock) are
   licensed per-use and are not appropriate for a public university prototype.
   A mixed set would have looked inconsistent and would have undermined the
   "one calm product" feel we are testing.

3. **Photographs would overstate what the device can claim.** A medicine's
   physical appearance varies by manufacturer, generic supplier, formulation
   and market. A photograph invites the reading "this is exactly what your
   medicine looks like". An illustration is honestly approximate.

4. **Offline reliability.** The user-testing fair may have unreliable
   internet. Inline SVG is part of the JavaScript bundle, so it renders with
   no additional network request and cannot half-load.

The project brief's own guidance applies here: *"Representative illustrations
are preferable to questionable/inaccurate photographs"* and *"If an image
licensing situation is unclear, do NOT use it."*

## What the illustrations do and do not claim

- They are **illustrative**, not identification data. The interface says so on
  the medication detail screen and on the medications list.
- The medication **name, dose and verified routine remain authoritative**.
  Imagery only supplements them.
- Medicines are told apart by **silhouette and relative size first** — small
  round, round scored, oval, caplet, capsule, large chalky tablet — so
  recognition never depends on colour alone.
- Sizes are drawn in one shared 100-unit space, so tablets are to a
  consistent scale relative to each other across every screen.

## If real imagery is added later

Record here, per image: the source URL, the licence, the attribution required,
and which medication it represents. Do not add an image whose licensing is
unclear. Keep files in `public/medication-images/`, and keep participant-facing
screens free of academic-style source links.
