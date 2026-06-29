---
title: "Loop engineering my website"
label: Notes
date: 2026-06-27
summary: "Building an autonomous agent loop that designs, codes, and verifies the site you're reading."
order: 1
---

## Why a loop

I wanted to build a personal site, and I wanted to use it as the testbed for
"loop engineering" — agents that plan a change, execute it, verify the result,
and feed what they learned back into the next planning call. Most of the
interesting work happens in the *feedback channels* between those phases.

## What the loop actually does

Per iteration the loop:

1. Loads a goal and a design specification.
2. Asks a Planner to emit a JSON plan of tool calls.
3. Executes each tool — file edits, builds, lints — in a sandboxed workspace.
4. Spawns a real Next.js dev server, takes Playwright screenshots, and
   compares them to reference images with an LLM-as-judge.
5. Runs functional assertions (selectors exist, modals open, etc.).
6. Folds the iteration's results back into rolling session state for the
   next planning call.

When every assertion passes and every visual score clears 90%, the loop halts.

## What I learned

The hard part isn't the prompts. It's the **shape of the data between stages**:
what does the Planner see, what does the Verifier return, what gets folded
into the session summary versus dropped on the floor. Get those wrong and
the agent thrashes; get them right and it's almost boring.

More writing coming soon.
