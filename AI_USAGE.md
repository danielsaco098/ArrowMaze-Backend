# AI Usage Documentation — Arrow Maze Backend

This document records how generative-AI tools were used while building this repository, as required by
Section 7 of the project brief. The team is fully responsible for all delivered code, AI-assisted or not.

---

## 1. Tools Used

| Tool | Model / Version | Role in the workflow |
| --- | --- | --- |
| Claude Code | Claude Opus 4.8 | Scaffolding, documentation drafting, API design discussion, test generation, code review. |
| _(add others as used)_ | e.g. GitHub Copilot | Inline autocompletion while coding. |

---

## 2. Usage Log (per significant task)

> One entry per significant AI use. Keep prompts faithful (literal or close paraphrase) and always record
> what the team **changed** afterward.

### Entry 001 — Documentation scaffolding (README, AI_USAGE, repo conventions)

- **Date:** 2026-06-17
- **Task:** Set up the backend documentation base (README with endpoints/Swagger/JWT, AI_USAGE,
  CONTRIBUTING, license, /docs structure) before writing code, aligned with the Clean Architecture used by
  the client.
- **Tool:** Claude Code (Claude Opus 4.8)
- **Prompt (paraphrased):** "Arrow Maze backend in NestJS + TypeScript. Required endpoints: JWT auth,
  progress sync, leaderboard, level CRUD, Swagger. Help me document it following Clean Architecture, SOLID,
  GoF patterns, and an AOP decorator strategy without AOP libraries."
- **Result:** Generated `README.md` (endpoint table, Swagger info, layer mapping), `AI_USAGE.md`,
  `CONTRIBUTING.md`, `.gitignore`, `LICENSE`, and `/docs` notes for the pending backend diagrams.
- **Team modifications:** _(fill in)_ — reviewed endpoint list, confirmed PostgreSQL + Prisma as the
  default persistence (swappable behind ports), will add backend-specific diagrams.
- **Lessons / limitations:** AI defaulted to a DB choice; the team confirmed it as a deferrable detail
  behind repository ports, consistent with the dependency rule.

### Entry 002 — _(next task)_

- **Date:**
- **Task:**
- **Tool:**
- **Prompt:**
- **Result:**
- **Team modifications:**
- **Lessons / limitations:**

---

## 3. Critical Evaluation

- **Approx. % of code AI-assisted:** _(fill in at the end)_.
- **Incorrect / suboptimal AI outputs and how we caught them:** _(log cases here)_.
- **Team reflection on AI's impact on productivity and quality:** _(fill in at the end)_.

---

## 4. Best-Practice Checklist (Section 7.3)

- [ ] Effective prompt engineering (clear context + constraints) documented above.
- [ ] All AI output critically reviewed against SOLID / patterns / Clean Architecture.
- [ ] AI-generated code covered by team-written tests.
- [ ] Granular commits so AI-assisted changes are traceable.
- [ ] Architecture decisions made by the team, AI used as assistant only.
- [ ] No secrets/credentials shared in prompts.
- [ ] Non-trivial AI-provided algorithms cited in code comments / docs.
