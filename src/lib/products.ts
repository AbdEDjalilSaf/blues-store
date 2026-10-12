import { use, useSyncExternalStore } from 'react';
import { fetchProducts, type Product } from './api';

/**
 * Suspense-compatible, module-level cache for the product catalog.
 *
 * - `useProducts()` suspends until the catalog is ready (React 19 `use`), so
 *   the catalog renders from `<Suspense>` + a skeleton.
 * - `useProductsSnapshot()` never suspends. It subscribes to the same cache so
 *   non-critical consumers (hero count, persisted cart) can paint immediately
 *   and fill in once the data lands.
 * - `resetProducts()` clears the cache so an error boundary can retry.
 *
 * The promise lives at module scope on purpose: `use()` needs the *same*
 * promise reference across renders or it restarts the request every time.
 */

let pending: Promise<Product[]> | null = null;
let snapshot: Product[] = [];
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function getProductsPromise(): Promise<Product[]> {
  if (!pending) {
    pending = fetchProducts().then(
      (list) => {
        snapshot = list;
        emit();
        return list;
      },
      (error) => {
        // Drop the rejected promise so a retry starts a fresh request.
        pending = null;
        emit();
        throw error;
      }
    );
  }
  return pending;
}

/** Kick the request off before anything renders it (called from `App`). */
export function prefetchProducts(): void {
  void getProductsPromise().catch(() => {
    /* the error boundary that renders the catalog will surface this */
  });
}

export function useProducts(): Product[] {
  return use(getProductsPromise());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): Product[] {
  return snapshot;
}

export function useProductsSnapshot(): Product[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function resetProducts(): void {
  pending = null;
  snapshot = [];
  emit();
}
