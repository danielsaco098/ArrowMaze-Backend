# AI Usage Documentation — Arrow Maze Backend

This document records how generative-AI tools were used while building this repository, as required by
Section 7 of the project brief. **The team is fully responsible for all delivered code**, AI-assisted or
not, and is able to explain every file, pattern and decision during the defense.

---

## 1. Tools Used

| Tool | Model / Version | Role in the workflow |
| --- | --- | --- |
| Claude Code | Claude Opus 4.8 | Pair-programming agent: scaffolding, code generation, test generation, refactoring, documentation, and running builds/tests in the terminal. |
| _(add any others the team used, e.g. GitHub Copilot, ChatGPT)_ | — | — |

**Workflow.** The team drove the work in incremental tasks. For each task the team stated the goal and
constraints (NestJS, Clean Architecture, ports as abstract classes, library-free AOP, AAA tests), the AI
implemented it, and the team reviewed the diff, ran the suite, and merged via Pull Request. Every change
was committed with Conventional Commits and a `Co-Authored-By: Claude` trailer for traceability.

---

## 2. Usage Log (per significant task)

### Entry 001 — Documentation scaffolding

- **Date:** 2026-06-17
- **Task:** Create the README, AI_USAGE, CONTRIBUTING, license and `/docs` structure before coding.
- **Tool:** Claude Code (Claude Opus 4.8)
- **Prompt (paraphrased):** "Document an Arrow Maze NestJS backend: JWT auth, progress sync, leaderboard,
  level CRUD, Swagger; Clean Architecture, SOLID, GoF, AOP without libraries."
- **Result:** Initial docs set with a *planned* design.
- **Team modifications / correction:** The first draft assumed **PostgreSQL + Prisma** and a Pact contract
  suite. The team later chose **in-memory repositories behind ports** (functional and dependency-free) and
  did not use Pact, so the README was rewritten in Entry 012 to match the real implementation. _Lesson: an
  early "planned" README can drift from the build — re-align it against the code before delivery._

### Entry 002 — NestJS scaffold + foundation

- **Task:** Scaffold the project and add Swagger, a global `ValidationPipe`, the `DomainExceptionFilter`
  and the `LoggingInterceptor`, plus `@nestjs/config` and a `/health` endpoint.
- **Prompt (paraphrased):** "Scaffold NestJS 11 + TS into this repo without clobbering the docs; set up
  Swagger at /api/docs, global validation, a domain-error→HTTP exception filter and a request-logging
  interceptor."
- **Result:** Working bootstrap (`main.ts`), `AppModule`, config, filter and interceptor.
- **Team modifications:** Reviewed the global pipe options (`whitelist`, `forbidNonWhitelisted`).
- **Lessons / limitations:** The Nest CLI scaffolds into a fresh folder; the AI generated into a temp
  directory and merged the files to preserve the existing documentation.

### Entry 003 — Auth domain, ports and use cases

- **Task:** `User` entity, domain errors with an HTTP `status`, ports as **abstract classes**
  (`UserRepository`, `PasswordHasher`, `TokenService`, `IdGenerator`), and `RegisterUser`/`LoginUser`
  use cases with AAA unit tests.
- **Prompt (paraphrased):** "Implement register/login as use cases depending only on abstract-class ports;
  hash passwords, issue JWTs, reject duplicate usernames, and return the same error for unknown user vs
  wrong password. Add AAA tests with fakes."
- **Result:** Use cases + 5 unit tests, all passing.
- **Team modifications:** Confirmed the security choice of a generic `InvalidCredentialsError` (no user
  enumeration).
- **Lessons / limitations:** Using abstract classes (not interfaces) as ports lets them double as NestJS
  DI tokens — cleaner than string tokens.

### Entry 004 — Auth infrastructure + e2e

- **Task:** `InMemoryUserRepository`, `BcryptPasswordHasher`, `JwtTokenService`, `UuidIdGenerator`,
  Passport `JwtStrategy` + `JwtAuthGuard`, auth controller + validated DTOs, `AuthModule`, and Supertest
  e2e for register → login.
- **Prompt (paraphrased):** "Wire the auth module mapping each port to a concrete; add a JWT strategy and
  guard; write e2e for register, duplicate (409), bad login (401) and invalid payload (400)."
- **Result:** Endpoints live; 5 e2e tests passing; server verified booting with Swagger.
- **Team modifications / fix:** The build failed because `@nestjs/jwt` types `signOptions.expiresIn` as a
  `ms` `StringValue`, not a plain string — the team applied a narrow, commented cast. Also chose **bcryptjs**
  (pure JS) over **bcrypt** to avoid native build steps on Windows.
- **Lessons / limitations:** `emitDecoratorMetadata` + `isolatedModules` require types used in decorated
  signatures to be imported with `import type` (hit later in the progress controller).

### Entry 005 — Levels, progress and leaderboard

- **Task:** Level definitions (GET public, PUT admin-only), progress sync (JWT), and the global leaderboard.
- **Prompt (paraphrased):** "Add levels CRUD with an admin guard and a seeded admin account; JWT-protected
  progress GET/sync that also feeds a leaderboard; GET /leaderboard/:levelId. In-memory repos behind ports,
  unit + e2e tests."
- **Result:** All 8 endpoints; 13 unit + 12 e2e tests passing; full app boots with every route mapped and
  documented in Swagger.
- **Team modifications:** Reviewed the leaderboard ranking (best per user, sorted by score then time) and
  the admin-seeding-on-startup approach.
- **Lessons / limitations:** A `@CurrentUser()` param decorator needed `import type { AuthenticatedUser }`
  to satisfy the decorated-signature rule above.

### Entry 006 — README re-alignment

- **Task:** Rewrite the README to match the real implementation.
- **Result:** Removed false claims (Prisma, Pact, `AuthFacade`, use-case decorators), documented the real
  patterns (Singleton/Adapter/Strategy), the real AOP (exception filter + logging interceptor + guards),
  and added verified links to actual source files.
- **Team modifications:** Verified every `./src` link resolves and that no stale term remained.

### Entry 007 — PostgreSQL persistence (local + remote)

- **Task:** Migrate users/progress/leaderboard from the in-memory stores to a real PostgreSQL database,
  supporting a local instance for development and a cloud instance (Neon) for production.
- **Prompt (paraphrased):** "The project must persist accounts and leaderboard scores; migrate to a local
  database and a remote database."
- **Result:** TypeORM + `pg` added; ORM entities in Layer 4 mapped to/from domain entities; `TypeOrm*`
  repositories implementing the same abstract ports; a global dynamic `PersistenceModule.forRoot()` that
  picks Postgres when `DATABASE_URL` is set and falls back to in-memory otherwise (and always under
  tests). Verified live against both databases: registration survives a server restart, progress/sync and
  leaderboard write real rows. 13 unit + 12 e2e tests still green with no DB required.
- **Team modifications:** Chose Postgres on both sides (a local Postgres 17 instance was already
  installed) over SQLite-local; kept level definitions in-memory as static seeded content; accepted
  `synchronize=true` (auto schema) as appropriate for the project scope instead of migration files.
- **Lessons / limitations:** Ports as abstract classes paid off — zero changes to use cases or
  controllers. `synchronize=true` would be replaced by migrations in a production system.

---

## 3. Critical Evaluation

- **Approx. % of code AI-assisted:** A large majority of the code was drafted by Claude Code under the
  team's direction; **100% was reviewed by the team**, run through the build and the unit + e2e suites, and
  committed in small, traceable increments. _(Refine this estimate before delivery.)_
- **Incorrect / suboptimal AI outputs and how we caught them:**
  - The initial README described a Prisma/PostgreSQL stack the project never used — caught during review and
    corrected to the real in-memory design.
  - The first build failed on the `@nestjs/jwt` `expiresIn` type and on decorated-signature type imports —
    caught by `npm run build` and fixed.
- **Team reflection:** AI accelerated boilerplate (modules, DTOs, repositories, tests) substantially, but
  the architecture, the persistence decision, and the validation of every behavior were owned by the team.
  The build + e2e gate is what made AI output trustworthy.

---

## 4. Best-Practice Checklist (Section 7.3)

- [x] Effective prompt engineering (clear context + constraints) documented above.
- [x] All AI output critically reviewed against SOLID / patterns / Clean Architecture.
- [x] AI-generated code covered by tests (unit + e2e) and a green build.
- [x] Granular Conventional Commits so AI-assisted changes are traceable.
- [x] Architecture decisions (ports, PostgreSQL persistence with in-memory fallback, AOP via Nest
  primitives) made by the team.
- [x] No secrets/credentials shared in prompts (`.env` is git-ignored; only example values committed).
- [x] Non-trivial decisions cited in code comments and this document.
