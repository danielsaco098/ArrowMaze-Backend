<!-- markdownlint-disable MD033 MD041 -->
<div align="center">

# 🛡️ Arrow Maze — Backend API

REST API for the **Arrow Maze** game: user authentication, progress sync, global leaderboard, and
remote level definitions. Built with **NestJS + TypeScript**, following **Clean Architecture**,
**SOLID**, **GoF patterns**, and **aspect-oriented cross-cutting concerns**.

[![CI](https://github.com/danielsaco098/ArrowMaze-Backend/actions/workflows/ci.yml/badge.svg)](https://github.com/danielsaco098/ArrowMaze-Backend/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-unit%20%7C%20e2e-success?logo=jest)](#-running-tests)
[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs&logoColor=white)](https://nestjs.com)
[![Swagger](https://img.shields.io/badge/API-OpenAPI%2FSwagger-85EA2D?logo=swagger&logoColor=black)](#-api-documentation)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

</div>

---

## 📖 Description

This service is the server-side companion to the [Arrow Maze client](../ArrowMaze-Client). It manages
everything the game must not trust to the device alone:

- **User accounts** — registration and login secured with **JWT**.
- **Progress sync** — persist and retrieve completed levels and scores per user.
- **Global leaderboard** — best scores per level across all players.
- **Remote level definitions** — fetch/update levels so new content ships **without** a new app release.

> **Tech stack:** NestJS 11 · TypeScript (strict) · Passport-JWT · bcryptjs · **TypeORM + PostgreSQL** ·
> `@nestjs/config` · `@nestjs/swagger` (OpenAPI) · Jest + Supertest (e2e).
>
> _Persistence is **PostgreSQL via TypeORM** (local Postgres for development, a cloud Postgres such as
> Neon for production — same code, different `DATABASE_URL`). Because the repository ports
> (`UserRepository`, `ProgressRepository`, `LeaderboardRepository`) are abstractions, a dynamic
> [`PersistenceModule`](./src/modules/persistence.module.ts) falls back to the original dependency-free
> **in-memory** adapters when no `DATABASE_URL` is configured — and always under tests — without touching
> the use cases. See [Database configuration](#-database-configuration)._

---

## 🏛️ Architecture

Same **Clean Architecture** dependency rule as the client — everything points **inward**:

| Layer | Folder | Responsibility | Key components |
| --- | --- | --- | --- |
| **1 — Domain** | `src/domain` | Pure business rules, no framework imports. | Entities `User`, `LevelDefinition`, `ProgressRecord`, `LeaderboardEntry`; `DomainError` hierarchy (each carries its HTTP `status`) |
| **2 — Application** | `src/application` | Use cases + ports (ports are **abstract classes** doubling as DI tokens). | Use cases `RegisterUser`, `LoginUser`, `GetLevels`/`GetLevel`/`UpsertLevel`, `SyncProgress`, `GetProgress`, `GetLeaderboard`; ports `UserRepository`, `PasswordHasher`, `TokenService`, `IdGenerator`, `LevelRepository`, `ProgressRepository`, `LeaderboardRepository` |
| **3 — Interface Adapters** | `src/infrastructure/http` | REST controllers + DTOs (validation + Swagger). | `auth`, `levels`, `progress`/`leaderboard` controllers and DTOs |
| **4 — Frameworks & Drivers** | `src/infrastructure`, `src/modules`, `src/shared` | Volatile details. | TypeORM (PostgreSQL) + in-memory repositories selected by `PersistenceModule`, `JwtTokenService`/`BcryptPasswordHasher`/`UuidIdGenerator`, Passport `JwtStrategy`, guards, Nest modules, Swagger setup, config |

The dependency rule means **use cases never import Nest or Express** — they depend on the abstract-class
ports in `src/application/ports`, which the Layer 4 providers implement and the modules bind via DI.

### Layer diagram (dependency rule)

```mermaid
flowchart TB
    subgraph L4["Layer 4 · Frameworks & Drivers"]
        direction TB
        subgraph L3["Layer 3 · Interface Adapters"]
            direction TB
            subgraph L2["Layer 2 · Application"]
                direction TB
                subgraph L1["Layer 1 · Domain"]
                    DOMAIN["User · LevelDefinition · ProgressRecord<br/>LeaderboardEntry · DomainError"]
                end
                USECASES["Use cases: RegisterUser · LoginUser<br/>GetLevels/GetLevel/UpsertLevel<br/>SyncProgress/GetProgress/GetLeaderboard"]
                PORTS["Ports (abstract classes): UserRepository · PasswordHasher<br/>TokenService · IdGenerator · LevelRepository<br/>ProgressRepository · LeaderboardRepository"]
            end
            CONTROLLERS["Controllers + DTOs:<br/>Auth · Levels · Progress · Leaderboard"]
        end
        INFRA["TypeOrm*Repository (PostgreSQL) / InMemory*Repository · JwtTokenService<br/>BcryptPasswordHasher · UuidIdGenerator · JwtStrategy/Guards · ExceptionFilter · LoggingInterceptor"]
    end

    CONTROLLERS -->|depends on| USECASES
    USECASES -->|depends on| PORTS
    USECASES -->|uses| DOMAIN
    INFRA -.->|implements| PORTS
```

### Class diagram (architecture-significant)

```mermaid
classDiagram
    class UserRepository {
        <<abstract>>
    }
    class PasswordHasher {
        <<abstract>>
    }
    class TokenService {
        <<abstract>>
    }
    class LevelRepository {
        <<abstract>>
    }
    class ProgressRepository {
        <<abstract>>
    }
    class LeaderboardRepository {
        <<abstract>>
    }

    class RegisterUserUseCase
    class LoginUserUseCase
    class UpsertLevelUseCase
    class SyncProgressUseCase

    class AuthController
    class LevelsController
    class ProgressController

    RegisterUserUseCase --> UserRepository
    RegisterUserUseCase --> PasswordHasher
    RegisterUserUseCase --> TokenService
    LoginUserUseCase --> UserRepository
    UpsertLevelUseCase --> LevelRepository
    SyncProgressUseCase --> ProgressRepository
    SyncProgressUseCase --> LeaderboardRepository

    AuthController --> RegisterUserUseCase
    AuthController --> LoginUserUseCase
    LevelsController --> UpsertLevelUseCase
    ProgressController --> SyncProgressUseCase

    TypeOrmUserRepository ..|> UserRepository
    InMemoryUserRepository ..|> UserRepository
    BcryptPasswordHasher ..|> PasswordHasher
    JwtTokenService ..|> TokenService
    InMemoryLevelRepository ..|> LevelRepository
    TypeOrmProgressRepository ..|> ProgressRepository
    InMemoryProgressRepository ..|> ProgressRepository
    TypeOrmLeaderboardRepository ..|> LeaderboardRepository
    InMemoryLeaderboardRepository ..|> LeaderboardRepository
```

> Editable diagram sources (PlantUML) live in
> [`docs/diagrams/clean-architecture.puml`](./docs/diagrams/clean-architecture.puml) and
> [`docs/diagrams/class-diagram.puml`](./docs/diagrams/class-diagram.puml). The Mermaid blocks above render
> directly on GitHub; the PlantUML files can be exported to PNG with any PlantUML renderer.

---

## 🌐 API Endpoints

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | — | Create a user account |
| `POST` | `/auth/login` | — | Authenticate, returns a JWT |
| `GET`  | `/levels` | — | List level definitions (client can sync new content) |
| `GET`  | `/levels/:id` | — | Get a single level definition |
| `PUT`  | `/levels/:id` | JWT (admin) | Create/update a level definition |
| `GET`  | `/progress` | JWT | Get the authenticated player's progress |
| `POST` | `/progress/sync` | JWT | Sync completed levels + scores |
| `GET`  | `/leaderboard/:levelId` | — | Top scores for a level |

> Errors use consistent HTTP semantics (`400/401/403/404/409/422/500`) with a uniform error body,
> produced by a centralized exception filter (see [AOP](#-aspect-oriented-programming-aop)).

---

## 📚 API Documentation

Interactive **Swagger / OpenAPI** docs are served at:

```
http://localhost:3000/api/docs
```

The raw OpenAPI JSON is available at `/api/docs-json`. All eight endpoints, request/response schemas and
the Bearer-auth scheme are documented there.

---

## 🧩 Design Patterns (GoF)

| Category | Pattern | Where / Why | Code |
| --- | --- | --- | --- |
| Creational | **Singleton** | NestJS providers are singletons by default, so each repository holds one shared store/connection per process and services exist once. | [in-memory-user-repository.ts](./src/infrastructure/persistence/in-memory-user-repository.ts) |
| Structural | **Adapter** | `JwtTokenService` adapts Nest's `JwtService` to the `TokenService` port; `BcryptPasswordHasher` adapts bcryptjs to `PasswordHasher`; the TypeORM repos adapt PostgreSQL tables — and the in-memory repos a `Map` — to the same repository ports. | [typeorm-user-repository.ts](./src/infrastructure/persistence/typeorm/typeorm-user-repository.ts) · [jwt-token-service.ts](./src/infrastructure/security/jwt-token-service.ts) · [bcrypt-password-hasher.ts](./src/infrastructure/security/bcrypt-password-hasher.ts) |
| Behavioral | **Strategy** | Passport's `JwtStrategy` defines the token-validation algorithm; the `TokenService`/repository ports make their implementations interchangeable (e.g. swap JWT or a DB backend) without changing use cases. | [jwt.strategy.ts](./src/infrastructure/security/jwt.strategy.ts) · [token-service.ts](./src/application/ports/token-service.ts) |

### Representative fragments

<details>
<summary><b>Singleton</b> — Nest providers are one shared instance per process</summary>

```ts
// src/modules/persistence.module.ts — each provider below is instantiated once
// by Nest's DI container and shared by every consumer (Singleton scope).
providers: [
  { provide: UserRepository, useClass: TypeOrmUserRepository },
  { provide: ProgressRepository, useClass: TypeOrmProgressRepository },
  { provide: LeaderboardRepository, useClass: TypeOrmLeaderboardRepository },
]
```
</details>

<details>
<summary><b>Adapter</b> — external libraries wrapped behind internal ports</summary>

```ts
// src/infrastructure/security/bcrypt-password-hasher.ts
export class BcryptPasswordHasher extends PasswordHasher {
  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.saltRounds); // bcryptjs never leaks inward
  }
}
// Same shape for TypeOrmUserRepository (PostgreSQL → UserRepository port)
// and JwtTokenService (@nestjs/jwt → TokenService port).
```
</details>

<details>
<summary><b>Strategy</b> — interchangeable algorithms behind one contract</summary>

```ts
// src/application/ports/token-service.ts — the contract use cases depend on
export abstract class TokenService {
  abstract sign(payload: TokenPayload): Promise<string>;
}
// JwtTokenService implements it today; a PasetoTokenService could replace it
// in one line of the module, with zero changes to RegisterUser/LoginUser.
```
</details>

---

## 🔠 SOLID Principles

- **S — Single Responsibility.** Controllers handle HTTP, use cases orchestrate
  ([`SyncProgressUseCase`](./src/application/use-cases/sync-progress.use-case.ts)), repositories handle
  persistence — never mixed.
- **O — Open/Closed.** New endpoints/use cases are added without modifying existing ones; a new repository
  backend implements the port instead of editing the use case.
- **L — Liskov Substitution.** Any [`UserRepository`](./src/application/ports/user-repository.ts)
  implementation (Postgres-backed in production, in-memory in tests, or a fake) is substitutable without
  breaking use cases — proven in practice: the TypeORM adapters replaced the in-memory ones with **zero**
  changes to the use cases.
- **I — Interface Segregation.** Narrow, focused ports
  ([`PasswordHasher`](./src/application/ports/password-hasher.ts),
  [`TokenService`](./src/application/ports/token-service.ts),
  [`IdGenerator`](./src/application/ports/id-generator.ts)) instead of one fat service interface.
- **D — Dependency Inversion.** Use cases depend on the abstract-class ports; the
  [modules](./src/modules/auth.module.ts) bind each port to a concrete provider via Nest's DI container.

---

## 🪡 Aspect-Oriented Programming (AOP)

Cross-cutting concerns are separated from the business logic **without an AOP library**, using NestJS's
native aspect primitives — interceptors, filters and guards — which wrap handlers transparently:

- **Centralized exception handling** —
  [`DomainExceptionFilter`](./src/shared/filters/domain-exception.filter.ts) catches any `DomainError`
  and maps it to a consistent HTTP response, so use cases just `throw` and never import anything HTTP.
- **Logging & tracing** — [`LoggingInterceptor`](./src/shared/interceptors/logging.interceptor.ts) records
  the method, path and duration of every request without a single log line in the controllers or use cases.
- **Security / authorization** — [`JwtAuthGuard`](./src/infrastructure/security/jwt-auth.guard.ts) and
  [`AdminGuard`](./src/infrastructure/security/admin.guard.ts) enforce an active session and the admin role
  before protected handlers run, keeping authorization out of the business logic.

The business code never references a logger, an HTTP status, or an auth check — those concerns live in the
filter, interceptor and guards and apply declaratively.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20 and **npm**
- A `.env` file (optional — see `.env.example`; sensible defaults are built in)

### Installation

```bash
git clone <backend-repo-url> ArrowMaze-Backend
cd ArrowMaze-Backend
npm install
cp .env.example .env   # optional: set JWT_SECRET and the seeded admin credentials
```

### Run locally

```bash
npm run build        # compile
npm run start:dev    # watch mode at http://localhost:3000
npm run start:prod   # run the compiled build
```

On startup a default **admin** account is seeded (`admin` / `admin12345` by default) so the admin-only
level endpoint is usable immediately. Sample levels are seeded too.

---

## 🗄️ Database configuration

Persistence targets **PostgreSQL** (users, progress, leaderboard) through TypeORM. The implementation is
chosen at boot by [`PersistenceModule`](./src/modules/persistence.module.ts):

| `DATABASE_URL` | Behaviour |
| --- | --- |
| Set (and not under tests) | **Postgres**: TypeORM connects, creates/updates the `users`, `progress` and `leaderboard` tables (`DATABASE_SYNCHRONIZE=true`), data survives restarts. |
| Empty / tests | **In-memory** fallback: dependency-free `Map`-based adapters — ideal for unit/e2e tests and quick demos. |

Copy [.env.example](./.env.example) to `.env` and set:

```bash
# Local development (local PostgreSQL instance)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/arrowmaze
DATABASE_SSL=false

# Production (cloud PostgreSQL, e.g. Neon / Supabase)
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DBNAME
DATABASE_SSL=true
```

The ORM entities live in Layer 4 ([`orm/`](./src/infrastructure/persistence/orm)) and are mapped to/from
the domain entities by the TypeORM adapters ([`typeorm/`](./src/infrastructure/persistence/typeorm)), so
the domain stays framework-free. Level definitions remain in-memory by design (static game content seeded
at boot).

---

## 🧪 Running Tests

```bash
npm test               # unit tests (Jest, AAA, should_..._when_...)
npm run test:e2e       # integration tests (Supertest against the real Nest app)
npm run test:pact      # Pact provider verification of the client's contract
npm run test:cov       # coverage
```

- **Unit** — use cases in isolation against fakes/in-memory adapters of the ports.
- **Integration (e2e)** — the full application is bootstrapped and the HTTP endpoints are exercised with
  Supertest (register → login → JWT-protected calls, admin authorization, progress → leaderboard).
- **Contract (Pact)** — [`test/pact-provider.pact-spec.ts`](./test/pact-provider.pact-spec.ts) replays the
  consumer contract recorded by the client repo ([`test/pacts/`](./test/pacts)) against the real app with
  in-memory persistence: provider states seed users/scores and a request filter injects a freshly issued
  JWT. A breaking API change fails this step in CI.
- CI runs build + unit + e2e + pact on every push and Pull Request (`.github/workflows/ci.yml`).

---

## 🤖 AI Usage Documentation

See [`AI_USAGE.md`](./AI_USAGE.md) — tools, per-task prompt logs, modifications, and critical evaluation
(Section 7 of the brief).

---

## 🤝 Contributing

See [`CONTRIBUTING.md`](./CONTRIBUTING.md): **Conventional Commits** in English, protected `main`,
feature branches, and Pull Requests with passing CI.

---

## 📄 License

Released under the [MIT License](./LICENSE).
