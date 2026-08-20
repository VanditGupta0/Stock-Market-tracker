# Signalist Homepage Starter

This is a clean-room, runnable checkpoint intended for following the Signalist stock-app tutorial through the **layout + header + homepage/TradingView dashboard** stage.

It intentionally does **not** include the later authentication, database, search, watchlist, alerts, admin, Inngest, or AI functionality.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## What is included

- Next.js App Router
- Root layout and `(root)` layout
- Responsive sticky header
- Navigation links
- Demo user dropdown
- TradingView widget wrapper + hook
- Homepage with four dashboard widgets
- Dark dashboard styling
- Local placeholder Signalist logo

The repository checkpoint that informed the scope is the upstream `20d06cf` homepage merge, where the upstream project introduced the TradingView home page after the header work.
