---
name: Learn Agent Harness
description: A task-first interactive classroom for understanding Agent harness behavior.
colors:
  paper: "#f5f7fa"
  surface: "#ffffff"
  surface-muted: "#edf1f6"
  ink: "#131722"
  muted: "#5c6675"
  line: "#d4dbe5"
  line-strong: "#9ba8b9"
  graphite: "#151a24"
  graphite-raised: "#202735"
  graphite-line: "#465166"
  on-graphite-muted: "#bac4d3"
  on-graphite-accent: "#aebcff"
  cobalt: "#3157e8"
  cobalt-dark: "#1d3db8"
  cobalt-hover: "#2447cf"
  cobalt-soft: "#e9edff"
  orange: "#c94b2c"
  orange-soft: "#fff0eb"
  experiment-bg: "#4a2923"
  experiment-text: "#ffd8cb"
  yellow: "#805500"
  yellow-soft: "#fff1c7"
  success: "#087a55"
  success-soft: "#e2f5ed"
  focus-blue: "#005fcc"
typography:
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace"
    fontSize: "12px"
    lineHeight: 1.5
    letterSpacing: "0"
  display:
    fontFamily: "Aptos, Segoe UI Variable, Segoe UI, Noto Sans SC, sans-serif"
    fontSize: "48px"
    fontWeight: 820
    lineHeight: 1.08
    letterSpacing: "0"
  title:
    fontFamily: "Aptos, Segoe UI Variable, Segoe UI, Noto Sans SC, sans-serif"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "0"
  body:
    fontFamily: "Aptos, Segoe UI Variable, Segoe UI, Noto Sans SC, sans-serif"
    fontSize: "16px"
    lineHeight: 1.6
    letterSpacing: "0"
rounded:
  inner: "2px"
  control: "3px"
  surface: "4px"
  pill: "999px"
components:
  button-primary:
    backgroundColor: "{colors.cobalt}"
    textColor: "{colors.surface}"
    rounded: "{rounded.control}"
    padding: "11px 16px"
    height: "50px"
  button-primary-hover:
    backgroundColor: "{colors.cobalt-hover}"
    textColor: "{colors.surface}"
  button-experiment:
    backgroundColor: "{colors.experiment-bg}"
    textColor: "{colors.experiment-text}"
    rounded: "{rounded.control}"
    padding: "11px 16px"
    height: "50px"
---

# Design System: Learn Agent Harness

## Overview

**Creative North Star: "Agent Flight Recorder / 飞行试验遥测表"**

Learn Agent Harness is a precise, scan-oriented test worksheet used beside an editor. Each lesson reads as a numbered Agent test run: form a hypothesis, observe one deterministic trace, change one input, then transfer the mechanism. The interface rejects both a generic documentation page and a decorative dashboard.

This direction is confirmed for the DSH and Pi beta as of 2026-08-23. Cool telemetry paper, a graphite command surface, cobalt actions, orange experiment states, and fixed run numbers make the learning sequence visible before the learner reads the details.

**Key Characteristics:**

- Task and expected result appear before mechanism names.
- DSH and Pi share one interaction grammar while remaining distinct learning tracks.
- Status uses stable position, text, icon, and color together.
- A persistent course directory establishes the full learning structure without replacing the runnable first screen.
- Every lesson uses stable numbered sections: `01 预测` and `02 观察` are always present; `04 解释` appears after the first observation; `03 迁移` appears after the changed-input experiment and precedes `04` in document order once mounted.

## Colors

The palette combines cool telemetry paper and white reading surfaces with graphite, cobalt, orange, and success-green state roles.

### Primary

- **Action Cobalt** (`#3157e8`) marks the main operation, active DSH requests, selected controls, progress, and current navigation.
- **Deep Cobalt** (`#1d3db8`) supplies readable accent text; **Hover Cobalt** (`#2447cf`) supplies the primary-button hover state.
- **Soft Cobalt** (`#e9edff`) carries checkpoint and active-state backgrounds.

### Secondary

- **Experiment Orange** (`#c94b2c`) names changed input and Pi track identity; the console experiment action uses dark warm brown (`#4a2923`) with pale orange text (`#ffd8cb`).
- **Result Amber** (`#805500`) and **Soft Amber** (`#fff1c7`) mark the resolved trace; **Success Green** (`#087a55`) and **Soft Green** (`#e2f5ed`) mark completion and successful feedback.

### Neutral

- **Paper** (`#f5f7fa`) is the page background; **Surface** (`#ffffff`) is reserved for controls, focused work areas, and trace containers.
- **Graphite** (`#151a24`) carries the global header and prediction console; **Ink** (`#131722`) carries headings and primary text.
- **Line** (`#d4dbe5`) and **Strong Line** (`#9ba8b9`) establish instrument-like hierarchy on flat surfaces.
- **Focus Blue** (`#005fcc`) provides the 3 px visible focus outline; focus never relies on color alone.

**The Redundant Status Rule.** Color never carries status alone. Pair every state color with a short verb phrase, icon, or stable labeled position.

## Typography

**Display Font:** system sans (`Aptos`, `Segoe UI Variable`, `Segoe UI`, `Noto Sans SC`, `sans-serif`)

**Body Font:** the same system sans stack

**Character:** Familiar platform typography keeps the bilingual learning interface direct and work-focused. Weight and spacing establish hierarchy without decorative display faces.

### Hierarchy

- **Display** (820, 48 px, 1.08): map and evidence page titles; reduce to 40 px at 820 px and 34 px at 560 px. Lesson titles use 44 px on desktop and 32 px at 560 px without viewport-proportional scaling.
- **Title** (700, 21 px, 1.35): panel and section headings; use 20 px at 560 px.
- **Body** (400, 16 px, 1.6): explanations and mobile lesson questions; supporting desktop questions may use 18 px.
- **Label** (680-760, 12-14 px, normal case): navigation, progress, metadata, and status text.

**The Stable Type Rule.** Use fixed breakpoint sizes and zero letter spacing; do not scale type continuously with viewport width.

## Layout

The 72 px sticky graphite header uses a maximum 1360 px inner width. Desktop lesson routes use a maximum 1400 px shell with a 292 px course directory and a flexible content column; course-map and evidence pages use a narrower 920 px reading container. The lesson content uses a compact run header and bordered telemetry strip followed by a two-column workbench with the dark prediction console on the left and the numbered trace rail on the right.

The course directory is the single navigation model. It groups every lesson under DeepSeek Harness or Pi, shows the current lesson and completion state, and links to the stage overview. On desktop, its panel stays visible beneath the global header and scrolls independently when the full directory exceeds the viewport. A breadcrumb above the lesson states `学习路径 / 当前轨道 / 当前课` without duplicating course switching controls.

The course map remains secondary navigation and never replaces the runnable first screen. It groups lessons by track, gives each group a track heading and count, and presents lessons as a vertical progress chain within that group. Do not flatten DSH and Pi lessons into one undifferentiated catalog.

At 820 px the course directory becomes a sticky 48 px disclosure above the content. It starts collapsed and expands its full tree inline rather than covering the page with a drawer; the expanded tree stays within the viewport. The workbench collapses to one column at the same breakpoint. At 560 px, the expanded directory becomes one column, while the lesson's DOM and visual order remain task, action, trace, explanation, then optional depth; controls become full width and the primary action remains fully visible in the 390 x 844 first viewport. Fixed control heights, reserved hint space, and stable trace rows prevent state changes from shifting the layout.

## Elevation & Depth

The system is flat by default. Paper, white surfaces, graphite fills, borders, and muted state backgrounds establish hierarchy; panels and page sections do not float as decorative cards. The only established shadow is the temporary search overlay (`0 12px 30px rgba(24, 33, 31, 0.14)`), where elevation communicates that results sit above the current page.

**The Overlay-Only Shadow Rule.** Use shadows for transient overlays, not for ordinary lesson sections, map groups, or trace rows.

## Shapes

General surfaces and controls use a restrained 4 px radius. Command buttons and selected navigation controls use 3 px; small instrument labels use 2 px. Pills and circular status nodes use 999 px or a circle only when the geometry communicates progress, state, or selection. Borders are 1 px and carry most separation; page sections remain unframed bands divided by rules.

## Components

### Buttons

- **Primary:** The only filled button in the decision panel is full width, at least 50 px high, cobalt with white text, and paired with a command icon.
- **Experiment:** The one-variable change action shares the primary button's geometry but uses pale orange text on a dark warm background inside the graphite console.
- **Prediction and checkpoint choices:** Use bordered, left-aligned controls with `aria-pressed`; prediction uses solid cobalt with white text when selected, while the checkpoint uses soft cobalt. Disabled choices retain readable state at reduced opacity.
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

The trace always reserves all three rows and numbers them `01` through `03`. Current request, changed input, and resolved result use cobalt, orange, and amber backgrounds respectively, while labels and details state the transition in words. Green is reserved for completed state and successful feedback. Pi lessons reuse this trace to show tool-result round trips, application-message conversion, and Extension reload without introducing track-specific controls. After the initial run changes from running to observed at 560 px and below, move keyboard focus to the "任务过程" heading and position that heading below the sticky navigation immediately. Do not focus a transient result row.

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
- **Don't** add decorative imagery, gradients, faux terminal prompts, oversized radii, or shadows to ordinary lesson surfaces.
