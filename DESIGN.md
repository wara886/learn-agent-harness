# M0 Design Direction

## Status

Confirmed for low-fidelity validation on 2026-08-15. This file records the M0 direction, not a production visual system.

## Thesis

“任务式互动课堂” presents one concrete job, one main action, and one observable state transition before it introduces terminology. It rejects the default documentation-homepage pattern of navigation, architecture, and lesson catalog before action.

## Use Scene

An application developer uses the lesson beside an editor during daytime desk work. The interface is light, quiet, and scan-oriented; the task and runtime result remain readable without adopting a terminal aesthetic.

## First Viewport

The first viewport contains the task, expected result, approximate time, current state, a prediction control, and the single main action. Desktop adds a compact three-lesson rail. At 390 px, lesson navigation becomes a compact top control so it never pushes the task below the fold.

## Visual Roles

- Neutral paper: page and reading surfaces.
- Ink: headings, labels, and primary text.
- Teal: request and active action.
- Coral: changed or unavailable input.
- Yellow: resolved result and attention that does not imply an error.

Color never carries status alone. Each state also has a short verb phrase and a stable position in the three-row trace.

## Interaction Grammar

- Prediction uses a segmented choice.
- The main operation is the only filled button in the task area.
- The trace retains all three rows while the active and completed states change.
- Each lesson ends with one plain-language prompt before exposing a term.
- Evidence and source details remain outside the M0 prototype.

## Responsive Rules

- Desktop uses a 220 px lesson rail and one continuous work surface.
- Mobile uses one column, full-width controls, and a sticky compact lesson switcher.
- Fixed control heights and stable trace rows prevent layout movement during state changes.
- Text size does not scale with viewport width.

## Low-Fidelity Limit

The prototype uses system fonts, flat borders, and no decorative imagery or production motion. Its purpose is to test hierarchy, action finding, state comprehension, and cross-device flow before M1 creates the React application.
