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
