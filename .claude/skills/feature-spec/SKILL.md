---
name: feature-spec
description: Start a feature with a lightweight spec-driven flow — spec, plan, tasks — before writing code.
disable-model-invocation: true
argument-hint: [feature-name]
---

# Spec-driven feature: $ARGUMENTS

Create `specs/<NNN>-<feature-name>/` (NNN = next number across **both** wokil repos' `specs/` dirs) with three files, pausing for user review after each:

1. **spec.md** — what & why only, no tech choices: problem, user stories, acceptance criteria (testable), out of scope. Ask the user targeted questions for anything ambiguous before writing.
2. **plan.md** — how, against the repo's CLAUDE.md rules: affected repos/services (wokil-go / wokil-django / wokil-frontend), schema changes, API contract changes (new `ApiEndpoints`), risks. Cross-repo features: one plan, with a per-repo section.
3. **tasks.md** — small, dependency-ordered checklist; each task names its repo, files, and the acceptance criterion it satisfies. Backend schema/API tasks come before frontend consumption tasks.

Then implement task-by-task, checking off `tasks.md` and verifying each against spec.md's acceptance criteria. The spec lives in the repo where work starts; reference it by path from the other repo.
