<!-- markdownlint-disable MD033 MD041 -->
<div align="center">

# 🛡️ Arrow Maze — Backend API

REST API for the **Arrow Maze** game: user authentication, progress sync, global leaderboard, and
remote level definitions. Built with **NestJS + TypeScript**, following **Clean Architecture**,
**SOLID**, **GoF patterns**, and **aspect-oriented cross-cutting concerns**.

[![CI](https://github.com/danielsaco098/ArrowMaze-Backend/actions/workflows/ci.yml/badge.svg)](https://github.com/danielsaco098/ArrowMaze-Backend/actions/workflows/ci.yml)
[![Tests](https://img.shields.io/badge/tests-unit%20%7C%20integration%20%7C%20contract-success?logo=jest)](#-running-tests)
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

> **Tech stack:** NestJS · TypeScript (strict) · PostgreSQL + Prisma (behind a repository port) ·
> Passport-JWT · `@nestjs/swagger` (OpenAPI) · Jest + Supertest (integration) · Pact (contract).
>
> _Database/ORM are deferrable details: PostgreSQL + Prisma is the default, swappable behind
> `ILevelRepository` / `IUserRepository` / `IScoreRepository` without touching use cases._

---

## 🏛️ Architecture

Same **Clean Architecture** dependency rule as the client — everything points **inward**:

| Layer | Folder | Responsibility | Key components |
| --- | --- | --- | --- |
| **1 — Domain** | `src/domain` | Pure business rules. | `User`, `Score`, `LevelDefinition`, `LeaderboardEntry` entities + VOs; no Nest/Prisma imports |
| **2 — Application** | `src/application` | Use cases + ports. | `RegisterUserUseCase`, `LoginUseCase`, `SyncProgressUseCase`, `GetLeaderboardUseCase`, `GetLevelsUseCase`, `UpsertLevelUseCase`; ports `IUserRepository`, `IScoreRepository`, `ILevelRepository`, `ITokenService`, `IHasher` |
| **3 — Interface Adapters** | `src/adapters` | Controllers, presenters, repo implementations, mappers. | REST controllers, DTOs + validation, `PrismaUserRepository`, mappers (entity ⇄ DTO/Prisma model) |
| **4 — Frameworks & Drivers** | `src/infrastructure` | Volatile details. | Nest modules, Prisma client, Passport-JWT strategy, Swagger setup, config |

The dependency rule means **use cases never import Nest, Prisma, or Express** — they depend on the
ports in `src/application/ports`, which the adapters implement.

> Backend-specific **class diagram** and **layer diagram** are pending in
> [`docs/diagrams`](./docs/diagrams) (the client diagrams describe the game domain, not the API).

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

The OpenAPI JSON is available at `/api/docs-json` and is used as the source of truth for the Pact
**contract tests** shared with the client.

---

## 🧩 Design Patterns (GoF)

| Category | Pattern | Where / Why |
| --- | --- | --- |
| Creational | **Factory** | Build domain entities from persistence models in mappers. |
| Creational | **Singleton** | Nest providers are singletons by default (e.g. `PrismaService`, config). |
| Structural | **Adapter** | `PrismaUserRepository` adapts Prisma to the `IUserRepository` port. |
| Structural | **Facade** | `AuthFacade` simplifies hashing + token issuing for controllers. |
| Behavioral | **Strategy** | Pluggable token service (`JwtTokenService`) and scoring/ranking strategy. |
| Behavioral | **Decorator** | Use-case decorators add logging, metrics, auth, and caching (AOP). |

---

## 🔠 SOLID Principles

- **S — Single Responsibility.** Controllers handle HTTP, use cases handle orchestration, repositories
  handle persistence — never mixed.
- **O — Open/Closed.** New endpoints/use cases are added without modifying existing ones; new repository
  backends extend the port, not the use case.
- **L — Liskov Substitution.** Any `IUserRepository` implementation (Prisma, in-memory for tests) is
  substitutable without breaking use cases.
- **I — Interface Segregation.** Narrow ports (`ITokenService`, `IHasher`, `IUserRepository`) instead of
  one service interface.
- **D — Dependency Inversion.** Use cases depend on ports injected via Nest's DI container; concretions
  are wired in the infrastructure modules.

---

## 🪡 Aspect-Oriented Programming (AOP)

Cross-cutting concerns are separated from business logic **without an AOP library**, using the
**Decorator pattern over a shared `UseCase<I, O>` port** (SOLID-based strategy). Use cases are wrapped
at module-wiring time:

- **Logging & tracing** — `LoggingUseCaseDecorator` records input/output and duration of each use case.
- **Centralized exception handling** — a global Nest **exception filter** plus a decorator apply
  consistent error mapping, retries, and fallbacks for network/persistence failures.
- **Security / authorization** — `AuthorizationUseCaseDecorator` verifies an active session before
  protected use cases (save progress, leaderboard writes) execute.
- **Result caching** — `CachingUseCaseDecorator` memoizes `GetLeaderboardUseCase` while data is unchanged.

The business code never references a logger, auth checker, or cache — decorators compose around the
shared `execute()` contract.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20 and **npm**
- **PostgreSQL** ≥ 14 (or Docker)
- A `.env` file (see `.env.example`)

### Installation

```bash
git clone <backend-repo-url> ArrowMaze-Backend
cd ArrowMaze-Backend
npm install
cp .env.example .env        # set DATABASE_URL and JWT_SECRET
npx prisma migrate dev      # create the schema
npm run seed                # optional: seed the 15 levels + demo users
```

### Run locally

```bash
npm run start:dev    # watch mode at http://localhost:3000
npm run start:prod   # production build
```

---

## 🧪 Running Tests

```bash
npm test               # unit tests (Jest, AAA, should_..._when_...)
npm run test:e2e       # integration tests (Supertest + in-memory/test DB)
npm run test:contract  # Pact contract verification against the client
npm run test:cov       # coverage
```

- **Unit** — entities, use cases, and services in isolation with mocked ports.
- **Integration** — real use cases against a test database; HTTP endpoints via Supertest end-to-end.
- **Contract** — Pact verifies the client⇄backend contract holds across changes.
- CI runs all suites on every Pull Request (`.github/workflows/ci.yml`).

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
