# Signalist

A full-stack stock market tracker. Sign up, search any stock, read live charts and company data, build a personal watchlist, practise trading with an AI paper trader, and get an AI-written market news email every day based on what you follow.

**Live demo:** https://agentic-trading-six-puce.vercel.app/

## What it does

- **Market dashboard.** Market overview, stock heatmap, top stories and live market quotes on the home page.
- **Stock detail pages.** Each symbol gets a candlestick chart, a baseline chart, technical analysis, company profile and financials.
- **Search.** Press `Ctrl/Cmd + K` to open a command-palette search backed by the Finnhub API. Input is debounced by 300ms to keep API calls down.
- **Watchlist.** Add or remove stocks with one click. Each watchlist belongs to the signed-in user and is stored in MongoDB.
- **Authentication.** Email and password sign up and sign in with session cookies. Sign up also collects country, investment goals, risk tolerance and preferred industry.
- **Personalized emails.** A welcome email written by Gemini from your sign-up profile, plus a daily news digest built from the stocks on your watchlist (it falls back to general market news if your watchlist is empty).
- **AI Paper Trader** (`/paper-trader`). Start a virtual account with a budget of your choice. Each scan reads the latest market news, asks Gemini for buy/sell decisions (with a built-in fallback engine if Gemini or news is unavailable), and executes them against your virtual cash. Includes:
  - **Stop-loss and take-profit rules** you can turn on and tune (default 5% / 10%). They are applied to open positions before the AI makes new decisions.
  - **Performance chart** of portfolio value over time, saved after every scan.
  - Open positions, trade history and a detail view with the AI's reasoning for each trade.
  - Everything is stored per user in MongoDB, so it follows you across devices.
- **AI Trader agent** (`/agent`). An interactive trading agent that shows its thinking step by step (ingestion, analysis, decision) as it trades a paper portfolio. Pick a strategy (balanced, aggressive or value), set your starting capital, and inject your own breaking news headline to see how the agent reacts. The portfolio is in INR, and US-dollar stocks are converted at a fixed reference rate. This portfolio is saved in the browser (`localStorage`).
- **Learn section.** A stock market basics guide with Indian market examples (NSE, BSE, NIFTY 50, Sensex).
- **Engineering page.** An in-app write-up of the architecture, trade-offs and optimizations, at `/engineering`.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS 4, shadcn/ui, Radix UI |
| Database | MongoDB with Mongoose |
| Auth | Better Auth (MongoDB adapter, email and password) |
| Background jobs | Inngest (event-driven functions and a cron) |
| AI | Google Gemini (through Inngest for emails, and directly for paper-trader decisions) |
| Email | Nodemailer |
| Market data | Finnhub API (search, company news, profiles), TradingView embedded widgets (charts) |
| Forms | React Hook Form |

## How it works

```
Browser
   |
Next.js App Router (Server Components + Server Actions)
   |-- Better Auth ------> MongoDB (users, sessions)
   |-- Watchlist actions -> MongoDB (watchlist collection)
   |-- Finnhub actions ---> Finnhub REST API
   |-- Inngest events ----> background functions
   |                           |-- Gemini (email copy and news summaries)
   |                           |-- Nodemailer (delivery)
   |-- /api/paper-trader/scan -> Finnhub news + quotes -> Gemini trade decisions -> MongoDB
   |-- /api/agent ------------> rule-based reasoning engine (no external calls)
```

A few decisions worth pointing out:

- **Server Actions instead of REST endpoints.** Watchlist and auth mutations run as Server Actions. Each one re-checks the session with `auth.api.getSession()` before touching the database.
- **Per-user data isolation.** Watchlist queries always filter by the session's `userId`, and a compound unique index on `userId + symbol` stops duplicate entries.
- **Async emails with Inngest.** Sign up fires an `app/user.created` event and returns immediately. Inngest generates the welcome email in the background with retries, so a slow mail server never blocks account creation.
- **Daily digest cron.** A scheduled function runs at `0 12 * * *` (12:00 UTC). It loads users, fetches news for each user's watchlist symbols, summarizes it with Gemini and sends the email.
- **Caching.** Finnhub requests use Next.js `revalidate` (1 hour for profiles, 30 minutes for search, 5 minutes for news). `searchStocks` is wrapped in React `cache()` to dedupe calls in one render.
- **Connection reuse.** The Mongoose connection is cached on `global` so serverless invocations don't open a new connection every time.
- **Risk rules before AI.** In each paper-trader scan, stop-loss and take-profit exits run first, then Gemini decides on new trades. Trades are checked for affordability before they execute, and every scan saves a snapshot for the performance chart.
- **Graceful AI fallback.** If there is no Gemini key, no live news, or Gemini returns nothing usable, the paper trader falls back to a built-in decision engine, so a scan always produces a result.
- **One base currency.** The AI trader keeps the portfolio in INR and converts USD prices before any money moves, so Indian and US stocks can sit in the same portfolio.
- **Charts offloaded to TradingView.** Chart rendering and price streaming happen client-side through TradingView widgets, so none of that load hits this server.

## Project structure

```
app/
  (auth)/            sign-in and sign-up pages
  (root)/            dashboard, stocks/[symbol], watchlist, paper-trader, agent, learn, engineering, privacy
  api/inngest/       Inngest serve endpoint
  api/paper-trader/  paper-trader scan endpoint (news, prices, Gemini, risk rules)
  api/agent/         AI trader agent endpoint
components/          UI, forms, TradingView widget wrapper, search, watchlist
  paper-trader/      paper-trader dashboard, positions, trades, risk rules, performance chart
  agent/             thought stream, trade reasoning cards, breaking-news simulator
database/            Mongoose connection and models (watchlist, paper trader, risk settings, snapshots)
hooks/               useDebounce, useTradingViewWidget
lib/
  actions/           server actions (auth, user, watchlist, finnhub, paper trader, risk settings)
  agent/             AI trader reasoning engine, stock universe, currency conversion
  paper-trader/      stop-loss / take-profit rules
  better-auth/       auth config
  inngest/           client, functions, prompts
  nodemailer/        transporter and email templates
types/               global type declarations
```

## Getting started

**Prerequisites:** Node.js 20+, a MongoDB database (Atlas or local), a Finnhub API key, a Gemini API key and a Gmail account with an app password.

```bash
git clone https://github.com/VanditGupta0/Stock-Market-tracker.git
cd Stock-Market-tracker
npm install
```

Create a `.env` file in the project root:

```env
MONGODB_URI=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
FINNHUB_API_KEY=                 # or NEXT_PUBLIC_FINNHUB_API_KEY
GEMINI_API_KEY=
NODEMAILER_EMAIL=
NODEMAILER_PASSWORD=
```

The Finnhub free plan does not cover NSE symbols (it returns 403), so the default Indian stocks use built-in names and reference prices when live data isn't available.

Run the app:

```bash
npm run dev
```

In a second terminal, start the Inngest dev server so background jobs run locally:

```bash
npx inngest-cli@latest dev
```

Open http://localhost:3000.

## Deployment

Deployed on Vercel at https://agentic-trading-six-puce.vercel.app/. Add the same environment variables in the Vercel project settings, and connect the app to Inngest Cloud so the welcome email and daily digest functions run in production.

## Known limitations

- Paper-trader open positions are revalued with a simulated price move on each scan, not with live quotes, and NSE stocks fall back to reference prices. Treat P&L as a simulation.
- The AI Trader (`/agent`) and the Paper Trader (`/paper-trader`) are separate portfolios. The agent's is stored in the browser only.
- The USD/INR rate is a fixed reference value.

## Possible next steps

- Live quotes for paper-trader positions, including NSE stocks
- Price alerts with email notifications
- Merge the AI Trader and Paper Trader into one portfolio stored in MongoDB
- Real-time prices over the Finnhub WebSocket
- Tests for the risk rules and currency conversion, and CI
- Optimistic UI updates for the watchlist with `useOptimistic`
- Redis for caching external API calls and rate limiting the AI endpoints
