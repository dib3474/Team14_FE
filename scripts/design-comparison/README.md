# Local design comparison

From the repository root, using Node 22+ and the project's installed dependencies:

```sh
npm ci
node scripts/design-comparison/prepare.mjs
node scripts/design-comparison/start.mjs
```

Open <http://127.0.0.1:5182/superpowers/comparison/index.html>. The three Vite servers use strict ports 5180 (original), 5181 (previous), and 5182 (current working tree). Ctrl+C stops only the child servers launched by `start.mjs`. An occupied port causes a useful error; these tools never kill an existing process. Stop comparison servers before running prepare again.

The default refs are `develop` and `feature/mobile-design` (the comparison initially used `318f31c` and `36ff3e2`). Pin or override refs when needed:

```sh
ORIGINAL_REF=318f31c PREVIOUS_REF=36ff3e2 node scripts/design-comparison/prepare.mjs
```

`prepare.mjs` resolves refs to commit SHAs, extracts independent Git archives into ignored `superpowers/comparison/sources/{original,previous}`, and uses the current checkout for the new design. It never edits an existing original or previous checkout. A matching previous worktree's installed dependencies are reused when available; otherwise all snapshots use the current repository's `node_modules`. No dependencies are installed by these scripts. Assets are read directly from the previous Git ref's `src/mocks/assets` tree.

The tracked fixture data, fixture API, and templates are copied into the ignored runtime. `sources.json` records refs, resolved SHAs, dependency paths, fixture/API/asset SHA-256 hashes, and display variants. The current working tree's uncommitted product edits are included in the new preview. Generated absolute paths are local to that manifest/config and must be prepared again after moving the checkout.

Only the generated comparison configs enable fixture API middleware, anonymous `/login`, a display-only user, search initialization, and the inert socket alias. Production config, authentication, router, and API code are untouched. Display fixtures cover default, `?demo=empty`, `?demo=error`, `?text=200`, and search `?q=수국`. OAuth, uploads, mutation requests, and actual STOMP messaging are intentionally unavailable in this preview. Existing screen captures are linked by the hub when present; these commands do not generate screenshots.

For syntax-only verification without preparing or restarting a live capture session:

```sh
node --check scripts/design-comparison/prepare.mjs
node --check scripts/design-comparison/start.mjs
node --check scripts/design-comparison/fixture-api.mjs
```
