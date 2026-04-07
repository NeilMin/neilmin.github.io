+++
date = '2026-04-06T13:30:00-07:00'
title = 'How I Vibe-Coded This Blog Website Just to Publish One Post'
description = 'How I built a bilingual Hugo blog on GitHub Pages with PaperMod, Vercount analytics, Giscus comments, a custom domain, and a few lessons from debugging a frustrating 404 deployment issue.'
keywords = ['Hugo', 'GitHub Pages', 'PaperMod', 'Vercount', 'Giscus', 'SEO', 'bilingual blog', 'custom domain', '404 debugging']
slug = 'building-my-hugo-blog-with-github-pages'
translationKey = 'why-i-built-this-blog'
+++

This whole thing, honestly, was basically the software version of buying a dish of vinegar and ending up making an entire batch of dumplings.

A while ago, I ran into a bug that was both obscure and genuinely hard to fix. Stack Overflow was not giving me anything useful. Google was not giving me much either. In the end I had to grind through it myself and solve it the hard way.

Once I finally got it resolved, my first reaction was that I should write the whole winding story down.

Because if I do not write down problems like that, there is a very good chance that a few months later even I will no longer remember how I reasoned my way through them. And after burning that many brain cells on one issue, not turning it into something useful would feel like a waste.

But then the obvious problem showed up:

I had written the post. But where exactly was I supposed to publish it?

## The real starting point was not "I want a personal website"

I did not begin with some grand plan to build a personal website.

My actual thought process was much simpler: I just wanted a decent place to publish that debugging write-up.

So I spent some time researching where it should live.

On the Chinese internet, platforms like CSDN, Zhihu, and Blog Garden were all options. It was not like I had nowhere to post. But they all felt too constrained, and some of those platforms have a reputation for pulling stunts that make your content feel like it does not fully belong to you anymore. A clean technical post gets wrapped in platform noise, and that was not what I wanted.

Platforms like Medium or Blogger feel lighter, sure, but at the end of the day you are still renting space in someone else's house. You can decorate it a little, but the walls are not yours, the address is not yours, and if the platform changes its rules, some part of your setup stops being fully under your control.

I was not doing this to monetize anything either. As an engineer, I ended up at the most predictable conclusion possible:

If I wanted full control, I should just build the thing myself.

And once that idea showed up, the rest of the stack choice became pretty straightforward. Static hosting, free infrastructure, a workflow that fits naturally with Git, and no need to think too hard about servers. It is hard to imagine something more like a proper little digital home than [GitHub Pages](https://pages.github.com/).

## If I was going to build it, I might as well build it properly

When it came to choosing the framework, I looked at the usual suspects first.

- [Hexo](https://hexo.io/) on the Node.js side
- [Jekyll](https://jekyllrb.com/), the old GitHub Pages classic in the Ruby world
- [Hugo](https://gohugo.io/), which has a reputation for being absurdly fast

After comparing them a bit, I ended up choosing Hugo.

The reason was actually very simple: I had seen another site built with Hugo, liked how it looked overall, and for a site this small, the technical differences between these frameworks are not life-or-death anyway.

For the theme, I went with [PaperMod](https://github.com/adityatelange/hugo-PaperMod).

I like how restrained it is. The default look is clean, not noisy, and it keeps the content front and center. For someone like me, who mostly wants to write technical posts and keep a lightweight personal site around them, it was a really solid starting point.

If you want to build something similar, the basic setup is honestly pretty small:

```bash
# 1. Install Hugo (macOS)
brew install hugo

# 2. Create the site
hugo new site my-blog
cd my-blog
git init

# 3. Add PaperMod as a submodule
git submodule add https://github.com/adityatelange/hugo-PaperMod.git themes/PaperMod
```

There is one small detail here that is worth calling out very explicitly: **PaperMod really should be added as a submodule.**

Do not just `git clone` it into `themes/` and assume you are done. That can look perfectly fine locally and still bite you later when you push to GitHub. Nested repositories and theme directories do not always behave the way people expect, and it is a very easy way to end up with a mysteriously broken site, missing theme files, or a pretty embarrassing 404 situation after deployment. I am, unfortunately, speaking from lived experience here.

## The funniest part is that Vibe Coding actually worked really well

If this had happened a few years ago, the project would still have been manageable, but it absolutely would have been the kind of thing that quietly consumed an entire weekend.

You would have to set up the theme, wire the Hugo config, decide how bilingual routing should work, figure out deployment, get GitHub Actions going, deal with the custom domain, tweak the styling, wire comments, wire analytics, and then spend way too much time on front-end details that individually look tiny but collectively refuse to go away.

Now we live in the era of **Vibe Coding**.

What really stood out to me this time is that AI was not most useful because it magically knew what I wanted. It was useful because once I knew the direction, it could help me chew through a huge amount of tedious, fragmented, annoying implementation work.

This site did not come together because an AI produced one perfect answer. It came together because I kept refining the target and using AI to try things with me:

- how to structure bilingual routes
- how to pair English and Chinese content files
- how to make the language switcher prefer the current page's translation instead of always dumping you back on the homepage
- how fast the animated glow background should move
- how to make it visible enough in light mode
- what to use for page views after the first counter turned out to be flaky
- how to wire comments so the UI language follows the page language

And a lot of those details were not "one and done" decisions. We went back and forth on them many times.

The bilingual content convention, for example, ended up being very simple:

- English lives at `/`
- Chinese lives at `/zh/`
- default English content files stay unsuffixed
- Chinese translations use `.zh.md`

So it looks like this:

```text
content/posts/my-post.md
content/posts/my-post.zh.md
```

Even with vibe coding making things much easier, none of this really came out perfect in one shot. A lot of the site was not "AI gave me the final answer." It was much closer to me standing next to a very fast collaborator and repeatedly saying:

This is not right, move it a bit left.

That animation is too fast, slow it down.

That color is ugly, try another one.

This interaction feels like magnets. I want it to feel like something soft being gently pushed aside.

That is why I have grown to like this workflow so much. I am not personally typing every line, but I am still doing the design work, the judgment, and the steering. AI feels less like a replacement and more like a teammate with a lot of execution stamina who does not get tired of being told to tweak things one more time.

## Once I started, I could not help making it more complete

Originally I only wanted a place to publish one technical post.

But once the site was half-built, the dangerous sentence showed up in my head:

Well, since I am already here, I might as well finish it properly.

And that was how things escalated.

### 1. Bilingual support

I already knew I wanted the site to support both Chinese and English, so from the beginning this was not designed as a single-language blog.

The current structure is:

- English at `/`
- Chinese at `/zh/`
- posts, search, and resume pages all follow the bilingual model

On paper, that sounds like just a few Hugo config settings. In reality, the annoying part is all the edges: should menus be localized, should search be language-specific, should the language switcher jump to the homepage or the translated page, should the comment widget switch its UI language too? None of those decisions is huge on its own, but together they determine whether the site feels properly bilingual or merely "technically available in two languages."

### 2. GitHub Actions deployment

For deployment, I kept it simple and just let GitHub Actions handle the job.

The Pages workflow is already in `.github/workflows/gh-pages.yml`, and the day-to-day workflow is basically:

1. Change content or styling locally
2. `git add`
3. `git commit`
4. `git push`

Then CI/CD takes care of the rest.

This has one dangerous side effect: it lowers the cost of polishing things so much that you start fixing everything. Sometimes even one sentence that feels slightly off is enough to trigger a whole new commit.

And honestly, Hugo is very pleasant in this setup. Build with `hugo --gc --minify`, let GitHub Pages host the output, let GitHub Actions publish it, and you are done. There is almost no extra ops drama in the middle, which is exactly the level of complexity I wanted for a content-first site.

### 3. Buying the domain

Using `neilmin.github.io` would have been perfectly fine.

But then I made the mistake of checking domain prices and discovered that a `.com` with my name on it cost something like ten or twelve dollars a year. That is a very effective way to destroy a person's self-control. For less than the cost of a meal, I could have a little corner of the internet with my own name on it. Hard to argue with that.

So I bought `neilmin.com`.

Functionally, a custom domain does not change much. Emotionally, it changes a lot. The moment you type that URL into the browser, the site immediately feels more real and more yours.

## After the basics worked, the little extras became the most addictive part

Once a site like this is functional, the next wave of fun is usually not "can it work?" but "can I make it feel a little nicer?"

That was the point where I started adding extra little toys.

### The animated glowing background

If you are reading this on a desktop, the homepage and search page should have a few softly moving glowing shapes in the background.

That effect is not an image or a video. It is just CSS plus a bit of JavaScript. It started as a mesh-gradient-like atmosphere thing, and then I kept iterating until it became much more interactive.

The funny part is how many rounds it took to get the feel right. The first version looked too mechanical. Another version felt weirdly magnetic and slippery. Eventually I rewrote the interaction to feel more like soft bubbles being gently pushed aside, using `lerp`-style easing and a smoother falloff curve. Now when you move the mouse through it, it should feel more like you are nudging something viscous than poking three glowing objects that want to fly away.

### Page views: from Busuanzi to Vercount

At first I tried the usual Chinese blog counter, Busuanzi.

But these days its reliability feels... situational. So I eventually switched to [Vercount](https://www.vercount.one/).

What I really liked there was that it is almost a drop-in replacement for Busuanzi at the DOM level.

In practice that meant I barely had to touch the existing `busuanzi_*` IDs. I could swap the script source, keep the markup mostly intact, and move on. That is exactly the kind of migration I appreciate when something is already wired into templates and I do not want to rebuild the whole feature from scratch.

### Giscus comments

For comments, I ended up choosing [Giscus](https://giscus.app/).

I really like the model: no separate database, no extra backend to maintain, just GitHub Discussions underneath. For a small site that already treats GitHub as home base, that is a very natural fit.

And it matches the rest of the site nicely:

- no custom comment backend to operate
- dark mode support out of the box
- comment UI language can follow the page language

So now the Chinese posts render a Chinese Giscus UI, and the English posts render an English one. Those details are small, but once they line up, the whole site feels much more coherent.

And honestly, this is exactly the kind of thing that makes projects like this addictive. You think you are just adding comments, and then a minute later you care about whether the comment UI language switches correctly and whether the theme tracks light/dark mode properly too.

## Looking back, this really was a full-on dumpling project

At the beginning, I just wanted to publish one technical write-up.

By the end, I had:

- set up Hugo
- wired in PaperMod
- implemented bilingual support
- added search
- configured GitHub Pages deployment
- bought a custom domain
- added visitor stats
- added comments
- tuned the animated background
- refined the interaction feel

All that because I wanted somewhere to post one debugging story.

And honestly, I am glad it happened.

On one level it solved a very practical problem: I now have a place that is fully mine, where I can publish the kinds of things I actually want to write. On another level, it brought back a very familiar kind of engineering joy, the kind that says, "Well, since I already got this far, I might as well make it a little better."

## Final thoughts

That original bug write-up is now out in the world.

And this site, in a way, is the side effect it dragged into existence.

If you happened to land on this post, feel free to scroll down and leave a comment. Log in with GitHub, say hi, and if you want, help me test whether this whole setup is actually as stable as I think it is.

Because for all the extra polish it has now, the origin story of this site is still extremely simple:

I just wanted a good place to publish one post that felt worth preserving.
