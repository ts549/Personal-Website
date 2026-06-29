At this point, everyone is familiar with prompt engineering. Everyone I talk to has the same experience using agents. You have a task in mind. You prompt the agent. You get a result and find issues and reprompt. Some engineers go a step deeper with context engineering and provide a list of feature specs beforehand to give more context to their model. There's a ton that can be done with AI but I don't think we're even remotely near the full potential of coding agents. Lately, I've been reading more on different engineering patterns and experimenting with something that I've been seeing pop up every now and then: loop engineering. Instead of carefully crafting prompts, the idea is to build an autonomous loop that can:

Plan

Execute

Verify

Repeat

There are a few blogs and research papers covering this topic, and they go a bit into how to best use loop engineering to automate repetitive tasks like optimizing compiler loops or anything with defined quantifiable goals. I thought it was a great concept, the core idea being that you build a loop to do every step that a human does when they use agents, and store the intermediate data/results (i.e. the state of the task, the failures, the progress to the goal, etc.). I wanted to see exactly how far this could extend, so I decided to try an experiment.

Can I create an AI that can build my entire portfolio website without me writing a single prompt after the initial objective?

The goal wasn't to see whether AI could implement features. The goal was to see whether a properly designed engineering loop could own an entire software project. It's not the most complex project, just a Next.js app with no database, no auth, no caching, no middleware, but still big enough of a task to show exactly what loop engineering can pull off.

## The Setup

Before I let anything run, I had to figure out what data the loop actually needed to keep between iterations. Most of loop engineering is just bookkeeping — making sure each phase of the loop sees exactly the context it needs and nothing else. Since this website doesn't really need external services, it makes it easier for me because I have a much smaller context window that I need to provide. I'm basically loop engineering a frontend engineer instead of a fullstack engineer.

I settled on a small set of config files, all available to view in the repo:

`goal.yml` — The high-level objective. This is the one thing I wrote by hand. Everything downstream is derived from it.

`strategy.yml` — How the agent is supposed to approach the goal. Planning heuristics, decomposition rules, what "done" means for this kind of work.

`tools.yml` — The set of tools the executor has access to. These are pre-defined functions like read_file, create_file, run_build, and it's how the loop will perform actions.

`state.yml` — The rolling state of the project. Per iteration: the plan the Planner emitted, the results of each executed step, and the Verifier's score and summary. This is the file the next Planner call reads first.

`failures.jsonl` — An append-only log of what failed and why. The Planner reads this so it can avoid stepping on the same rake twice.

Once the files were nailed down, the actual loop code was very thin. Most of the engineering effort went into deciding what *shape* the data between stages should take, in other words, what to keep, what to summarize, what to throw away. This was the part that took the most time. Testing on prompts and seeing what context was lacking and what tools I should create for the loop to use.

When I was ready, I used Claude Design to draft up a UI for my portfolio and sent it off to the loop with a few specs on what was required. Side note, Claude Design is pretty amazing.

## Notes

I prompted Claude to generate the goal.yml file based on my requirements for the website and left the loop to run by itself. Five minutes later I came back. To my surprise, it had produced a working website. It had navigation, pages, layouts, and the overall skeleton modeled exactly off the screenshots I provided. All of the failures and solutions/steps were still provided in the states.yml so I could double check Claude's work if I wanted to, but all of the reprompting, debugging, and testing/validating was handled completely by the loop.

This alone convinced me of the future of autonomous development. But another reality dawned upon me. Loop engineering marginally improves development but brings a new set of problems.

**Token costs** — This one wasn't a total surprise but still very heavy to see in realtime. I'm currently using Claude Pro Max, and even with generous limits, autonomous loops consume tokens at an incredible rate.

A single feature isn't one conversation. It's usually:

Planner → Executor → Verifier

And if verification fails? The entire loop starts again. One feature can easily become three or four complete reasoning cycles with an expanding context on each request.

There were a few ways that I tried to optimize this process, for example batching as much as I could to reduce context reloads and applying a sliding context window of 5 iterations that compressed the rest of the iterations into one, but the loop still burned through a LOT of tokens.

**Setup overhead** — To get the rewards of loop engineering, I paid the price in setup overhead. In my opinion, it was completely worth it, but taking a few hours to set up the loop was definitely frustrating at times. For one, Claude often hallucinated oudated framework documentation. A good example is Tailwind. Even though newer Tailwind projects no longer require a config file to be set up, the loop was stuck for a few iterations under its incorrect assumption that Tailwind needed a config file to work.

These mistakes seem minor, but they compound and can run your tokens dry. One outdated assumption early in the loop can waste multiple iterations before the verifier catches it.

**Architecture** — Prompt engineering can generate code. Loop engineering can generate systems. But neither automatically produces good architecture. The agent made several structural decisions that technically worked but weren't choices I would have made. They were either expensive or would have eventually lead to a silent bug. The longer the loop ran, the more expensive those decisions became to undo.

I realized something important: Loop engineering doesn't eliminate software engineering.

It shifts the engineer's responsibility. Instead of writing code, you're designing the process that writes code.

## Final Thoughts

This experiment left me optimistic. The AI fully built out my portfolio website, the one that contains this blog, with almost no direct intervention from me. That's genuinely impressive. But it also exposed a new set of engineering challenges. I think there is definitely going to be (and we can already see glimpses of it) a paradigm shift that can reliably improve software without us constantly steering it. I'll be utilizing these patterns a lot more.
