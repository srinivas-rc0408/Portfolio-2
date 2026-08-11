# Project instructions — portfolio.sh

## Graph-first context retrieval (token discipline)

This repo has a persistent Graphify knowledge graph at `graphify-out/graph.json`
(built from the code via AST). **Use it as the primary way to understand the
codebase.** It is far cheaper than reading files.

### 1. Graph-first — required
For ANY question about the architecture, where a feature lives, relationships,
dependencies, or "what calls X / what does Y depend on": **query the graph
first**, before any `grep`/`glob`/file read.

```bash
graphify query "<question>"          # BFS context around a concept
graphify explain "<NodeName>"        # a node + its neighbors, in plain language
graphify path "A" "B"                # shortest dependency path between two nodes
graphify affected "<NodeName>"       # reverse-trace: what breaks if this changes
graphify god-nodes --top 15          # most-connected hubs
```
Do NOT `grep`/`glob`/read whole files (`page.tsx`, `layout.tsx`, …) just to
orient. That is the slow, token-heavy path and is not allowed for discovery.

### 2. Surgical file reads — only after the graph
Once the graph has located the exact node(s), read **only** the specific
file:line ranges it cites (the graph gives `src=… loc=Lnn`). Never read an
entire file when a function or a 20-line window answers the question.

### 3. Use the graph for architecture work
- **Impact analysis / refactors:** `graphify affected "<sharedUtil>"` before
  changing any shared helper — it lists everything that would break.
- **Dead-code sweeps:** use the graph's weakly-connected / orphaned nodes to
  find unused exports and components.
- **Explaining a module:** base the explanation on the graph's node
  relationships, not raw source.

### Keeping the graph fresh
After non-trivial code changes, refresh incrementally (fast, no LLM):
```bash
graphify update .
```
`graphify-out/` is gitignored (regenerable, ~7 MB).

> Known skew: `public/pdf.worker.min.mjs` is a vendored minified bundle whose
> functions dominate the god-nodes. The real app hubs are in `lib/cms.ts`,
> `lib/auth.ts`, `components/TerminalComp.tsx`, and `app/api/*`. Prefer
> `graphify affected/explain` on named app symbols over the raw god-node list.
