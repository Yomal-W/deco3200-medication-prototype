// Lets Node's built-in test runner load the app's TypeScript modules, whose
// relative imports leave off the ".ts" extension (Vite resolves those itself).
// Node strips the types; nothing is compiled or bundled.
import { registerHooks } from 'node:module'

registerHooks({
  resolve(specifier, context, nextResolve) {
    const relative = specifier.startsWith('./') || specifier.startsWith('../')
    if (relative && !/\.[cm]?[jt]sx?$/.test(specifier)) {
      try {
        return nextResolve(`${specifier}.ts`, context)
      } catch {
        // Not a .ts module; fall through to normal resolution.
      }
    }
    return nextResolve(specifier, context)
  },
})
