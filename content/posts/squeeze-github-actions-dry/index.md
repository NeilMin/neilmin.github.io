+++
date = '2026-10-19T00:00:00-07:00'
title = 'How to Squeeze GitHub Actions Dry'
description = "To give every dish on my Stanford dining menu site an AI-generated picture without spending a cent, I turned GitHub Actions' free machines into compute: no GPU, so SDXL runs on CPU at eighteen minutes a picture, on ten machines at once every night."
keywords = ['GitHub Actions', 'free compute', 'Stable Diffusion', 'SDXL', 'RealVisXL', 'ComfyUI', 'CPU image generation', 'matrix', 'Stanford Dining', 'Side Project']
slug = 'squeeze-github-actions-dry'
translationKey = 'squeeze-github-actions-dry'
tags = ['GitHub Actions', 'Side Project', 'Automation', 'AI Image Generation']
draft = false

[cover]
image = 'cover.jpg'
relative = true
alt = "Stanford Dining Hall Menus, Side by Side: three dining halls' dinners next to each other, each led by a picture of a dish"
+++

Starting in September, I began eating at Stanford's dining halls.

If you want to eat there, you first need to know what's on the menu. But the menu website Stanford provides is stuck twenty years in the past, and it's a real pain to use. You can only see one meal at one hall at a time. Want to compare halls? Click around and select everything all over again. And halfway through you forget what the last hall had, so you go back and look again.

After using it for the first time, I found it really hard to use.

![Stanford's official Dining Hall Menu: pick a hall, a day and a meal, and you get one meal at one hall](img/stanford-official.jpg)
*This is Stanford's official menu site, [rdeapps.stanford.edu/dininghallmenu](https://rdeapps.stanford.edu/dininghallmenu/). Three dropdowns later, you get one dinner at one hall. This hall alone has twenty-some dishes, and you keep scrolling. Want the next hall? Three dropdowns again.*

It's the age of AI. There had to be a better way to check today's menu. My first idea was to have AI write a script that pulls down each day's menus and puts them together into a report of my own, an aggregated menu. Then I could see at a glance what I can eat today, and decide which dining hall to go to.

The first version was really easy, done in no time: the menus of several halls side by side, what each one has tonight, all on one screen. I already owned the domain neilmin.com, so I put it on a subdomain without spending anything extra, and my friends could use it too. That's how [stanford-dining.neilmin.com](https://stanford-dining.neilmin.com) came about.

![stanford-dining.neilmin.com: three halls' dinners side by side](img/our-site.jpg)
*The same day's dinner, three halls side by side.*

As I went, I added two more things: Chinese, and pictures. The dish names are genuinely impossible to decode. "Craveable Grains"? "Magnolia Boil"? What is that supposed to be? So I had AI draw a picture of every dish from its name and its ingredient list. One look tells you whether it's stewed or stir-fried, whether the meat comes as a whole piece or sliced.

## Letting the site run itself

The first version had one problem: I had to do everything by hand, every day. Scrape the new menus locally, draw the new dishes locally, push to GitHub, then wait for it to deploy.

A site that claims to update itself every day, with me updating it by hand every day behind the scenes. That doesn't make sense. By hand for a week, fine. For a month, if I grit my teeth. Any longer, no way. It had to be automated.

Scraping the menus was a bit of a hassle too. Stanford's site is old-school ASP.NET. You can't just build a URL that asks for "Wilbur, Friday dinner": every request has to carry a long string of hidden parameters from the previous page, and that string changes every time, so the requests can only go out one after another. Annoying, but in the end just an engineering problem. Once that was solved, I dropped it into GitHub Actions to run on a schedule every day.

What really gave me a headache was the pictures.

## Pictures need compute, and I didn't want to pay

Generating pictures really eats compute. On my own laptop, a local model (RealVisXL, a photorealistic model in the SDXL family) takes a minute and a half per picture, and the pictures look good. But the moment I wanted it automated, it had to run somewhere that isn't my laptop, and that somewhere needs compute.

So why not just pay to rent a GPU? That never once crossed my mind, not even $5 a month. This was a small thing I could solve by running it locally. I just wanted it to run by itself. I didn't want to spend a single cent on it.

So, free it is.

Search the web for pictures? The dish names are the dining halls' own inventions, so the results often don't match. The copyright situation is murky too, and the quality is all over the place. It just looked bad. Then I found Cloudflare's Workers AI. It gives you a free daily allowance and has ready-made image models, running in the cloud, so my computer doesn't have to be on. Looked perfect.

On Cloudflare we used three image models: SDXL-Lightning, FLUX.1 schnell and FLUX.2 klein. Here's what came out. On the left is the Cloudflare model, on the right my local RealVisXL.

In the next two pairs, the left is SDXL-Lightning:

![Meat Lover's Pizza: left, Cloudflare SDXL-Lightning; right, local RealVisXL](img/pizza-compare.jpg)
*Meat Lover's Pizza*

![Beef Hot Dog: left, Cloudflare SDXL-Lightning; right, local RealVisXL](img/hotdog-compare.jpg)
*Beef Hot Dog*

In the next two pairs, the left is FLUX.1 schnell:

![Grilled Pineapple: left, Cloudflare FLUX.1 schnell; right, local RealVisXL](img/pineapple-compare.jpg)
*Grilled Pineapple*

![Corn Dogs: left, Cloudflare FLUX.1 schnell; right, local RealVisXL](img/corndog-compare.jpg)
*Corn Dogs*

My first reaction: blurrier than an oil painting, obviously AI, like something from the ChatGPT-3 era. Along the way we also tried FLUX.2 klein, and it wasn't great either.

To stop pictures like these, I added a check: after drawing, another model that can see images takes a look, and if the picture is wrong, it gets redrawn. Nice idea, but the free allowance was tight to begin with. A dish often took several pictures to pass. Every picture drawn used up quota, every picture checked used up quota again, and before long the allowance was gone. Once it ran out, the checking model couldn't look at anything either.

After going round and round a few times, it finally clicked: the best results came from the model on my laptop. The model didn't need changing. I just needed a free place to run it.

## GitHub Actions can be compute too

That's when I thought of GitHub Actions.

Most people use Actions like this: push code, tests run automatically, deploys happen automatically. But think about what it actually does: GitHub lends you a Linux machine, runs the steps you wrote, then takes the machine back. Running tests is a bunch of steps. Isn't drawing a picture just a bunch of steps too?

And for public repositories, Actions is free, with no limit on minutes. According to GitHub's docs, this is the free machine you get for a public repository:

| | Free machine for public repositories |
|---|---|
| CPU | 4 cores |
| Memory | 16 GB |
| Disk | 14 GB SSD |
| GPU | None |
| Longest single job | 6 hours |
| Running at once | 20 jobs (free account) |

No GPU. Running SDXL on CPU, one picture takes 17 to 19 minutes, more than ten times slower than my laptop. Honestly, I'd thought of this at the very start, and one look at that speed was enough to rule it out.

Then one day it hit me: back then I had only worked out how long one picture takes, not how many machines I could run at once.

If one machine takes 18 minutes a picture, I'll run ten of them together. Each draws for four hours, so in theory ten machines can draw over a hundred pictures a night. The new dishes that show up each day and need a picture usually number ten or twenty. That's enough, with plenty to spare.

That's probably the most interesting thing I learned from this project. In my head, Actions had always been the thing that runs tests and deploys. It never occurred to me that I could put compute on it.

## Moving image generation onto Actions

The idea was simple. Actually getting it to run was another story.

First, disk. The RealVisXL model file is nearly 7 GB, the machine has 14 GB of disk in total, and a pile of software GitHub preinstalls takes up part of that. .NET, Android SDK, Haskell: I need none of them, so the first thing the job does is delete them to make room for the model. Then it installs the CPU build of PyTorch and ComfyUI. ComfyUI is pinned to exactly the same version as on my laptop, so the picture drawn in the cloud is the one my laptop would have drawn. Downloading the model from Hugging Face every time was too slow, so it lives in the Actions cache. Since it's used every night, the cache stays warm.

Then memory. Once the model is running it takes 15.3 GB of the 16, very nearly blowing up. It runs, but with no headroom at all, so a machine can only draw one picture at a time.

Then speed. If it's slow, let's see where to save. I put pictures drawn with different settings side by side and compared them by eye. Going from 20 steps down to 12, I honestly couldn't see the difference, and it saved two fifths of the CPU time. Resolution was off limits: put 1024×576 next to 1344×768 and the first is clearly a notch worse, so it stays at 1344×768, same as on the laptop.

Then quality. RealVisXL is good, but sometimes what it draws still isn't good enough. So I added another layer and had another AI review the pictures: after each picture, it takes a look and answers a few yes-or-no questions, like "Is this a sausage coated in batter?" Get one wrong, and the picture goes back to be redrawn. A dish that just won't come out right stays empty for now and gets another try the next night.

Last, splitting up the work. The whole flow has three steps:

```text
Menu scrape finishes
    │
    ▼
plan: count the new dishes, work out how many machines to start
    │
    ├──► Machine 1: draw 2 dishes, AI review
    ├──► Machine 2: draw 2 dishes, AI review
    │    ...
    └──► Machine 10: draw 2 dishes, AI review
    │
    ▼
collect: gather every machine's pictures, merge, commit
    │
    ▼
Site rebuilds and deploys
```

The middle layer uses the Actions matrix. That feature is meant for running your tests on a few Python versions; I use it to hand out dishes. `plan` works out how many machines to start, the matrix starts that many parallel jobs, and each machine takes its own share.

When splitting, the load has to be balanced across the machines. A job can run for 6 hours at most, and when time's up GitHub takes the machine away, along with any picture that wasn't handed in. So each machine gets only two dishes and stops starting new ones after 4 hours. That way all the work gets done and handed back within the time each machine has.

With that, the whole automation pipeline was in place. I watched it for a week: every time a menu scrape finished, it counted the dishes, started the machines, drew, reviewed and published, all on its own. I didn't have to touch a thing.

That's what an engineer should do: get things running on their own, sit back and watch, and just sign off on the results.

## A few Actions gotchas

A few small gotchas while I'm at it. None of them are big, but I really didn't know them the first time around:

- Scheduled runs aren't on time. Whatever time you set, the run often starts around five hours late. The top and the half of the hour are the busiest, so pick another minute.
- A commit that Actions pushes itself doesn't trigger `on: push`. GitHub does this on purpose, so a workflow can't keep triggering itself forever. So if you want to deploy automatically after scraping the menus, the workflow has to call the deploy workflow directly.
- A triggered workflow may check out old code. By default it gets the commit from the moment it was triggered, which doesn't include what the previous workflow just pushed, so you have to spell out `ref: main`.

## Is this allowed?

By now someone is surely thinking: so I can use Actions as a free cloud server?

Don't. GitHub's terms are clear: Actions can't be used for cryptomining, as a CDN or a serverless backend, or for anything unrelated to the repository. It's for the development, testing, deployment and publishing of that project. Our use is just about reasonable: everything it makes is an asset of this project. The pictures are the site's content, committed to this repository and published with the site.

## The cost of spending nothing

There is a cost, just two things.

First, it's slow. A picture takes more than ten minutes, so a new dish waits several hours between showing up on the menu and getting a picture. But the dining halls post their menus a week ahead anyway, so by the time a dish is actually served, its picture was drawn long ago. I checked the data: of the 409 new dishes that have appeared since October, 406 had a picture on or before the first day they were served.

Second, there's a ceiling on how much it can draw. How many machines can run at once, how long each can run, how much free allowance there is each day: all fixed. If one day I felt like redrawing all thousand-plus dishes, that's not happening. When a big batch of new dishes does turn up, like in the first week of the quarter, I run it on my laptop at a minute and a half a picture, and it's cleared in no time.

For a dining menu site, neither of these is a problem. It doesn't need pictures in seconds, and it doesn't need unlimited drawing. It just needs the day's few new dishes drawn right.

## A month in, over 500 people have used it

Ever since the site went live, I've been tracking its usage. In its first month, over 500 people used it, and fifty or sixty people use it every day now.

{{< inline-svg src="img/users-en.svg" >}}

What makes me happiest: of the people checking the menu each day over the past week, about seven in ten had been here before. That tells me people really do use it as their everyday way to check the menu.

I'm glad I could do a small bit of work to make checking the dining hall menu a little easier for everyone.
