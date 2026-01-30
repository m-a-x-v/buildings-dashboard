# Buildings Dashboard

Lightweight buildings + devices dashboard with a virtualized sidebar and device tables.

## Setup
- Install: `npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Format: `npm run format`

## Tech stack (and where we use it)
- React 19 + TypeScript - app structure, state and typed data flows.
- Vite - dev server and build tooling.
- MUI (material + icons) - layout, buttons, inputs and overall UI primitives.
- MUI X Data Grid - device tables with selection, column layout and scrolling.
- react-window + react-virtualized-auto-sizer - virtualized sidebar tree and buildings list for smooth scrolling.

## Implemented features
- Buildings list with stats, online counts and navigation into devices
- Devices view with per-table search, selection and action bar
- Virtualized sidebar tree and virtualized building list
- Light/Dark theming with themed components
- Skeleton loading states

## Performance & Optimization
- Avoiding unnecessary re-renders: handlers and derived maps/lists are memoized (e.g., `buildSelectionMap`, device grouping and table configs) so unchanged inputs do not re-render large trees.
- Efficient filtering/grouping: filters run only on the active scope (building/floor/space/room) and per device type instead of the full dataset each time.
- Debounced search: per-table search uses a short timeout so filtering runs after typing pauses, not on every keystroke.
- Avoid heavy work on every render: expensive calculations (column configs, filtered rows) are cached and reused via `useMemo`.
- Render only what is visible: react-window + AutoSizer virtualize the sidebar and buildings list; DataGrid handles row virtualization in device tables.

## Key decisions
- Use MUI + Data Grid for consistent UI and table features.
- Use virtualization for long lists to keep scrolling smooth.
- Keep derived data memoized to avoid heavy re-computation.

## Trade-offs
- Client-side filtering is fast to build but can be heavy on very large datasets.
- Virtualized lists limit some DOM-based styling and measurements.

## Improvements
- Create custom dashboards for buildings.
- Add new devices.
- Persist theme and table filters to local storage.
- Add virtualization for very large device tables.
- Add server-side pagination / filtering when API supports it.
- Add persisted filters/preferences per user.
- Move filtering/paging to the backend for scale.

## Bonus
- Production handling: store data in a reliable database, cache results and add monitoring.
- Backend/API changes: add faster endpoints (smaller payloads, server-side filtering) and clearer device status fields.
- UI scaling: load data in small chunks, show summaries first and keep lists short until the user expands them.
