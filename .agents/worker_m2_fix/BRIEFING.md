# BRIEFING — 2026-08-03T22:50:00Z

## Mission
Implement 3 exact test harness improvements requested by Challenger 1 for Milestone 2 Playwright test specs and update documentation (`TEST_INFRA.md` and `TEST_READY.md`).

## 🔒 My Identity
- Archetype: implementer, qa, specialist
- Roles: Implementation Worker to fix Milestone 2 Playwright Test Specs
- Working directory: c:\Users\Edison\Desktop\La Polla\.agents\worker_m2_fix
- Original parent: 6aaf20b1-ab86-4cea-b1bd-8532aac1f11c
- Milestone: M2 Fixes

## 🔒 Key Constraints
- Genuine implementation required (no hardcoded/dummy/facade test assertions).
- Implement explicit HTTP 307 redirect assertions for root `/`.
- Add test specs for un-prefixed routes (`/login`, `/hub`, `/f1`, `/profile`) verifying HTTP 307 redirects and final 200 OK landing.
- Strengthen Italian (`Accedi`) and Portuguese (`Entrar`) DOM text assertions in `tier3-locale-switch.spec.ts`.
- Update `TEST_INFRA.md` and `TEST_READY.md` test matrix.

## Current Parent
- Conversation ID: 6aaf20b1-ab86-4cea-b1bd-8532aac1f11c
- Updated: 2026-08-03T22:50:00Z

## Task Summary
- **What to build**: Update Playwright E2E test specs (`tier1-routing.spec.ts`, `tier3-locale-switch.spec.ts`) and test documentation (`TEST_INFRA.md`, `TEST_READY.md`).
- **Success criteria**: All tests pass, explicit 307 status codes asserted, un-prefixed routes tested, Italian and Portuguese DOM text asserted, docs updated.

## Key Decisions Made
- Use `page.request.get(..., { maxRedirects: 0 })` to verify HTTP 307 status code and `location` header for root `/` and un-prefixed routes (`/login`, `/hub`, `/f1`, `/profile`).
- Assert `button[type="submit"]` text for Italian (`Accedi`) and Portuguese (`Entrar`).

## Change Tracker
- **Files modified**: TBD
- **Build status**: TBD
- **Pending issues**: None

## Quality Status
- **Build/test result**: Pending execution
- **Lint status**: TBD
- **Tests added/modified**: `tier1-routing.spec.ts`, `tier3-locale-switch.spec.ts`

## Loaded Skills
- None

## Artifact Index
- `.agents/worker_m2_fix/DISPATCH.md` — Recorded dispatch prompt
- `.agents/worker_m2_fix/BRIEFING.md` — Working context briefing
- `.agents/worker_m2_fix/progress.md` — Liveness heartbeat
