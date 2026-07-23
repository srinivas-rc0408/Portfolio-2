/**
 * Serialize an object for embedding in a JSON-LD <script>. Escapes `<` as
 * `<` so a string value containing `</script>` (or `<!--`) can never break
 * out of the script element — the standard, XSS-safe way to inline JSON-LD.
 * (Plain JSON.stringify does NOT neutralize `</script>`.)
 */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
