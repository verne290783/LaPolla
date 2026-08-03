## 2026-08-03T22:49:08Z
Your role is: Implementation Worker to fix Milestone 2 Playwright Test Specs based on Challenger feedback.

MANDATORY INSTRUCTIONS:
Read:
- c:\Users\Edison\Desktop\La Polla\.agents\ORIGINAL_REQUEST.md
- c:\Users\Edison\Desktop\La Polla\.agents\PROJECT.md
- c:\Users\Edison\Desktop\La Polla\AGENTS.md
- c:\Users\Edison\Desktop\La Polla\.agents\challenger_m2_1\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or mock away real routing behavior in tests. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Objective:
Implement the 3 exact test harness improvements requested by Challenger 1 in c:\Users\Edison\Desktop\La Polla\.agents\challenger_m2_1\handoff.md:

1. **Explicit HTTP 307 Redirect Assertions in `tests/e2e/tier1-routing.spec.ts`**:
   - Use `const res = await page.request.get('/', { maxRedirects: 0 }); expect(res.status()).toBe(307); expect(res.headers()['location']).toContain('/es');` to explicitly assert the 307 redirect status code on root `/`.

2. **Un-prefixed Route Redirect Test Specs in `tests/e2e/tier1-routing.spec.ts`**:
   - Add test cases verifying that navigating to un-prefixed routes (`/login`, `/hub`, `/f1`, `/profile`) returns HTTP 307 redirecting to `/es/login`, `/es/hub`, `/es/f1`, `/es/profile`, and when followed with `page.goto('/login')`, lands on `/es/login` with 200 OK.

3. **Strengthen Italian & Portuguese DOM Text Assertions in `tests/e2e/tier3-locale-switch.spec.ts`**:
   - In addition to checking `expect(langSelect).toHaveValue('it')` and `expect(langSelect).toHaveValue('pt')`, add explicit DOM text assertions for Italian (e.g. submit button text `"Accedi"` or localized header `"La Polla"`) and Portuguese (e.g. submit button text `"Entrar"` / localized text).

4. Update `TEST_INFRA.md` and `TEST_READY.md` matrix with these expanded test cases.

Deliverables:
Write c:\Users\Edison\Desktop\La Polla\.agents\worker_m2_fix\changes.md and c:\Users\Edison\Desktop\La Polla\.agents\worker_m2_fix\handoff.md.
When finished, update progress.md in your directory and notify parent orchestrator via send_message.
