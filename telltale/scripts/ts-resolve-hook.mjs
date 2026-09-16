/**
 * Node strips TypeScript types natively but will not resolve TypeScript's
 * extensionless relative imports (`./types` → `./types.ts`). This hook adds
 * that one behaviour so verify-fixtures.mjs can import the real fixture
 * modules instead of a parsed copy of them — the verifier must check the same
 * objects the app renders, not a re-implementation.
 */
export async function resolve(specifier, context, nextResolve) {
  const isRelative = specifier.startsWith("./") || specifier.startsWith("../");
  const hasExtension = /\.[cm]?[jt]sx?$/i.test(specifier);
  if (isRelative && !hasExtension) {
    try {
      return await nextResolve(`${specifier}.ts`, context);
    } catch {
      // fall through to default resolution
    }
  }
  return nextResolve(specifier, context);
}
