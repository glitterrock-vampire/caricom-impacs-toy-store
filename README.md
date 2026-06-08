# CARICOM IMPACS Dashboard

Customer data is stored in a local SQLite database through a small Express API.

## Data Storage

- Schema: `server/schema.sql`
- Seed data: `server/seed.sql`
- Runtime database: `data/app.sqlite`

The database file is created automatically the first time the API starts.

## Run Locally

```bash
npm install
npm run dev
```

The frontend runs at `http://127.0.0.1:5173` and proxies API requests to `http://127.0.0.1:8787`.

## Useful Commands

```bash
npm run server
npm run client
npm run build
```

## Vercel

This app includes `vercel.json` and `api/index.js` so Vercel can deploy the Vite frontend and route `/api/*` requests to the Express API as a Vercel Function.

SQLite on Vercel uses `/tmp/app.sqlite`, which is suitable for demo/runtime seeding but not durable production writes. For production persistence, attach a hosted SQL database and set the API to use that connection.
