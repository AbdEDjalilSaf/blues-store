import { use, useSyncExternalStore } from 'react';
import { fetchProductList, type ApiProduct } from '../lib/api';

/**
 * Suspense-compatible, module-level cache for the *admin* product list.
 *
 * Mirrors `src/lib/products.ts`, but keeps the raw {@link ApiProduct} rows
 * (inactive products included) instead of the storefront-mapped `Product`
 * shape, so the dashboard can manage the full inventory.
 *
 * - `useAdminProducts()` suspends on React 19 `use()` until the list resolves.
 * - `useAdminProductsSnapshot()` never suspends — handy for counters.
 * - `resetAdminProducts()` clears the cache so a retry (or an explicit
 *   refresh) starts a fresh request.
 *
 * The promise lives at module scope on purpose: `use()` needs the *same*
 * promise reference across renders or it restarts the request every time.
 */

let pending: Promise<ApiProduct[]> | null = null;
let snapshot: ApiProduct[] = [];
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

export function getAdminProductsPromise(): Promise<ApiProduct[]> {
  if (!pending) {
    pending = fetchProductList().then(
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

/** Start the request before the lazy page mounts, so chunk + data load together. */
export function prefetchAdminProducts(): void {
  void getAdminProductsPromise().catch(() => {
    /* the error boundary that renders the table will surface this */
  });
}

export function useAdminProducts(): ApiProduct[] {
  return use(getAdminProductsPromise());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ApiProduct[] {
  return snapshot;
}

export function useAdminProductsSnapshot(): ApiProduct[] {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function resetAdminProducts(): void {
  pending = null;
  snapshot = [];
  emit();
}
