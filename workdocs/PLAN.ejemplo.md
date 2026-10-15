# PLAN.ejemplo.md

Esto es un ejemplo lleno para T-01, de respaldo si tu grupo se traba. El PLAN de tu equipo sale de tu SPEC, no de este archivo.

Misma estructura que `workdocs/PLAN.md`: cada story tiene una persona, un worktree, una rama `feat/<ticket-id>-story-<n>` y un PR.

## Stories

### Story 1: `feat/T-01-story-1`

**Persona:** (la que tome esta story)

**Qué entra:** la función pura que convierte facturas en texto CSV listo para Excel.

**Diseño técnico (qué toca, contratos, orden):**

1. Crear `src/csv.js` con `export function toCsv(invoices)`. Recibe el arreglo de `listInvoices()` y devuelve un string. No lee archivos ni toca `process`.
2. Formato: cabecera `id;cliente;fecha;monto;estado`, separador `;`, fin de línea `\r\n`, BOM UTF-8 (los bytes EF BB BF, U+FEFF) al inicio para que Excel de Windows lea bien los acentos. Monto como número, sin símbolo ni puntos de miles.
3. Escape RFC 4180: un campo que contiene `;`, `"` o salto de línea va entre comillas, y las comillas internas se duplican.

**Test de aceptación (falla antes de codear):** `test/csv.test.js`. Verifica que el string parte con BOM + cabecera, que usa `;` y `\r\n`, que el monto sale como número y que un cliente con `;` o `"` queda escapado. Falla porque `src/csv.js` no existe.

### Story 2: `feat/T-01-story-2`

**Persona:** (la que tome esta story)

**Qué entra:** el filtro de facturas por mes y por anuladas.

**Diseño técnico (qué toca, contratos, orden):**

1. Crear `src/filters.js` con `export function filterInvoices(invoices, { month, includeVoid } = {})`. Pura, devuelve un arreglo nuevo.
2. Las facturas `void` quedan fuera por defecto, y entran solo con `includeVoid: true`.
3. `month` en formato `YYYY-MM`, compara contra el inicio de `issuedAt`. Sin `month` no filtra por fecha.

**Test de aceptación (falla antes de codear):** `test/filters.test.js`. Verifica que por defecto no aparece ninguna `void`, que `includeVoid` las trae, y que `month: '2026-08'` deja solo las de agosto. Falla porque `src/filters.js` no existe.

### Story 3: `feat/T-01-story-3`

**Persona:** (la que tome esta story)

**Qué entra:** el comando `export-csv` en la CLI, que une las dos funciones y escribe el archivo.

**Diseño técnico (qué toca, contratos, orden):**

1. Agregar el comando `export-csv` en `src/cli.js` (es la única story que toca ese archivo) con los args `--month <YYYY-MM>`, `--include-void` y `--out <archivo>`.
2. Flujo: `listInvoices()`, luego `filterInvoices(..., { month, includeVoid })`, luego `toCsv(...)`, y se escribe en `--out` (por defecto `facturas.csv`).
3. Errores con código 1 y mensaje a stderr: `--month` con formato inválido, `--out` sin valor o archivo que no se puede escribir.

**Test de aceptación (falla antes de codear):** `test/cli.test.js`. Corre el comando con `node:child_process` sobre un directorio temporal y verifica que se crea `facturas.csv`, que `--out` cambia el nombre, que `--month` y `--include-void` se respetan y que un mes inválido sale con código 1. Falla porque el comando no existe.

## Orden

Story 1 y story 2 son independientes: se trabajan en paralelo. Story 3 puede partir de inmediato con las firmas acordadas (`toCsv(invoices)` y `filterInvoices(invoices, { month, includeVoid })`) y stubs, y se integra cuando las otras dos están en `main`.
