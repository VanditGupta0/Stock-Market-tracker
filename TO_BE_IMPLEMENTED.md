# To Be Implemented

Features and fixes to work on later. Remove an item from this file once it's done.

## Fixes

- [ ] **Two separate portfolio systems.** `/agent` saves its portfolio in the browser's `localStorage`, so it's lost on another device. `/paper-trader` saves to MongoDB.
- [ ] **No tests.** There is no `test` script in `package.json`, and the lint script is misspelled as `linyt`.
- [ ] **MongoDB username in the server log.** The server log prints the MongoDB username and cluster address (the password is hidden).

## New features

### Most impact for the effort

1. [ ] **Price alerts.** For example: "Tell me when INFY goes below ₹1,800". Store them in a MongoDB collection, check them every few minutes with an Inngest scheduled job, and send an email or an in-app notification. The live quote helper in `lib/market/liveQuotes.ts` already covers NSE and US prices.
2. [ ] **Combine `/agent` and `/paper-trader` into one portfolio saved in MongoDB.** Then it works on any device and the daily email can include it.
3. [ ] **A real-time ticker.** Finnhub has a free live price feed (`wss://ws.finnhub.io`) that could update watchlist prices and position P&L as they change.

### Investor tools

4. [ ] **A portfolio tracker for real holdings.** Enter buy price and quantity, or import a broker CSV from Zerodha or Groww. Show XIRR, how money is spread across sectors, and a comparison with NIFTY 50.
5. [ ] **A stock screener.** Filter by P/E, market cap, sector, 52-week high/low and RSI, using Finnhub's company metrics.
6. [ ] **Strategy backtesting.** Run the paper trader's rules (for example, stop-loss 5% and take-profit 10%) on past prices and show the equity curve, maximum drop and win rate.
7. [ ] **Side-by-side comparison of 2–4 stocks**, with key numbers and charts.
8. [ ] **An earnings and dividend calendar** for watchlist stocks, using Finnhub's earnings calendar.

### AI features (Gemini is already set up)

9. [ ] **"Ask about this stock" chat on stock pages**, answering from that company's profile, financials and recent news.
10. [ ] **News sentiment scores** for each watchlist stock, shown over time.
11. [ ] **A weekly AI review of paper trades**: what worked, what didn't, and which rules to tighten.

### Engineering quality

12. [ ] **Tests:** Vitest for `riskRules.ts` and the currency conversion code (there was already one bug where INR and USD were treated as the same currency), plus Playwright for sign-up → watchlist → trade.
13. [ ] **Redis caching** (for example Upstash) for Finnhub calls, plus rate limiting on `/api/agent` and `/api/paper-trader/scan`.
14. [ ] **Instant watchlist updates** with `useOptimistic`, and a GitHub Actions workflow that runs lint, type checks and build.

## Suggested order

1. **#1** Price alerts
2. **#2** One portfolio for `/agent` and `/paper-trader`
3. Quick wins that can go in alongside any of these: fix the `linyt` script name, stop logging the MongoDB username, and add Vitest tests (#12).
