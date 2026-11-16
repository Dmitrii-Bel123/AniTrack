# AniTrack: visual direction

Reference: https://us.nothing.tech/ (November 2026). Adapt its restrained industrial identity to a personal anime collection: warm white, charcoal panels, a single red accent, dot lettering, technical captions and an occasional editorial serif. Posters provide the color. Avoid decorative gradients, glows, floating dashboard cards and additional themes defined inside pages.

## Structure

- `styles/base.css`: shared semantic tokens, reset, shell, headings, responsive rules and reduced motion.
- `styles/components.css`: buttons, fields, alerts and shared primitives.
- `styles/pages/`: page-specific layouts; consume shared tokens rather than overriding a theme.
- `components/ui/`: shared heading, vector wordmark and poster with a fallback for broken URLs.
- `components/layout/`: signed-in shell and shared authentication layout.
- `hooks/useCollection.ts`: abortable paginated collection loading, retry and refresh.
- `lib/collectionInsights.ts`: pure aggregation shared by collection filters and statistics.

The collection opens on in-progress titles when available, otherwise on all titles. Explicit status URLs remain authoritative. The in-progress feature appears only in the in-progress view without a search query. Other filters lead directly to their results. The add dialog uses native modal focus handling and returns focus to the add button.

## Statistics

Use the complete paginated collection as the source for counts and charts, avoiding a second summary request that can disagree with it. Keep statuses, completed share, known episodes in completed titles, additions in the last six calendar months, common genres and individual favorites. Average scores and score distributions are deliberately omitted.

Episodes represent all episodes of titles marked completed, not a per-episode watch log or estimated watch time. If completed titles have unknown episode totals, show a plus and an explanatory note. Activity reflects dates titles were added, not dates episodes were watched. Genre counts deduplicate each title's genre metadata. Favorites sort numeric personal scores and omit unrated titles.

No database or API contract changes are required. The existing backend statistics endpoint stays available for other clients.

## Checks

From `frontend`: `npm run lint`, `npm test`, `npm run build`. The tests cover aggregation, absent metadata, calendar boundaries, rating sort order and input immutability. Browser QA covers collection, status links, local filtering, modal search, detail editing, profile, empty/error/loading states and narrow viewports. Preview fixtures must stay separate from the production API and collection.
