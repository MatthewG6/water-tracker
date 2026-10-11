# Daily Water

The existing Water Tracker, refreshed as Daily Fuel's vibrant companion.

Live: https://matthewg6.github.io/water-tracker/

- Cyan hydration ring, daily goal, 8/16/25/32 oz shortcuts, undo, and reset confirmation.
- Recent sip log and Day/Week/Month/Year insights.
- Device-local history, bundled fonts/charts, offline app shell, and Home Screen icons.
- Link to Daily Fuel; each app retains its own records.

## Development
Buildless HTML/CSS/JavaScript. Run from this folder with Node 24:

```sh
node --test tests/*.cjs
node --check app.js
node scripts/build.cjs
python3 -m http.server 4174 --bind 127.0.0.1
```

Run the cache build after changing app resources. GitHub Pages serves the existing main branch at the repository root. DESIGN.md records decisions; TASKS.md records verification.

## Existing data
Records remain under wt:data:v1, with water_goal storing the daily target. The data layer is unchanged. The hydration day starts at 5 AM in the device's time zone. Daily totals remain saved; detailed sip entries retain the original 30-day limit. Data stays on the device and is never pushed to GitHub. Clearing website data can erase it.

Charts use the existing Chart.js 4.4.1 (MIT), bundled from its npm distribution. Fonts are bundled with their licenses in fonts/. The app has no account or cloud sync.
