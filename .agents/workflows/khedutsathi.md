---
description: # KhedutSaathi Project Description  ## Overview  KhedutSaathi is an AI-powered agricultural platform designed to help Indian farmers make informed decisions throughout the farming lifecycle.  The platform combines:  * Crop Health Analysis * Crop Reco
---

# KhedutSaathi Development Workflow

## Purpose

This workflow defines how every task, feature, bug fix, refactor, UI update, architecture change, and AI integration must be executed within the KhedutSaathi project.

The objective is to ensure:

* Consistent quality
* Stable architecture
* Predictable development
* Maintainable code
* Reliable user experience
* Farmer-focused product evolution

This workflow is mandatory for all future implementations.

---

# Core Philosophy

KhedutSaathi is a production-oriented agricultural SaaS platform.

Every implementation must improve at least one of:

* Farmer Productivity
* Farmer Profitability
* Farmer Knowledge
* Decision Making
* Accessibility
* Platform Reliability

Avoid unnecessary complexity.

Favor:

* Simplicity
* Maintainability
* Reusability
* Performance
* Scalability

---

# Standard Task Lifecycle

Every task must follow the complete lifecycle below.

No phase should be skipped.

---

# Phase 1: Discovery & Analysis

## Objective

Understand the actual problem before writing code.

---

## Required Actions

### 1. Define the Problem

Identify:

* What is broken?
* What is missing?
* What needs improvement?

Create a clear problem statement.

Example:

Dashboard takes 3 seconds to load because data requests are executed sequentially.

---

### 2. Identify Root Cause

Determine:

* UI issue
* API issue
* State management issue
* Architecture issue
* Data issue

Never assume.

Verify.

---

### 3. Identify Impact

Determine:

Affected:

* Pages
* Components
* Services
* APIs
* Database Tables
* Hooks
* Shared Components

---

### 4. Risk Assessment

Identify:

Potential risks:

* Breaking routes
* Breaking dashboard
* Breaking marketplace
* Breaking dark mode
* Breaking mobile layouts
* Performance regressions

---

## Required Output

Every analysis phase must provide:

### Problem Statement

### Root Cause

### Affected Files

### Risk Assessment

---

# Phase 2: Solution Planning

## Objective

Design the solution before implementation.

---

## Required Actions

### Architecture Planning

Explain:

* Current architecture
* Proposed architecture
* Benefits
* Tradeoffs

---

### UI Planning

Explain:

* Current UI behavior
* Proposed UI behavior
* User impact

---

### Data Flow Planning

Explain:

Input

↓

Processing

↓

Output

for all affected features.

---

### File Planning

Clearly define:

Files to Modify

Files to Create

Files to Delete

Files to Refactor

---

## Required Output

Implementation Plan

Including:

* Architecture Changes
* UI Changes
* Data Changes
* API Changes
* Verification Strategy

---

# Phase 3: User Approval

## Objective

Prevent uncontrolled implementation.

---

Before modifying code:

Present:

* Problem
* Root Cause
* Proposed Solution
* Risks
* Verification Plan

Wait for approval.

Acceptable approvals:

* Proceed
* Approved
* Implement
* Go Ahead

No implementation before approval.

---

# Phase 4: Implementation

## Objective

Apply changes safely.

---

## Rules

### Preserve Existing Functionality

Never break:

* Existing routes
* Existing APIs
* Existing user workflows

unless explicitly requested.

---

### Prefer Reuse

Before creating:

* Component
* Hook
* Service
* Utility

Check whether one already exists.

---

### Minimize Scope

Do not perform unrelated refactors.

Only modify code relevant to the task.

---

### Feature Driven Architecture

Preferred structure:

features/

dashboard/

marketplace/

crop-health/

resources/

khedut-ai/

irrigation/

Each feature owns:

* Components
* Hooks
* Services
* Constants

---

### Shared Layer

Shared functionality belongs in:

components/shared/

hooks/shared/

services/shared/

---

# Phase 5: Validation

## Objective

Ensure changes work correctly.

---

# Build Validation

Required:

npm run build

Build must pass.

No exceptions.

---

# Runtime Validation

Verify:

No:

* Console Errors
* Runtime Exceptions
* React Warnings

---

# Route Validation

Verify all affected routes load correctly.

Examples:

/

/dashboard

/agri-marketplace

/resources

/crop-health

/khedut-ai

---

# State Validation

Verify:

* Loading State
* Success State
* Error State
* Empty State

---

# API Validation

Verify:

* Successful Response
* Failure Response
* Timeout Handling
* Invalid Data Handling

---

# Mobile Validation

Test:

320px

375px

425px

768px

1024px

1440px

No overflow.

No horizontal scrolling.

---

# Dark Mode Validation

Verify:

Light Mode

Dark Mode

Ensure:

* Readable text
* Visible buttons
* Visible cards
* Consistent colors

---

# Accessibility Validation

Verify:

* Button visibility
* Input usability
* Contrast
* Keyboard navigation

where applicable.

---

# Phase 6: Performance Review

## Objective

Prevent regressions.

---

## Required Checks

### Rendering

Avoid:

* Unnecessary re-renders
* Duplicate requests
* Heavy computations inside components

---

### Data Fetching

Prefer:

React Query

Caching

Parallel Requests

Progressive Loading

---

### Dashboard Rules

Dashboard must always:

* Render progressively
* Use skeletons
* Use React Query
* Use caching

Never:

* Block entire page
* Reintroduce waterfall fetching

---

### Weather Rules

Always use:

State

District

Never use state-only weather requests.

---

# Phase 7: Reporting

## Objective

Provide implementation transparency.

---

Every completed task must provide:

### Summary

What changed.

---

### Files Modified

List all modified files.

---

### Files Created

List all new files.

---

### Files Removed

List all deleted files.

---

### Verification Results

Build Status

Route Status

UI Status

Mobile Status

Dark Mode Status

---

### Risks

Any remaining concerns.

---

# Merge Conflict Workflow

## Objective

Prevent accidental regressions.

---

Priority Order:

1. User Approved UI
2. Performance Improvements
3. Architecture Improvements
4. Incoming Changes

Never blindly:

* Accept Current
* Accept Incoming

Always manually review.

---

# UI Workflow

Before redesigning UI:

1. Compare Existing UI
2. Identify Real Problem
3. Explain Improvement
4. Preserve Existing Strengths

Do not redesign working UI without reason.

---

# AI & ML Workflow

Before ML integration:

Validate:

* Model
* Dataset
* Input Schema
* Output Schema

---

Every prediction must provide:

Prediction

Reasoning

Confidence (if available)

Recommendations

Never show unexplained AI outputs.

---

# Deployment Workflow

Before deployment:

Verify:

✓ Build Passes

✓ No Console Errors

✓ No Route Failures

✓ Mobile Responsive

✓ Dark Mode Works

✓ APIs Working

✓ Loading States Working

✓ Error States Working

✓ Empty States Working

✓ Performance Acceptable

---

# Final Rule

KhedutSaathi should evolve as a production-quality agricultural SaaS platform.

Every implementation must improve:

* Reliability
* Performance
* Maintainability
* Farmer Experience

without introducing unnecessary complexity.

When uncertain:

Choose the simpler solution that provides the best experience for the farmer.
