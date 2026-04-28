+++
date = '2026-04-28T22:45:00-07:00'
title = 'After Seeing MBTI and SBTI Everywhere, I Built a Programmer Personality Test'
description = 'A write-up on how I got inspired by the recent wave of personality-test projects and ended up building a programmer personality test that looks serious on the outside and is full of programmer stereotypes on the inside.'
keywords = ['MBTI', 'SBTI', 'programmer personality test', 'Vite', 'React', 'GitHub Pages', 'AI illustration', 'vibe coding']
slug = 'building-a-programmer-personality-test'
translationKey = 'building-a-programmer-personality-test'
+++

A little while ago, I kept running into personality-test projects everywhere.

Some of them were the familiar polished MBTI-style sites, especially things like [16Personalities](https://www.16personalities.com/), where the whole experience feels surprisingly complete and serious. Others were much more online and much more unserious in tone, like [SBTI](https://sbti.unun.dev/), which feels almost designed to be screenshotted, forwarded, and argued about. On top of that, I also saw a few more niche variants floating around, including programmer-themed ones and projects like [cbti-test](https://github.com/liyupi/cbti-test), which showed how far you could push a pure frontend quiz product.

After seeing a few of those in a row, I had a very simple thought:

**What if I built one for programmers too?**

And not just a quick joke page, but something a little more committed: a site that looks like a serious personality assessment on the outside, while the actual questions and results are clearly about the very specific ways programmers behave at work.

## What interested me was the contrast

If you just make a “programmer MBTI,” it is very easy for it to turn into a disposable meme page. You laugh, send it to a friend, and forget about it the next day.

I wanted something a little more specific than that.

The interesting part to me was the contrast:

- the interface should feel real
- the interaction should feel real
- the result page should feel real
- but the content should quietly be about programmer habits, coping mechanisms, and work-brain damage

Things like:

- do you actually write code, or do you mostly orchestrate AI into writing it for you?
- are you the kind of person who hears “small internal tool” and immediately starts talking about architecture?
- when something breaks, do you read logs and trace the source, or do you add five `console.log`s and hope the restart fixes it?
- are you in this because you love tech, or because you love not getting PIP’d before vesting?

Those are funny questions, but they are also concrete enough that they feel like actual behavior rather than vague personality labels.

## The hard part was not coding it

This project started out pretty fuzzy.

At first it was just a vibe:  
I wanted to make a programmer personality test, ideally one that felt closer to the North American Chinese tech-worker context than to generic internet programmer humor.

But once you actually start building something like this, you quickly realize there are a lot of decisions hiding underneath that initial idea.

For example:

- Should it start in Chinese only, or be bilingual from the beginning?
- Should it reuse traditional MBTI axes at all?
- Should the result page feel like a formal report or more like a shareable poster?
- Should the frontend use a router?
- Should deployment live under a path inside my main blog or on its own subdomain?
- Should the English version be a translation, or should it be rewritten naturally?

None of those questions looks huge on its own, but together they decide whether the final thing feels like a toy or a real product.

That was probably my biggest takeaway from this build:

**the part that takes time is not implementation, it is forcing all the product decisions to become explicit.**

Sometimes that meant arguing over code. Sometimes it meant arguing over one line of copy, how aggressive a result title should sound, or whether the quiz should feel more like a real assessment or more like an internet joke.

Those choices sound soft, but they end up shaping the entire product.

## I ended up making a custom four-axis framework called SHIP

At some point I stopped trying to map everything back to classic MBTI and just made a custom framework for the app.

I called it `SHIP`.

Partly because the acronym reads well, and partly because it fits the culture: you can write code, talk architecture, and debate abstractions all day, but eventually the whole job is still about shipping.

The four dimensions ended up being:

### 1. Source: where does your code actually come from?

- `C = Copilot`
- `T = Typecraft`

In other words:

- are you the kind of person who sees repetitive work and immediately lets Gemini, Claude, or Copilot generate the skeleton?
- or are you still the kind of person who wants to hand-write the core logic even if AI already produced something usable?

### 2. Hierarchy: how addicted are you to architecture?

- `O = Overdesign`
- `A = ASAP`

Some programmers see a basic CRUD feature and immediately start thinking about:

- decoupling
- scalability
- HA
- backward compatibility
- reusable platform-level services

Other programmers are only thinking one thought:

**Can this get pushed to prod tonight?**

### 3. Investigation: is your debugging style logical or mystical?

- `L = Logic`
- `P = Pray`

Some people see a production issue and go straight to logs, traces, and source code. Others do some combination of:

- add a few prints
- restart first
- write a defensive fallback script
- if the service is back up, root cause can wait

### 4. Purpose: what is actually driving you?

- `G = Geek`
- `W = Worker`

Some people really will spend a weekend building a side project, trying a new framework, or reading technical docs for fun.

Others are much more directly driven by:

- perf review
- promo
- PIP
- H1B / PERM pressure
- layoff anxiety
- getting out of work on time

The more I worked on it, the more I liked these axes. They are obviously satirical, but they are still grounded enough to feel recognizable.

## I kept the scoring algorithm deliberately simple

On the implementation side, I had a very strong bias here:

**I did not want fake complexity.**

It would have been easy to dress the project up with some more mysterious matching system, nearest-neighbor logic, or personality vectors that sound more “scientific.” But for this product, I honestly thought that would make it worse.

The structure is already simple:

- 4 dimensions
- 2 poles per dimension
- 7-point Likert answers

So the scoring model stayed simple too:

- each question belongs to one dimension
- each Likert choice maps to a score from `+3` to `-3`
- each dimension accumulates its own score
- the sign of the score determines the winning pole
- the four winning poles become a result code like `CAPW`

That approach had a few advantages:

- it is easy to explain
- it is easy to test
- it fits the percentage-bar UI naturally
- it let me add bilingual support later without touching the scoring engine

I ended up documenting the scoring logic in the project README in detail for exactly that reason. This kind of project is funny on the surface, but if the internals become harder to reason about than they need to be, it stops being fun to maintain very quickly.

## The technical architecture stayed intentionally restrained

Even though the site looks like a complete product now, the actual architecture is pretty restrained.

I did not put it inside my blog repo. I split it out into its own repository and gave it its own subdomain:

- independent repo
- Vite + React
- static deployment
- GitHub Pages
- custom subdomain: `mbti.neilmin.com`

And I intentionally avoided a few things that would have made it look fancier without actually helping this project:

- no React Router
- no full i18n framework
- no backend
- no database

### Why no router?

Because this app is still fundamentally one flow:

- intro
- questions
- result

If I had introduced a full routing model just to make it look like a bigger SPA, I would have bought myself a bunch of GitHub Pages edge cases for very little benefit.

So the app just uses React state for screen transitions, and the only meaningful URL state it preserves is:

- `?result=CODE`

That way shared result links still work, but the deployment model stays trivial.

### Why no i18n framework?

Later on I added English too.

But I still did not bring in a heavy i18n system, because this project is extremely copy-heavy and I did not want the English version to feel like a translation layer pasted over Chinese source text.

So the structure became:

- one lightweight locale state
- one shared scoring engine
- one shared result-code system
- two separate content layers:
  - Chinese questions
  - English questions
  - Chinese personality writeups
  - English personality writeups

That let the English version sound like natural English instead of translated Chinese.

## The most addictive part turned out to be the character art and the share poster

If I had stopped after the quiz flow and result page, the project would already have been “done enough.”

But personality-test sites are not really judged only by how they read in the browser. They are also judged by what gets screenshotted and forwarded.

That is the point where I got pulled into two extra rabbit holes.

### 1. Making character art for all 16 personas

I wanted something in the general visual family of 16Personalities: clean, low-poly, geometric, readable.

But I still wanted the characters to feel like they belonged to this project’s own world.

At first I thought about generating them individually, but that would have made consistency much harder. So I went with a more scalable workflow:

- generate full character sheets with AI
- cut them into separate assets with a script
- reuse those cutouts across the homepage, result page, and poster

It felt very modern in a funny way: let the model handle the creative batch generation, then let scripts do the tedious mechanical cleanup.

### 2. Building a dedicated vertical share poster

The result page is for reading.

The poster is for sending around.

So instead of expecting people to screenshot the result page directly, I made a dedicated mobile-first vertical poster. It includes:

- the result code
- the title
- the quote
- dimension summaries
- the longer description
- the lifestyle/social profile
- a QR code
- the site URL

And importantly, the QR code does **not** deep-link back to the sharer’s result. It goes to the homepage of the test itself.

That distinction mattered to me:

**the shared result is the content, but the QR code is the acquisition path.**

## In the end, this was really just something I found interesting enough to make

Looking back, this project does not feel like some grand product experiment to me.

It feels more like one of those things that started with: “this would be kind of fun,” and then I actually committed to making it real.

I happened to run into a few personality-test projects in a row, thought the “serious shell, unserious content” contrast was funny, and realized programmers have more than enough specific habits and stereotypes to support that kind of format. So I built one.

The current version already does the things I wanted it to do:

- it feels reasonably polished
- the quiz itself reads well
- the result page works
- the share poster works

But I definitely do not think it is “finished” in some permanent sense. The question wording, the persona copy, the English details, the visuals, and the interactions all still have room to improve.

If you want to try it, it’s live here:

[https://mbti.neilmin.com](https://mbti.neilmin.com)

And if you finish it and think, “this is way too accurate,” then that probably means the joke landed at least halfway.
