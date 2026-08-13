import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Standalone Node sub-project with its own package.json
    "curl/**",
    // Vendored, pre-minified pdf.js worker shipped as a static asset. Linting
    // it produced 1441 warnings and 7 of the 10 errors, drowning the real
    // findings in this repo's own code — and none of it is ours to fix.
    "public/pdf.worker.min.mjs",
  ]),
]);

export default eslintConfig;
