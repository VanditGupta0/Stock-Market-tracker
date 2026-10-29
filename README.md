# Signalist

A full-stack stock market tracker. Sign up, search any stock, read live charts and company data, build a personal watchlist, and get an AI-written market news email every day based on what you follow.

**Live demo:** https://stock-tracker-app-omega-one.vercel.app/

## What it does

- **Market dashboard.** Market overview, stock heatmap, top stories and live market quotes on the home page.
- **Stock detail pages.** Each symbol gets a candlestick chart, a baseline chart, technical analysis, company profile and financials.
- **Search.** Press `Ctrl/Cmd + K` to open a command-palette search backed by the Finnhub API. Input is debounced by 300ms to keep API calls down.
- **Watchlist.** Add or remove stocks with one click. Each watchlist belongs to the signed-in user and is stored in MongoDB.
- **Authentication.** Email and password sign up and sign in with session cookies. Sign up also collects country, investment goals, risk tolerance and preferred industry.
- **Personalized emails.** A welcome email written by Gemini from your sign-up profile, plus a daily news digest built from the stocks on your watchlist (it falls back to general market news if your watchlist is empty).
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
| AI | Google Gemini, called through Inngest |
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
                               |-- Gemini (email copy and news summaries)
                               |-- Nodemailer (delivery)
```

A few decisions worth pointing out:

- **Server Actions instead of REST endpoints.** Watchlist and auth mutations run as Server Actions. Each one re-checks the session with `auth.api.getSession()` before touching the database.
- **Per-user data isolation.** Watchlist queries always filter by the session's `userId`, and a compound unique index on `userId + symbol` stops duplicate entries.
- **Async emails with Inngest.** Sign up fires an `app/user.created` event and returns immediately. Inngest generates the welcome email in the background with retries, so a slow mail server never blocks account creation.
- **Daily digest cron.** A scheduled function runs at `0 12 * * *` (12:00 UTC). It loads users, fetches news for each user's watchlist symbols, summarizes it with Gemini and sends the email.
- **Caching.** Finnhub requests use Next.js `revalidate` (1 hour for profiles, 30 minutes for search, 5 minutes for news). `searchStocks` is wrapped in React `cache()` to dedupe calls in one render.
- **Connection reuse.** The Mongoose connection is cached on `global` so serverless invocations don't open a new connection every time.
- **Charts offloaded to TradingView.** Chart rendering and price streaming happen client-side through TradingView widgets, so none of that load hits this server.

## Project structure

```
app/
  (auth)/            sign-in and sign-up pages
  (root)/            dashboard, stocks/[symbol], watchlist, learn, engineering, privacy
  api/inngest/       Inngest serve endpoint
components/          UI, forms, TradingView widget wrapper, search, watchlist
database/            Mongoose connection and Watchlist model
hooks/               useDebounce, useTradingViewWidget
lib/
  actions/           server actions (auth, user, watchlist, finnhub)
  better-auth/       auth config
  inngest/           client, functions, prompts
  nodemailer/        transporter and email templates
types/               global type declarations
```

## Getting started

**Prerequisites:** Node.js 20+, a MongoDB database (Atlas or local), a Finnhub API key, a Gemini API key and a Gmail account with an app password.

```bash
git clone https://github.com/sambhav3009/signalist_stock-tracker-app.git
cd signalist_stock-tracker-app
npm install
```

Create a `.env` file in the project root:

```env
MONGODB_URI=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000
FINNHUB_API_KEY=
GEMINI_API_KEY=
NODEMAILER_EMAIL=
NODEMAILER_PASSWORD=
```

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

Deployed on Vercel. Add the same environment variables in the Vercel project settings, and connect the app to Inngest Cloud so the welcome email and daily digest functions run in production.

## Possible next steps

- Optimistic UI updates for the watchlist with `useOptimistic`
- Price alerts with email notifications
- Pagination on search results
- Redis for caching external API calls

## Author

Sambhav Jain, [GitHub](https://github.com/sambhav3009) · [LinkedIn](https://www.linkedin.com/in/sambhav-jain-248937317/)
