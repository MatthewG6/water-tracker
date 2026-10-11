# Daily Water — refresh tasks

- [x] Inspect repository, storage, daily reset, charts, and GitHub Pages settings.
- [x] Create DESIGN.md and task record.
- [x] View-helper TDD: two tests failed before view.js existed, then passed.
- [x] Verify an existing wt:data:v1 record loads, preserves history, and uses the same 5 AM reset boundary.
- [x] Offline TDD: navigation test failed before sw.js existed, then passed.
- [x] Build the Daily Fuel companion design, ring, quick-add cards, sip log, dialogs, and navigation.
- [x] Bundle existing chart version/fonts; refresh icons and installed-app metadata.
- [x] Browser verify 390px layout, add/undo, goals, reset cancellation, chart ranges, and reload.
- [x] Verify offline cache and reload without server.
- [x] Publish to existing GitHub Pages URL and verify deployment.

Data layer and storage keys remain unchanged. Goal-setting retains the existing goal. Detailed entries keep their existing 30-day limit; daily totals keep their existing retention.

## Verification record
- Four automated tests pass; JavaScript syntax checks pass. Two view tests and one offline test failed before implementation, then passed.
- Synthetic browser test: 8 + 16 + 25 + 32 oz = 81 oz; undo returned 49 oz. Set goal 64 oz; adding 25 yielded 74 oz / 115%, with zero remaining. Undo and reset cancellation retained 49 oz. Reload retained 49 oz and 64 oz goal.
- Day/Week/Month/Year range switches verified. Phone width 390px has no horizontal document overflow. Offscreen page sizing avoids a large empty scroll region.
- Server stopped, app reloaded from cache, saved total and weekly chart still worked.
- data.js is byte-for-byte unchanged from the existing main branch.
- Published app rendered successfully at https://matthewg6.github.io/water-tracker/. GitHub Pages deployment succeeded. Original manifest start URL/installed identity is preserved.
