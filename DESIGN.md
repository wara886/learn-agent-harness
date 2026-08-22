---
name: Learn Agent Harness
description: A task-first interactive classroom for understanding Agent harness behavior.
colors:
  paper: "#f3f5f0"
  surface: "#ffffff"
  surface-muted: "#e9ece7"
  ink: "#18211f"
  muted: "#56625e"
  line: "#c7cec9"
  line-strong: "#8f9c96"
  teal: "#08776b"
  teal-dark: "#055e55"
  teal-soft: "#d9eee9"
  coral: "#92372a"
  coral-soft: "#f5ddd7"
  yellow: "#765700"
  yellow-soft: "#f5e8ad"
  focus-blue: "#075fb4"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Noto Sans SC, sans-serif"
    fontSize: "48px"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "0"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Noto Sans SC, sans-serif"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "0"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Noto Sans SC, sans-serif"
    fontSize: "16px"
    lineHeight: 1.6
    letterSpacing: "0"
rounded:
  inner: "4px"
  control: "6px"
  pill: "999px"
components:
  button-primary:
    backgroundColor: "{colors.teal}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "11px 16px"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.teal-dark}"
    textColor: "{colors.surface}"
  button-experiment:
    backgroundColor: "{colors.coral-soft}"
    textColor: "{colors.coral}"
    rounded: "{rounded.control}"
    padding: "11px 16px"
    height: "50px"
---

# Design System: Learn Agent Harness

## Overview

**Creative North Star: "任务式互动课堂"**

Learn Agent Harness is a light, quiet, scan-oriented learning workspace used beside an editor during daytime desk work. Each lesson presents one concrete job, one main action, and one observable state transition before it introduces terminology. The interface rejects both a dark terminal aesthetic and a documentation homepage that puts architecture or a course catalog before action.

This direction is confirmed for the DSH and Pi beta as of 2026-08-22. The visual system prioritizes reading and runtime results, uses flat bordered surfaces, and keeps engineering depth available without placing it in the default learning path.

**Key Characteristics:**

- Task and expected result appear before mechanism names.
- DSH and Pi share one interaction grammar while remaining distinct learning tracks.
- Status uses stable position, text, icon, and color together.
- A persistent course directory establishes the full learning structure without replacing the runnable first screen.

## Colors

The palette combines neutral paper and white reading surfaces with restrained teal, coral, and yellow state roles.

### Primary

- **Action Teal** (`#08776b`) marks the main operation, active requests, selected controls, progress, and current navigation.
- **Deep Teal** (`#055e55`) supplies hover states and readable accent text.
- **Soft Teal** (`#d9eee9`) carries selected and active-state backgrounds without turning the interface into a one-hue field.

### Secondary

- **Change Coral** (`#92372a`) names changed or unavailable input and experiment actions; **Soft Coral** (`#f5ddd7`) provides its background.
- **Resolved Yellow** (`#765700`) marks completed or resolved attention; **Soft Yellow** (`#f5e8ad`) provides its background without implying an error.

### Neutral

- **Paper** (`#f3f5f0`) is the page background; **Surface** (`#ffffff`) is reserved for controls, focused work areas, and trace containers.
- **Ink** (`#18211f`) carries headings and primary text; **Muted Ink** (`#56625e`) carries supporting copy.
- **Line** (`#c7cec9`) and **Strong Line** (`#8f9c96`) establish hierarchy on otherwise flat surfaces.
- **Focus Blue** (`#075fb4`) is reserved for the 3 px visible focus outline and must remain distinct from state colors.

**The Redundant Status Rule.** Color never carries status alone. Pair every state color with a short verb phrase, icon, or stable labeled position.

## Typography

**Display Font:** system sans (`-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Noto Sans SC`, `sans-serif`)

**Body Font:** the same system sans stack

**Character:** Familiar platform typography keeps the bilingual learning interface direct and work-focused. Weight and spacing establish hierarchy without decorative display faces.

### Hierarchy

- **Display** (700, 48 px, 1.12): lesson and page titles; reduce to 40 px at 820 px and 34 px at 560 px without viewport-proportional scaling.
- **Title** (700, 21 px, 1.35): panel and section headings; use 20 px at 560 px.
- **Body** (400, 16 px, 1.6): explanations and mobile lesson questions; supporting desktop questions may use 18 px.
- **Label** (680-760, 12-14 px, normal case): navigation, progress, metadata, and status text.

**The Stable Type Rule.** Use fixed breakpoint sizes and zero letter spacing; do not scale type continuously with viewport width.

## Layout

The sticky global header uses a maximum 1180 px inner width. Desktop lesson routes use a maximum 1320 px shell with a 258 px course directory and a flexible content column; course-map and evidence pages use a narrower 920 px reading container. The lesson content uses a compact title and metadata block followed by a two-column workbench with decision controls on the left and the trace on the right.

The course directory is the single navigation model. It groups every lesson under DeepSeek Harness or Pi, shows the current lesson and completion state, and links to the stage overview. On desktop, its panel stays visible beneath the global header and scrolls independently when the full directory exceeds the viewport. A breadcrumb above the lesson states `学习路径 / 当前轨道 / 当前课` without duplicating course switching controls.

The course map remains secondary navigation and never replaces the runnable first screen. It groups lessons by track, gives each group a track heading and count, and presents lessons as a vertical progress chain within that group. Do not flatten DSH and Pi lessons into one undifferentiated catalog.

At 820 px the course directory becomes a sticky 48 px disclosure above the content. It starts collapsed and expands its full tree inline rather than covering the page with a drawer; the expanded tree stays within the viewport. The workbench collapses to one column at the same breakpoint. At 560 px, the expanded directory becomes one column, while the lesson's DOM and visual order remain task, action, trace, explanation, then optional depth; controls become full width and the primary action remains fully visible in the 390 x 844 first viewport. Fixed control heights, reserved hint space, and stable trace rows prevent state changes from shifting the layout.

## Elevation & Depth

The system is flat by default. Paper, white surfaces, borders, and muted fills establish hierarchy; panels and page sections do not float as decorative cards. The only established shadow is the temporary search overlay (`0 12px 30px rgba(24, 33, 31, 0.14)`), where elevation communicates that results sit above the current page.

**The Overlay-Only Shadow Rule.** Use shadows for transient overlays, not for ordinary lesson sections, map groups, or trace rows.

## Shapes

Controls and bounded work surfaces use a restrained 6 px radius. Nested switcher items use 4 px. Pills and circular status nodes use 999 px or a circle only when the geometry communicates progress, state, or selection. Borders are 1 px and carry most separation; page sections remain unframed bands divided by rules.

## Components

### Buttons

- **Primary:** The only filled button in the decision panel is full width, at least 50 px high, teal with white text, and paired with a command icon.
- **Experiment:** The one-variable change action shares the primary button's geometry but uses coral text and a soft coral fill.
- **Prediction and checkpoint choices:** Use bordered, left-aligned controls with a soft teal selected state and `aria-pressed`; disabled choices retain readable state at reduced opacity.
- **Hover / Focus:** Darken or strengthen the relevant border on hover. All interactive elements use the shared 3 px focus-blue outline with a 3 px offset.

### Navigation

- **Course directory:** Group all lessons by track, retain concise task questions, and combine active and completed states without relying on color alone.
- **Mobile directory:** Use an inline disclosure labeled `课程目录 · 当前轨道 课号/总数`; do not use a modal drawer for the current course count.
- **Breadcrumb:** Show hierarchy and current location above the task; course switching remains in the directory.
- **Skip link:** Make `跳到课程内容` the first keyboard-focusable control, keep it offscreen until focus, and target the focusable lesson `main` landmark at `#main-content`.
- **Course map:** Group by track, preserve the vertical progress line within each group, show the task's state change, and use a clear "进入任务" command rather than card-like tiles.

### Lesson Header

Keep the title block compact: track abbreviation and current/total lesson count, one balanced task title, one plain-language question, then a three-item metadata list for expected result, estimated time, and local run mode. Use icons as secondary cues while retaining the text labels.

### Task Workbench

Every track reuses one teaching loop: prediction, main run, three-row trace, one changed input, and a transfer checkpoint. The Pi tool-result lesson uses this same loop to show `toolCall` → `ToolResultMessage` → next assistant answer; the changed result must visibly change the next answer rather than becoming an isolated fact panel.

The trace always reserves all three rows. Current request, changed input, and resolved result use teal, coral, and yellow backgrounds respectively, while labels and details state the transition in words. After the initial run changes from running to observed at 560 px and below, move keyboard focus to the "任务过程" heading and position that heading below the sticky navigation immediately. Do not focus a transient result row.

### Progressive Disclosure

Place the plain-language explanation and transfer checkpoint after observation. Keep minimal code and fixed-source evidence in separate collapsed drawers after the learning path; opening them must not be required to complete a lesson.

## Do's and Don'ts

### Do:

- **Do** keep the course directory obvious while preserving the task, expected result, approximate time, prediction, current state, and main action in the first lesson viewport.
- **Do** reuse the same interaction sequence across DSH and Pi while keeping track labels, counts, terminology, and source evidence distinct.
- **Do** preserve readable text, stable geometry, visible focus, and complete 390 px and 200% zoom paths.
- **Do** use motion only for a running state or focus transfer to newly available content, and honor reduced-motion preferences.

### Don't:

- **Don't** lead with the course map, architecture, package taxonomy, or source evidence.
- **Don't** recreate separate track and lesson switchers outside the shared course directory.
- **Don't** hide pending trace rows or let dynamic labels resize controls and rows.
- **Don't** add decorative imagery, gradients, terminal styling, oversized radii, or shadows to ordinary lesson surfaces.
