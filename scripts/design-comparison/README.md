# Local design comparison

From the repository root, using Node 22+ and the project's installed dependencies:

```sh
npm ci
node scripts/design-comparison/prepare.mjs
node scripts/design-comparison/start.mjs
```

Open <http://127.0.0.1:5182/superpowers/comparison/index.html>. Four Vite servers use strict ports 5180 (original), 5181 (previous), 5182 (current hybrid working tree), and 5183 (preserved independent design). Ctrl+C stops only the child servers launched by `start.mjs`. An occupied port causes a useful error; these tools never kill an existing process. Stop comparison servers before running prepare again.

The default refs are `develop`, `feature/mobile-design`, and `feature/brand-ui-comparison` (the comparison initially used `318f31c` and `36ff3e2`). Pin or override refs when needed:

```sh
ORIGINAL_REF=318f31c PREVIOUS_REF=36ff3e2 node scripts/design-comparison/prepare.mjs
```

`prepare.mjs` resolves refs to commit SHAs, extracts independent Git archives into ignored `superpowers/comparison/sources/{original,previous,independent}`, and uses the current checkout for the new design. It never edits an existing original or previous checkout. A matching previous worktree's installed dependencies are reused when available; otherwise all snapshots use the current repository's `node_modules`. No dependencies are installed by these scripts. Assets are read directly from the previous Git ref's `src/mocks/assets` tree.

The tracked fixture data, fixture API, and templates are copied into the ignored runtime. `sources.json` records refs, resolved SHAs, dependency paths, fixture/API/asset SHA-256 hashes, and display variants. The current working tree's uncommitted product edits are included in the new preview. Generated absolute paths are local to that manifest/config and must be prepared again after moving the checkout.

Only the generated comparison configs enable fixture API middleware, a synchronous comparison-only AuthProvider (anonymous on `/login`, signed in on protected views), a display-only user, search initialization, and the inert socket alias. Real authentication, router and API clients remain unchanged; ordinary mock aliases are enabled only by dev serve and explicitly disabled for every production build. Display fixtures cover default, `?demo=empty`, `?demo=error`, `?text=200`, and search `?q=수국`. OAuth, uploads, mutation requests, and actual STOMP messaging are intentionally unavailable in this preview. Existing screen captures are linked by the hub when present; these commands do not generate screenshots.

For syntax-only verification without preparing or restarting a live capture session:

```sh
node --check scripts/design-comparison/prepare.mjs
node --check scripts/design-comparison/start.mjs
node --check scripts/design-comparison/fixture-api.mjs
```

The comparison validator must match the final pathname to the requested pathname before accepting a screenshot. A successful login-page render is not evidence that a protected page rendered. Recommendation style fixture IDs use the actual uppercase PICK_STYLES enum.

Capture a screen using an already installed Lighthouse (no automatic dependency install):

```sh
node scripts/design-comparison/capture.mjs --url=http://127.0.0.1:5182/settings --name=new-settings-375 --width=375
node --test scripts/design-comparison/validate.check.mjs
```

Set LIGHTHOUSE_CLI or pass --lighthouse when the existing installation is outside the comparison worktrees. The command validates the final origin/path/query, expected content and viewport before publishing PNG/summary files. Redirected login pages are rejected. Each capture has its own configuration directory for concurrent runs. An invalid replacement removes the old published PNG to prevent stale evidence.

## Selected hybrid and ordinary mock mode

```sh
npm run dev:mock -- --host 127.0.0.1 --port 5184 --strictPort
node --test scripts/mock-safety.check.mjs
```

The ordinary mock app uses48 date-varied sample festivals and a sample manager without login. Its top menu opens all supported views. State-changing requests return a read-only notice; OAuth, real uploads and STOMP are not executed. Mock `?q=` examples are initialization for review only. Production builds force the mock flag false even when VITE_ENABLE_MSW=true; generated comparison configs reject build commands entirely. The comparison uses the same fixed4-festival fixture for every variant. Hybrid screenshots use `hybrid-compare-` and the preserved independent variant uses the original `new-` capture prefix, so the final column never points at an old independent screenshot.
