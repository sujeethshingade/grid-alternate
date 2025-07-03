# Grid Alternate

It features an infinite-scroll (lazy loading) table UI that fetches file data from a MongoDB backend via a Next.js API route.

## How it Works?

### 1. Table Structure

- The main table UI is implemented in `src/components/FilesTable.tsx` and uses a generic `InfiniteTable` component.
- Columns are defined with keys, headers, widths, and custom renderers.

### 2. Infinite Scroll Logic

- The `InfiniteTable` component tracks the scroll position of the table container.
- When the user scrolls near the bottom (configurable with `loadMoreThreshold`), it triggers a data fetch for the next page.
- The table maintains a list of loaded rows and appends new data as it arrives, without reloading the whole table.
- The `fetchData` prop is an async function that takes `skip` and `limit` arguments, used for pagination.

### 3. Data Fetching from MongoDB

- The API route is implemented in `src/app/api/files/route.ts`.
- When the frontend requests `/api/files?skip=0&limit=20`, the API handler:
  1. Connects to MongoDB using the connection string in `.env.local` (`MONGODB_URI`).
  2. Queries the `files` collection with `.find({}).skip(skip).limit(limit)` to fetch only the requested page.
  3. Returns a JSON response with `files` (the data array) and `totalRecords` (total count for pagination).
- The frontend uses this API to fetch more data as the user scrolls.

## Installation

```bash
git clone https://github.com/sujeethshingade/grid-alternate.git
cd grid-alternate
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
