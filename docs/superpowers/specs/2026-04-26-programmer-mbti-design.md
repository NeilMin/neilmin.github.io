# Programmer MBTI Design

Date: 2026-04-26
Project: `neilmin.com/programmer-mbti/`
Status: approved in conversation, documented before implementation

## Goal

Build a standalone front-end static web app that feels like a polished personality assessment product, while the content is a satirical but recognizable portrait of North American / Bay Area software engineers.

The product must satisfy three layers at once:

1. Credibility: questions should feel grounded in real engineering work and team life.
2. Virality: result names, result copy, and the share card should be screenshot-friendly.
3. Utility: users should feel the result matches either themselves, their coworkers, or their dating-app matches.

## Audience

Primary audience:

- North American / Bay Area Chinese software engineers
- Adjacent tech workers in the same orbit

Secondary audience:

- Broader Chinese-speaking engineers who still understand Silicon Valley work culture

The Chinese version should optimize for Bay Area / North America first. A future English version may diverge instead of being a strict translation.

## Brand

External product name:

- `程序员 MBTI`

Internal framework name:

- `SHIP Framework`

Suggested subtitle:

- `基于 SHIP 四维框架的北美程序员工作人格测试`

`SHIP` is the product shell. The 16 result codes still come from the four measured dimensions.

## Tone

Target tone is `A+`:

- professional on the surface
- sarcastic and specific in the middle
- slightly empathetic at the end

The product should sound like it understands:

- PR / CL review pain
- blind spots of AI-assisted coding
- Bay Area career anxiety
- TC / promo / PIP / vest / H1B / layoff pressure
- the difference between “tech passion” and “survival-mode employment”

It should not become a pure meme generator or a low-effort insult machine.

## Core Framework

The test replaces classic MBTI with four custom software-engineering dimensions.

### S = Source

Code source preference.

- `C = Copilot`
- `T = Typecraft`

Interpretation:

- `C`: relies more on AI, generation, scaffolding, and copy-adaptation
- `T`: prefers hand-crafted logic, manual control, and writing from scratch

### H = Hierarchy

Architecture and abstraction preference.

- `O = Overdesign`
- `A = ASAP`

Interpretation:

- `O`: default instinct is decoupling, extensibility, architecture, and future-proofing
- `A`: default instinct is ship-now, patch-now, and clean up later if ever

### I = Investigation

Debugging and diagnosis style.

- `L = Logic`
- `P = Pray`

Implementation note:

- internal question scoring will use `R` for the Pray side to avoid conflict with `P = Purpose`
- user-facing results will still show `P`

Interpretation:

- `L`: logs, traces, source reading, root cause
- `P`: console.log, restart, retries, hotfixes, and vibes

### P = Purpose

Work motivation and identity.

- `G = Geek`
- `W = Worker`

Interpretation:

- `G`: passion-driven, side-project-driven, intrinsically curious
- `W`: survival-driven, compensation-aware, boundary-conscious, clock-out oriented

## Result Grouping

The 16 types are grouped by the first two dimensions for presentation and color coding.

- `CO`: 编排者 / Orchestrator
- `CA`: 速通者 / Sprinter
- `TO`: 匠构者 / Architect
- `TA`: 造物者 / Builder

This grouping should drive:

- result accent color
- overview cards
- result page visual hierarchy

## Result Naming Rule

Every result uses a double-title:

- `[生活圈层 / 社交气味] + [工作人格]`

Examples:

- `【Patagonia 常驻民 / 面向 Alignment 的赋能架构师】`
- `【Quiet Quitting 信徒 / 防御性 CRUD 专员】`

The left half carries Bay Area / life-world identity.
The right half carries work style and team-role identity.

Result titles should stay short and screenshotable. Later copy edits may tighten them further toward shorter internet-native phrasing.

## Personality Data Structure

The implementation should normalize the approved 16 personalities into:

```ts
interface Personality {
  code: string;
  group: string;
  title: string;
  quote: string;
  description: string;
  strengths: string;
  risks: string;
  lifestyle: string;
  environment: string;
}
```

Important result-page requirement:

- `lifestyle` is the main punchline field and should receive special visual emphasis.

## Question System

### Count and Distribution

- 20 total questions
- 5 questions per dimension
- all questions use a 7-point Likert scale
- each question contributes to exactly one dimension

Question mix target:

- around 70 percent scenario-based
- around 30 percent self-assessment / attitude-based

### Question Style Rules

Questions should be:

- short enough to read quickly
- concrete enough to trigger instinctive answers
- broad enough for engineers across stacks
- flavored with North American / Bay Area tech life

Question writing constraints:

- avoid narrow stack-specific assumptions
- use cross-stack workplace language
- use local tech wording such as `Deploy`, `Push to Prod`, `PR / CL`, `Perf Review`, `PIP`
- use Chinglish naturally, not excessively

The current draft set is stabilized around 20 to 45 Chinese characters per prompt.

### Question Data Structure

```ts
type Dimension = "S" | "H" | "I" | "P";
type Pole = "C" | "T" | "O" | "A" | "L" | "R" | "G" | "W";

interface Question {
  id: string;
  dimension: Dimension;
  kind: "scenario" | "attitude";
  prompt: string;
  agreementPole: Pole;
  disagreementPole: Pole;
}
```

## Scoring Model

Chosen approach:

- simple per-dimension accumulation
- no Manhattan-distance personality matching

Why:

- the product already has exactly four binary dimensions and exactly sixteen combinations
- users should be able to understand why they got their result
- the bars should directly map to measured behavior, not hidden nearest-neighbor logic

### Likert Mapping

Map the 7-point scale to a signed weight:

- `Strongly Agree = +3`
- `Agree = +2`
- `Slightly Agree = +1`
- `Neutral = 0`
- `Slightly Disagree = -1`
- `Disagree = -2`
- `Strongly Disagree = -3`

Interpretation:

- positive weight goes toward `agreementPole`
- negative weight goes toward `disagreementPole`

Each dimension has 5 questions, so the raw dimension score range is:

- `-15` to `+15`

### Type Resolution

Each dimension resolves to one letter by score sign.

Example:

- `score >= 0` on a `C/T` question set resolves to `C`
- `score < 0` resolves to `T`

Tie behavior:

- exact zero resolves to the `agreementPole`
- the displayed percentage remains `50 / 50`

### Percentage Bars

Each dimension should render as a binary percentage bar, for example:

- `80% Copilot vs 20% Typecraft`

Suggested formula:

```ts
leftPercent = Math.round(((score + 15) / 30) * 100);
rightPercent = 100 - leftPercent;
```

This preserves:

- `-15 => 0 / 100`
- `0 => 50 / 50`
- `+15 => 100 / 0`

## UI Architecture

### Overall Product Flow

1. Landing / intro
2. Question flow
3. Result page
4. Share card export

### Landing Page

Must communicate:

- polished assessment product
- SHIP framework
- estimated time
- screenshot-worthy seriousness

### Question Page

Must include:

- one-question-at-a-time or sectioned-question flow
- 7-point Likert scale
- visible progress
- clear left/right semantic labels per question

Visual reference direction:

- strongly inspired by 16Personalities interaction patterns
- not a pixel-for-pixel clone

### Result Page

Required sections:

1. Hero
   - code
   - double-title
   - quote
2. Four percentage bars
   - Source
   - Hierarchy
   - Investigation
   - Purpose
3. Description
4. Strengths
5. Risks
6. Environment
7. Lifestyle and social profile
   - must be visually emphasized for sharing and screenshots
8. Share / restart actions

## Tech Stack Choice

Chosen stack:

- React + TypeScript + Vite

Why:

- the app has enough UI state and repeated components to justify React
- result composition, percentage bars, and share-card rendering are easier to structure as components
- Vite gives a simple build without introducing backend complexity

### Hugo Integration

Recommended source location:

- app source in a dedicated subdirectory inside the repo

Recommended output:

- build into `static/programmer-mbti/`

Requirements:

- asset paths must be safe for deployment under `/programmer-mbti/`
- all app assets should be local to avoid share-card CORS problems

## Share Card Strategy

Chosen approach:

- generate a shareable image from a dedicated result-card DOM subtree
- use a client-side DOM-to-image library

Preferred direction:

- use local fonts and local placeholder / result art assets
- avoid external fonts and cross-origin images

Why:

- CORS becomes much simpler
- generated cards are deterministic
- the product remains fully static

## Accessibility and Copy Constraints

- Chinese first for this version
- copy should remain understandable to engineers outside a single company or stack
- Bay Area flavor should appear in wording, not block comprehension
- humor should target recognizable work culture, not protected identities

## Open Items That Remain Intentionally Deferred

- exact final visual design system
- final asset pack for character illustrations
- English version divergence strategy
- question calibration after real-user testing

## Immediate Next Implementation Steps

1. Normalize approved personality copy into `personalities.ts`
2. Normalize approved question set into `questions.ts`
3. Implement score calculation utilities
4. Build React app shell and routing state
5. Implement result page and share-card export
6. Build into `static/programmer-mbti/`
7. Verify local Hugo integration
