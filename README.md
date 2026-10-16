# Workshop Devs: template brownfield Tesseron

Respaldo del lab **Técnicas aplicadas de IA generativa en desarrollo de software**. Úsalo si no tienes escritura en el repo de tu empresa (CodeCommit).

Es un producto de mentira: un listado de facturas de **Andes Lab**. El pedido de tesorería está en `tickets/T-01.md`. El equipo escribe la spec.

## Pre-flight

Una persona del equipo usa **Use this template > Create a new repository**, lo crea en su cuenta como **Private** e invita al resto con permiso de escritura. No hagan fork: un fork de este repo queda público.

```bash
git clone git@github.com:<cuenta>/<repo-del-equipo>.git
cd <repo-del-equipo>
npm test
```

Necesitas Node 20, git, `gh` y Claude Code con sesión iniciada (CLI o escritorio). Abre Claude Code en este directorio.

## Loop

`Ticket → SPEC.md → PLAN.md → test de aceptación (rojo) → story → PR → review → merge`

El protocolo está en `AGENTS.md`. El equipo tiene un `SPEC.md` y un `PLAN.md`. Cada persona tiene una rama `feat/<ticket-id>-story-<n>`.

## Qué trae este repo

- Código y tests que pasan en `main` (`npm test`).
- El ticket `tickets/T-01.md`.
- `CLAUDE.md` de una línea (`@AGENTS.md`) y `AGENTS.md`.
- Plantillas vacías: `workdocs/SPEC.md`, `workdocs/PLAN.md` y `workdocs/status.md`. En `status.md` cada persona edita su fila en su rama.
- Las skills `grill-me`, `plan-worktree`, `test-rojo` y `pr-tesseron`.
- El PR template Tesseron.
- CI mínima en `main` y en los PRs.

No trae la spec llena: eso es M1.

## Catálogo de skills (18:00)

Tres skills para M3 a M6. El relator apunta a [`CATALOG.md`](./CATALOG.md), que explica dónde van según la carpeta donde abres Claude Code y cómo abrir el PR en GitHub o en CodeCommit. `grill-me` ya está en el repo.

## Hook de tests antes del commit

El template trae un hook de Claude Code que bloquea un `git commit` si `npm test` falla, o si en staging hay algo con forma de secreto (clave `AKIA...`, llave privada o un archivo `.env`). Con otros comandos no hace nada. Está en Node, así que corre igual en macOS, Linux y Windows.

Para llevarlo a un repo que ya creaste desde el template, copia estos dos archivos y haz commit:

- `.claude/settings.json` (si ya tienes uno, agrega solo el bloque `hooks`)
- `.claude/hooks/tests-antes-del-commit.mjs`

Reinicia Claude Code en ese directorio para que cargue el hook.
