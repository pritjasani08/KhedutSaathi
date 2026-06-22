---
trigger: always_on
---

# KhedutSaathi Engineering & Product Rules

## Project Vision

KhedutSaathi is a farmer-first agricultural SaaS platform.

Every feature, design decision, architecture decision, and implementation must improve at least one of:

* Crop Health
* Crop Planning
* Market Access
* Farmer Income
* Decision Making
* Agricultural Knowledge

If a change does not improve the farmer experience, it should not be prioritized.

---

# Product Principles

## Rule 1: Farmer First

Before implementing any feature, answer:

"How does this help a farmer make a better decision?"

Prioritize:

* Yield improvement
* Cost reduction
* Time savings
* Better market opportunities
* Better crop health

---

## Rule 2: Journey-Based Experience

Homepage follows the farmer journey:

Crop Health
→ Crop Planning
→ Market Intelligence
→ News & Schemes
→ AI Assistant

Do not revert to random feature-card layouts.

---

## Rule 3: Functionality Over Decoration

Prioritize:

* Usability
* Clarity
* Accessibility
* Speed

Avoid:

* Decorative UI
* Unnecessary animations
* Visual clutter
* Marketing-style gimmicks

---

# Design System Rules

## Rule 4: One Design Language

All pages must share:

* Typography
* Spacing
* Card System
* Buttons
* Form Inputs
* Loading States

No page-specific design systems.

---

## Rule 5: Marketplace Is The Visual Benchmark

Agri Marketplace is currently the strongest page visually.

Use Marketplace as the design benchmark for:

* Typography
* Spacing
* Visual hierarchy
* SaaS quality

Do not redesign Marketplace unless specifically requested.

---

## Rule 6: No Decorative Badges

Avoid:

* AI Powered
* Marketplace Live
* Smart
* Premium
* Live Weather

Use:

* Typography
* Layout
* Spacing

to create hierarchy.

Badges are only allowed if explicitly requested.

---

## Rule 7: Content Above Decoration

Every hero section must prioritize:

Title
Description
Primary Interaction

Examples:

Crop Health:
Title
Description
Upload Area

Khedut AI:
Title
Description
Chat Interface

News & Schemes:
Title
Description
Tabs

Never create large empty hero banners.

---

## Rule 8: Logo Integrity

Official KhedutSaathi logo is the source of truth.

Do not:

* Regenerate
* Recolor
* Simplify
* Replace

Only adjust:

* Scaling
* Alignment
* Positioning

Use transparent PNG or SVG assets.

---

# UI/UX Rules

## Rule 9: Mobile First

Every feature must be tested on:

* 320px
* 375px
* 425px
* 768px
* 1024px
* 1440px

No horizontal scrolling.

No broken layouts.

---

## Rule 10: Dark Mode Is Mandatory

Every UI change must work in:

* Light Mode
* Dark Mode

Never introduce:

* Invisible text
* White cards in dark mode
* Low contrast content

---

## Rule 11: Skeletons Over Spinners

Preferred:

* Skeleton Loaders
* Progressive Rendering

Avoid:

* Full-page loading screens
* Blocking spinners

---

## Rule 12: Consistent Empty States

Never show:

"No Data"

Instead provide:

* Context
* Next Action

Example:

"No listings available.
Create your first listing."

---

# Dashboard Rules

## Rule 13: Progressive Rendering

Dashboard must never block the entire screen.

Use:

* React Query
* Parallel Requests
* Independent Loading States
* Card-Level Skeletons

Avoid:

* Global Dashboard Spinners

---

## Rule 14: Preserve Dashboard Performance Architecture

Do not remove:

* React Query
* Caching
* Error Boundaries
* Parallel Data Loading

Performance improvements are permanent architecture decisions.

---

## Rule 15: Weather Must Be Location Specific

Weather queries must use:

* State
* District

Never use only State.

Avoid repeating the historical "Chuda Taluka" issue.

---

## Rule 16: UI Parity Matters

Performance improvements must never degrade UI quality.

Architecture upgrades must preserve:

* Existing layout
* Existing user experience
* Existing feature visibility

---

# Frontend Architecture Rules

## Rule 17: Shared Components First

Before creating a new component, check if a reusable component already exists.

Preferred:

* PageHero
* StatCard
* SectionHeader
* Skeleton Components
* Shared Inputs

Avoid duplication.

---

## Rule 18: Single Source of Truth

Never duplicate:

* Hero Layouts
* Theme Logic
* Translation Logic
* Card Variants
* API Logic

Centralize shared behavior.

---

## Rule 19: Feature-Based Structure

Preferred structure:

src/features/

* dashboard
* marketplace
* crop-health
* crop-recommendation
* resources
* irrigation

Avoid oversized page files.

---

## Rule 20: Service Layer Required

UI components should not contain API logic.

Use:

features/
services/
hooks/
components/

architecture.

---

# AI & ML Rules

## Rule 21: Real Data First

Avoid:

* Dummy prices
* Dummy weather
* Fake statistics

Use:

* APIs
* Database
* ML Predictions

whenever possible.

---

## Rule 22: Explainable AI

Every prediction must explain:

* Why
* Factors considered
* Confidence if available

Never show unexplained outputs.

---

# Code Quality Rules

## Rule 23: Error Boundaries Everywhere

One failing API must never crash the entire page.

Critical areas:

* Dashboard
* Marketplace
* Weather
* News
* Schemes

must degrade gracefully.

---

## Rule 24: Build Must Pass

Before any implementation is considered complete:

npm run build

must pass successfully.

---

## Rule 25: No Dead Code

Remove:

* Unused imports
* Unused hooks
* Unused state
* Duplicate functions

after major refactors.

---

# Git Rules

## Rule 26: Preserve User Intent

During merges:

* Preserve user-approved UI
* Preserve architecture improvements
* Preserve performance improvements

Never overwrite user work without justification.

---

## Rule 27: Small Focused Changes

Avoid giant mixed commits.

Separate:

* UI Changes
* Performance Changes
* Refactors
* Bug Fixes

---

# Antigravity Execution Rules

Before implementing any change:

1. Define the problem.
2. Identify root cause.
3. Identify impacted files.
4. Explain architecture impact.
5. Preserve existing functionality.
6. Provide verification plan.

Never claim success without verification.

---

# Verification Checklist

Every task must verify:

✓ Build passes

✓ No console errors

✓ Mobile responsive

✓ Dark mode works

✓ Loading states work

✓ Error states work

✓ Routes load correctly

✓ Existing functionality preserved

---

# Final Goal

KhedutSaathi should feel like:

* Professional
* Fast
* Reliable
* Farmer-focused
* Mobile-first
* AI-assisted
* Production-ready

and never like a collection of disconnected hackathon features.
