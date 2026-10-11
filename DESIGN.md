# Daily Water — design

## Intent
Refresh the existing Water Tracker as a visual companion to Daily Fuel. Keep the established repository URL, device records, quick-add quantities (8, 16, 25, 32 oz), goal, undo, daily reset, swipe navigation, and four chart ranges.

## Visual direction
Ink navy (#0c1220) with electric blue, cyan, hot pink, and violet. Bundled DM Sans handles controls and numbers; DM Serif Display provides warm editorial headings. A large cyan hydration ring and blue-lit card show intake and remaining ounces. A vivid violet-to-magenta card adds encouragement. Four colorful glass/bottle shortcuts make logging obvious. Dark sip-log and insight cards give information room to breathe. Safe-area-aware bottom navigation, readable contrast, 44px targets, reduced-motion support, and scrollable dialogs suit the phone.

## Screen hierarchy
Today: brand, hydration-day date, ring/remaining/goal, encouragement, quick add, undo/reset, recent sips. Insights: Day/Week/Month/Year chart, summary, range definitions. Both link to Daily Fuel. Keep swipe navigation and add labeled bottom buttons; the offscreen panel becomes inert to avoid keyboard focus landing on invisible controls.

## Compatibility and behavior
Do not change data.js or the storage schema. History remains in wt:data:v1 and the goal in water_goal. Existing 5 AM behavior uses the device's local clock; the old text said Central but the implementation was local, so the new text describes it accurately. Goal defaults remain unchanged. App closure and reload retain saved records. Chart aggregates retain their existing definitions, including calendar averages with unlogged days. Sip history retains the existing 30-day detailed-entry limit while historical daily totals remain available.

Use the same published path so phone storage remains accessible. No cloud migration, merging with Daily Fuel records, or health recommendations. Explicit website-data deletion can still erase records. New reset confirmation prevents accidental clearing of today's entries. Goal editing uses a labeled dialog rather than a browser prompt. Save failures must be visible; do not report successful saves when a write failed.

## Offline and installed app
Bundle the existing Chart.js version and fonts. Precache the app under /water-tracker/ with a separate daily-water cache namespace; never intercept /daily-fuel/ or delete its cache. Version caches by content. Correct the Apple touch icon path and provide matching icons. App updates keep storage keys and the original data layer intact.

## Verification
Write new view/offline behavior tests first, observe failure, implement, rerun. Add a regression test against a legacy saved record and the 5 AM boundary. Browser-check quick additions, undo, goal dialog, reset cancellation, range switching, phone layout, reload, and offline access. Actual home-screen/camera behavior is not claimed from desktop QA.
