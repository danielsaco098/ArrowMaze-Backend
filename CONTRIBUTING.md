# Contributing — Arrow Maze Backend

Thanks for contributing! This repo follows industry conventions so the Git history stays clean and the
team's individual participation is verifiable.

## Branching workflow

- `main` is **protected**: no direct pushes, no force-push. All changes land via Pull Request.
- Branch off `main` using a descriptive name:
  - `feat/auth-jwt-login`
  - `fix/leaderboard-tie-ordering`
  - `test/sync-progress-use-case`
  - `docs/swagger-endpoints`
- Keep commits **small and frequent** so AI-assisted vs. hand-written changes are traceable.

## Conventional Commits (required, in English)

Format: `type(scope): subject`

| Type | Use for |
| --- | --- |
| `feat` | A new feature |
| `fix` | A bug fix |
| `test` | Adding or fixing tests |
| `docs` | Documentation only |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `chore` | Tooling, deps, CI config |
| `style` | Formatting only |
| `perf` | Performance improvement |

**Suggested scopes:** `auth`, `user`, `progress`, `leaderboard`, `levels`, `use-case`, `repository`,
`swagger`, `db`, `ci`.

**Examples:**

```
feat(auth): add JWT login endpoint
fix(leaderboard): order ties by earliest timestamp
test(use-case): add unit tests for SyncProgressUseCase
docs(swagger): document progress sync schema
refactor(repository): extract IUserRepository port
```

Commit format is validated automatically by **commitlint** via a Husky `commit-msg` hook
(`npm install` sets it up).

## Pull Request checklist

- [ ] Branch is up to date with `main`.
- [ ] Commits follow Conventional Commits.
- [ ] `npm test` and `npm run test:e2e` pass locally and **CI is green**.
- [ ] New/changed behavior is covered by tests (AAA, `should_<expected>_when_<condition>`).
- [ ] Swagger annotations updated for any endpoint change.
- [ ] No secrets or credentials committed (`.env` is git-ignored).
- [ ] PR description explains the change and links the related task.

At least one teammate reviews and approves before merge. Prefer **squash merge** to keep `main` linear.
