// Hook PreToolUse (Bash): bloquea un `git commit` si fallan los tests o si hay un secreto en staging.
// Lee el JSON de la llamada por stdin. Exit 2 bloquea y devuelve stderr al agente; exit 0 deja pasar.
import { spawnSync } from 'node:child_process'
import { basename } from 'node:path'

const SECRET_PATTERNS = [
  [/AKIA[0-9A-Z]{16}/, 'una clave de acceso de AWS (AKIA...)'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'una llave privada'],
]

function block(message) {
  console.error(message)
  process.exit(2)
}

let raw = ''
for await (const chunk of process.stdin) raw += chunk

let input
try {
  input = JSON.parse(raw)
} catch {
  process.exit(0)
}

const command = input?.tool_input?.command
if (typeof command !== 'string' || !/\bgit\s+(?:-\S+\s+)*commit\b/.test(command)) {
  process.exit(0)
}

const cwd = process.env.CLAUDE_PROJECT_DIR || input.cwd || process.cwd()

const names = spawnSync('git', ['diff', '--cached', '--name-only'], { cwd, encoding: 'utf8' })
const envFile = (names.stdout || '')
  .split('\n')
  .find((file) => /^\.env(\..+)?$/.test(basename(file)) && !/\.(example|sample)$/.test(file))
if (envFile) {
  block(`Commit bloqueado: ${envFile} está en staging y los .env no se suben. Sácalo con "git restore --staged ${envFile}" y agrégalo al .gitignore.`)
}

const diff = spawnSync('git', ['diff', '--cached', '--unified=0'], {
  cwd,
  encoding: 'utf8',
  maxBuffer: 64 * 1024 * 1024,
})
const added = (diff.stdout || '').split('\n').filter((line) => line.startsWith('+') && !line.startsWith('+++'))
for (const [pattern, label] of SECRET_PATTERNS) {
  if (added.some((line) => pattern.test(line))) {
    block(`Commit bloqueado: el diff en staging trae ${label}. Quítala del código, usa una variable de entorno y rota la credencial si ya estuvo en algún archivo.`)
  }
}

const tests = spawnSync('npm', ['test'], { cwd, encoding: 'utf8', shell: true })
if (tests.status !== 0) {
  const tail = `${tests.stdout || ''}${tests.stderr || ''}`.trim().split('\n').slice(-25).join('\n')
  block(`Commit bloqueado: npm test falló (código ${tests.status}). Arregla el test o el código, o pide ayuda si no sale.\n\n${tail}`)
}

process.exit(0)
