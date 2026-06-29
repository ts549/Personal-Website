---
title: Revalve
category: Pricing Engine
description: AI-powered dynamic pricing platform for e-commerce merchants.
tech: [Python, FastAPI, PyTorch, Ray, Postgres, Redis, Next.js, React]
liveUrl: "#"
sourceUrl: "#"
order: 1
---

> AI-powered dynamic pricing for e-commerce merchants. Founder and lead engineer.

## What it is

Revalve is a pricing engine that ingests a merchant's historical sales, live
competitor signals, inventory state, and inferred demand elasticity to recommend
real-time prices that optimize for whatever the merchant cares about — margin,
volume, sell-through, or a weighted mix. It runs as a SaaS connected to Shopify,
WooCommerce, and a direct REST integration for custom storefronts.

## What I built end-to-end

I founded the company and personally shipped the systems below; later hires
extended and operated them.

### Pricing model & training pipeline

- Designed the core model: a demand-elasticity estimator combined with a
  retrieval-augmented competitor-pricing module. Re-estimates per-SKU
  elasticity nightly using a hierarchical Bayesian prior to handle sparse SKUs
  and new product launches.
- Built the offline training pipeline in PyTorch with Ray for distributed
  batch training. Backtests against historical merchant data are first-class:
  every model release ships with a holdout-period uplift report.
- Designed the experimentation harness — interleaved A/B at the SKU level,
  Thompson-sampling exploration for cold-start SKUs, multi-armed bandits to
  pick among candidate prices when the model is uncertain.

### Real-time serving

- Built the inference service in Python (FastAPI) with sub-50ms p99 latency
  for single-SKU pricing decisions. Critical path uses a Postgres + Redis
  feature store, with cold features served from S3.
- Implemented per-tenant rate limiting, circuit breakers around the
  competitor-scraping subsystem, and shadow-mode evaluation so we could roll
  out new models without ever sending an unvalidated price to the storefront.
- Wrote the Shopify and WooCommerce integration adapters end to end — webhook
  ingestion, idempotent product sync, the bidirectional price update loop.

### Feedback loops

- Designed the closed-loop reward pipeline: every recommendation is paired
  with the realized outcome (was it bought? at what price? did the customer
  come back?) and joined into the training data within 24 hours.
- Built the offline / online consistency monitors that catch silent
  regressions when the model's calibration drifts from production behavior.

### Merchant-facing dashboard

- Designed and built the dashboard in Next.js + React. Showed merchants what
  price the model would recommend, why, and what the model expected to happen
  if they accepted it.
- Built the override + approval workflow — merchants can pin floors and
  ceilings per category, freeze prices ahead of campaigns, and approve every
  recommendation or auto-apply per rule.
- Built the explainability surface: per-recommendation, which features moved
  the price (competitor signal, demand shift, inventory pressure, etc.), with
  a 30-day price history overlay.

## Stack

Python · FastAPI · PyTorch · Ray · Postgres · Redis · Next.js · React · TypeScript · AWS

## Outcomes

- Onboarded merchants across the Shopify ecosystem.
- Sub-50ms p99 pricing latency at peak.
- Pricing decisions audited end-to-end — every price has a deterministic
  explanation a non-technical merchant can read.
