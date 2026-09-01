# DECO3200 Medication Management Prototype

## Project Context

This is a University of Sydney DECO3200 interactive prototype for a user-testing fair.

The prototype explores medication management for older adults who independently manage multiple long-term medications.

This is a USER TESTING PROTOTYPE, not a production healthcare application.

## Technology

- React
- TypeScript
- Vite
- CSS
- GitHub Pages
- Frontend only

## Critical Constraints

- NO backend
- NO database
- NO Supabase
- NO authentication
- NO API integrations
- NO real pharmacy integrations
- NO real medical data
- NO server-side functionality

All prototype data should be hard-coded locally in TypeScript/JSON.

Use React frontend state for interactions.

Refreshing or resetting the prototype may return it to its initial state.

## Primary Device

Design primarily for an iPad/tablet used at a physical user-testing fair.

Also keep the interface usable on a laptop.

Prioritise touch interaction rather than mouse-specific behaviour.

## Target Users

Older adults independently managing multiple medications.

Therefore prioritise:

- Very large readable text
- Large touch targets
- High contrast
- Simple language
- Minimal navigation
- Clear hierarchy
- Icons accompanied by text
- Clear Home and Back actions
- Avoid small scrolling regions
- Avoid unnecessary settings
- Avoid clutter

## Core Prototype Flow

Highest priority interaction:

Home
→ Medication Due
→ Dispense
→ Confirmation
→ What's Next

Second major flow:

Prescription Changed
→ View Change
→ Understand / Acknowledge Change

## Other Important Prototype States

The prototype may include:

- Today's medication schedule
- Morning / afternoon / evening timeline
- Completed medication
- Medication due now
- Upcoming medication
- Missed medication
- Medication details
- Current medication list
- Previous dispense/confirmation history
- "Did I already take it?" support
- Pharmacy verification status

## Simulated Dispensing

There is NO real dispensing hardware connection.

When the user presses Dispense:

- simulate the action visually
- use polished animation
- show a clear success state
- show the recorded dispense time

Do not imply the system can prove that medication was swallowed.

## Prescription Changes

The prototype should clearly communicate changes such as:

- START
- STOP
- CHANGED

Where appropriate show:

- previous dose
- new dose
- when the change begins
- who verified the change

Keep this highly visual and easy to understand.

## Facilitator Mode

Include a discreet facilitator/demo mode for the research team.

It should allow testers to quickly trigger scenarios such as:

1. Morning medication due
2. Prescription changed
3. User unsure whether medication was already taken
4. Missed dose
5. Reset prototype

This should be accessible without a backend.

## Development Principles

- Keep architecture simple.
- Do not overengineer.
- Prefer reusable React components.
- Keep mock data separate from UI components.
- Keep screens/components organised.
- Use TypeScript properly.
- Avoid unnecessary dependencies.
- Ensure `npm run build` succeeds.
- Maintain GitHub Pages compatibility.
- Do not introduce backend services unless explicitly requested.

## Git

Claude may edit files, create files, run development commands, lint, test and build locally.

Do not push to GitHub unless explicitly instructed by the user.