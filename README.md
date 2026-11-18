# 🎁 Wichtel Shopper™

A Secret Santa (Wichteln) gift finder for students in Germany. Enter how many gifts you need and your total budget, and it builds ready-to-shop lists from real products at **dm, Rossmann, Aldi Nord, Rewe, Action, TEDi, Kaufland and Lidl**, grouped by store so you can walk in and grab.

**Live:** https://s1nc0de.github.io/wichtel-shopper/

## Features
- Skyscanner-style results: **Best / Cheapest / Fewest stops**, with 1–10 combinations to compare
- Shopping list per store with real product names, sizes and prices, plus links to each store's site
- Optional 2-item bundles per gift (e.g. chocolate Santa + lip balm) and gift bags
- **My list**: add any item, gift or whole combination, change quantities, remove items, delete the list (with undo), and copy it to share
- **Stores near you**: tick the stores you can reach (remembered in your browser), enter your postcode for a "find nearest" map link per store
- Browse and search all products

## About the prices
Prices are a snapshot read from each store's own website (date shown in the app). A static page can't fetch live prices because the store sites block cross-site requests and there's no public price API.
- Rewe prices: Hamburg (PLZ 20457). Aldi: Aldi Nord.
- Kaufland: weekly offers only, since its regular shelf prices aren't online.
- Lidl: shelf prices aren't online, so its one item comes from the Verbraucherzentrale Hamburg price check.
- Woolworth: no online prices, so it isn't included.

## Builds
| Version | Date | Changes |
|---|---|---|
| v1.0 | 2026-11-18 | Real products and prices, Skyscanner-style layout, up to 10 combinations, My list with delete/undo, stores-near-you picker |
| v1.1 | 2026-11-18 | Copyright and trademark notices, LICENSE |

Single-file app: everything lives in `index.html` (no build step).

## Copyright & trademark
© 2026 Jayant Singh Amethia ([@S1NC0DE](https://github.com/S1NC0DE)). All rights reserved. See [LICENSE](LICENSE).

Wichtel Shopper™ is a trademark of Jayant Singh Amethia. Store and product names are trademarks of their respective owners. This project is independent and not affiliated with any of the stores listed.
