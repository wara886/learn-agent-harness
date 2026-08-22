# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + TypeScript strict + Vite static SPA deployed to GitHub Pages. Lessons run as deterministic local simulations without a backend or model API.

## Users

The primary user is an application developer who can read basic JavaScript, TypeScript, or Python and has used a chat or coding Agent, but has not maintained an Agent runtime. They want to compare Pi and DeepSeek Harness, connect visible Agent behavior to real mechanisms, and find the right extension point before changing either codebase.

## Product Purpose

Learn Agent Harness starts from a visible Agent task, lets the learner predict and change one input, then names the mechanism behind the observed state change. The current beta proves this approach with three DeepSeek Harness lessons and the first Pi comparison lesson.

## Positioning

The learning path is organized by executable user tasks rather than package directories or an architecture-first syllabus. Every Pi and DeepSeek Harness product fact is tied to a fixed source commit, while deterministic teaching demonstrations are labeled separately from runtime behavior.

## Operating Context

The first visit begins with a task to find a release port, not a course catalog. A learner predicts the next action, runs a local deterministic demonstration, observes three states, changes one variable, and completes a transfer check. Deeper implementation and source evidence remain optional.

## Capabilities and Constraints

- The current beta covers the task-based interactive classroom direction, three DSH lessons, one Pi comparison lesson, nine fixed-source claims, desktop and 390 px flows, and a five-person usability gate.
- The DSH lessons cover a tool-call round trip, Session event projection, and reversible tool registration; the first Pi lesson covers its tool-result round trip.
- Demonstrations do not call a model, require an API key, or represent a production DeepSeek Harness API.
- The current beta remains unvalidated until five target learners complete the recorded M4 gate.
- DeepSeek Harness product fixes, real model execution, authentication, analytics infrastructure, and the full curriculum are out of scope.

## Brand Commitments

The confirmed direction is “任务式互动课堂”: light neutral surfaces, reading and runtime results first, and limited teal, coral, and yellow roles for request, action, and result states. The interface must not resemble a dark engineering console.

## Evidence on Hand

- Product requirements and milestone gates: `docs/product/REQUIREMENTS.md`.
- Three-lesson content outline: `docs/product/OUTLINE-v1.md`.
- Fixed-source claim registry: `docs/product/claims-v1.yaml`.
- DeepSeek Harness fact baseline: `deepseek-harness@b150a551b8d465e31e418e1b2eaf5e79bbb7d28e`.
- Pi Agent Harness fact baseline: `earendil-works/pi@c49906ec77788625aacbdc53ebca6fbe65bd20f5`.
- Upstream drift review: `research/upstream-baseline-audit-2026-08-22.md`.
- Reference course baseline: `onychen/learn-dsh@249f4a0e9622917c8d315c672c87b96401a0c7d4`.
- No testimonials, adoption metrics, or validated usability results exist before the M4 sessions.

## Product Principles

1. Let the learner act and observe before naming the mechanism.
2. Change one variable and make one state transition unmistakable per lesson.
3. Separate deterministic teaching models from fixed-commit product facts.
4. Keep engineering depth available without putting it in the default path.
5. Treat demonstrated understanding, not page views or clicks, as completion.

## Accessibility & Inclusion

The primary path must work at 390 x 844, at 200% zoom, and by keyboard. Controls require visible focus, status changes use text in addition to color, reduced-motion preferences are respected, and the implementation phase must ship without P0 or P1 accessibility defects.
