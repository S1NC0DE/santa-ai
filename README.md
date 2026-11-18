# 🎅 Santa.ai™

A Secret Santa (Wichteln) gift finder for students in Germany. Enter how many gifts you need and your total budget, and it builds ready-to-shop lists from real products at **dm, Rossmann, Aldi Nord, Rewe, Action, TEDi, Kaufland and Lidl**, grouped by store so you can walk in and grab.

**Live:** https://s1nc0de.github.io/wichtel-shopper/

_(formerly “Wichtel Shopper”)_

## Features
- Skyscanner-style results: **Best / Cheapest / Fewest stops**, with 1–10 combinations to compare
- Shopping list per store with real product names, sizes and prices, plus links to each store's site
- Optional 2-item bundles per gift (e.g. chocolate Santa + lip balm) and gift bags
- **My list**: add any item, gift or whole combination, change quantities, remove items, delete the list (with undo), and copy it to share
- **Stores near you**: tick the stores you can reach (remembered in your browser), enter your postcode for a "find nearest" map link per store
- **English / Deutsch** language switch (remembers your choice)
- **Impossible budgets handled**: e.g. 20 gifts for €1 explains why and offers one-tap fixes (raise budget, fewer gifts, allow identical gifts, more stores)
- **Stores near you, automatically**: type any Hamburg postcode (or tap “Use my location”) and every store within 1–5 km is ticked, with the nearest branch address and distance. Branch data comes from OpenStreetMap and is refreshed every Monday by a GitHub Action (`.github/workflows/refresh-locations.yml`)
- **Christmas theme** with live snowfall, twinkling lights and a passing sleigh (respects “reduce motion”)
- Offers expire automatically after their end date; price age is shown live
- Browse and search all products

## Regression testing
Report: **https://s1nc0de.github.io/wichtel-shopper/report.html**

Run it yourself: `cd tests && npm install && npm test` (runs the real `index.html` in jsdom for 50 Hamburg postcodes × 7 budget scenarios and rewrites `report.html`).

## About the prices
Prices are a snapshot read from each store's own website (date shown in the app). A static page can't fetch live prices because the store sites block cross-site requests and there's no public price API.
- Rewe prices: Hamburg (PLZ 20457). Aldi: Aldi Nord.
- Kaufland: weekly offers only, since its regular shelf prices aren't online.
- Lidl: shelf prices aren't online, so its one item comes from the Verbraucherzentrale Hamburg price check.

## Builds
| Version | Date | Changes |
|---|---|---|
| v1.0 | 2026-11-18 | Real products and prices, Skyscanner-style layout, up to 10 combinations, My list with delete/undo, stores-near-you picker |
| v1.1 | 2026-11-18 | Copyright and trademark notices, LICENSE |
| v1.2 | 2026-11-18 | EN/DE switch, impossible-case handling, postcode store selection, offer expiry, regression suite (50 postcodes × 7 scenarios, 59,559 checks, all passing) |
| v1.3 | 2026-11-18 | Renamed to Santa.ai, Christmas theme with animated background, live postcode/location → nearby stores for any Hamburg postcode, weekly location refresh Action |
| v1.4 | 2026-11-18 | Product photos (from the stores' own image servers), ⓘ help on every field, clearer "Search radius", Woolworth removed (no online prices) |
| v1.5 | 2026-11-18 | Wrapping section (gift bags or paper + ribbon, real prices from Action, dm, TEDi), shown separately and not counted in the gift budget |

Single-file app: everything lives in `index.html` (no build step).

## Copyright & trademark
© 2026 Jayant Singh Amethia ([@S1NC0DE](https://github.com/S1NC0DE)). All rights reserved. See [LICENSE](LICENSE).

Santa.ai™ is a trademark of Jayant Singh Amethia. Store and product names are trademarks of their respective owners. This project is independent and not affiliated with any of the stores listed.
