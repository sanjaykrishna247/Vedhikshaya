import { Component } from 'react';
import RouteLoading from './RouteLoading';

// A freshly deployed build changes the hashed chunk filenames. A phone that
// still has the previous index.html cached will 404 on the lazy import() and
// React Router just sits on the Suspense spinner forever. Catch that here and
// reload once so the browser picks up the new build.
const isChunkError = (err) =>
  /dynamically imported module|Loading chunk|ChunkLoadError|Importing a module script failed|Failed to fetch|error loading dynamically/i.test(
    String(err?.message || err),
  );

export default class LazyBoundary extends Component {
  state = { errored: false };

  static getDerivedStateFromError() {
    return { errored: true };
  }

  componentDidCatch(error) {
    if (isChunkError(error)) {
      const KEY = 'vk_chunk_reload_at';
      let last = 0;
      try {
        last = Number(sessionStorage.getItem(KEY) || 0);
      } catch {
        /* ignore */
      }
      if (Date.now() - last > 12000) {
        try {
          sessionStorage.setItem(KEY, String(Date.now()));
        } catch {
          /* ignore */
        }
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.errored) {
      return this.props.fallback ?? <RouteLoading />;
    }
    return this.props.children;
  }
}
