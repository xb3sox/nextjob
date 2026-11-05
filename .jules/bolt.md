# Bolt Performance Knowledge Base

## RSC Streaming & Dashboard Suspense
- Wrapping heavy dashboard and jobs listing server component data fetches in React `Suspense` boundaries allows instant shell rendering and eliminates waterfall blocking.
- Skeleton fallbacks mirroring the card grid and workspace structure provide smooth perceived loading without layout shifting.

## Edge Caching on Read-Only Feeds
- Read-only endpoints such as `/jobs` and `/career/export/json-resume` benefit from CDN edge caching via `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`, reducing API server load and achieving sub-50ms edge hits for repeated queries.

## Mobile Gesture Performance & Worklets
- Using explicit `"worklet";` directives inside gesture event callbacks (`onBegin`, `onChange`, `onFinalize`) ensures that gesture interactions and layout calculations execute strictly on the UI thread without crossing the React Native bridge.
- Reading shared values only once and reusing variables prevents redundant JSI/bridge synchronization overhead during 60fps gesture tracks.
