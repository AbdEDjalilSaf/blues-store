import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CartItem, Product } from '../lib/api';
import { useProductsSnapshot } from '../lib/products';
import {
  ActionsCtx,
  CART_KEY,
  CartCtx,
  type CartState,
  ToastCtx,
  WISH_KEY,
  WishlistCtx,
  type CartItemLine,
  type ShopActions,
} from './shop';

/**
 * The cart is persisted as `[{ id, size, qty }]` instead of embedding the whole
 * `Product` object. The old shape duplicated every product's long description
 * for each cart line, which is what used to blow through the localStorage
 * quota, and re-parsing it on boot was the largest single blocking cost before
 * first paint.
 */
function readLines(): CartItemLine[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const out: CartItemLine[] = [];
    for (const item of parsed) {
      if (!item || typeof item !== 'object') continue;
      const o = item as Record<string, unknown>;
      const id = Number((o.product as { id?: unknown } | undefined)?.id ?? o.id);
      const size = typeof o.size === 'string' ? o.size : '';
      const qty = Number(o.qty);
      if (!Number.isFinite(id) || !size || !Number.isFinite(qty) || qty <= 0) continue;
      out.push({ id, size, qty: Math.min(9, Math.floor(qty)) });
    }
    return out;
  } catch {
    return [];
  }
}

function readWishlist(): number[] {
  try {
    const raw = localStorage.getItem(WISH_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(Number).filter((n) => Number.isFinite(n));
  } catch {
    return [];
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  // Persisted lines only carry an id. The full product object is resolved from
  // the catalog once it has loaded, so nothing is fetched twice.
  const [lines, setLines] = useState<CartItemLine[]>(readLines);
  const [wishlist, setWishlist] = useState<number[]>(readWishlist);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const products = useProductsSnapshot();
  const productMap = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  const cart = useMemo<CartItem[]>(() => {
    const merged = new Map<string, CartItem>();
    for (const line of lines) {
      const product = productMap.get(line.id);
      if (!product) continue;
      const key = `${line.id}|${line.size}`;
      const existing = merged.get(key);
      if (existing) existing.qty = Math.min(9, existing.qty + line.qty);
      else merged.set(key, { product, size: line.size, qty: Math.min(9, line.qty) });
    }
    return [...merged.values()];
  }, [lines, productMap]);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(lines));
    } catch {
      /* quota / private mode — the cart simply will not persist */
    }
  }, [lines]);

  useEffect(() => {
    try { localStorage.setItem(WISH_KEY, JSON.stringify(wishlist)); } catch { /* ignore */ }
  }, [wishlist]);

  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const addToCart = useCallback(
    (p: Product, size: string, qty = 1) => {
      setLines((prev) => {
        const i = prev.findIndex((l) => l.id === p.id && l.size === size);
        if (i >= 0) {
          const next = prev.slice();
          next[i] = { ...next[i], qty: Math.min(9, next[i].qty + qty) };
          return next;
        }
        return [...prev, { id: p.id, size, qty: Math.min(9, qty) }];
      });
      showToast(`أُضيف "${p.name_ar}" إلى السلة`);
    },
    [showToast]
  );

  const removeFromCart = useCallback(
    (productId: number, size: string) =>
      setLines((prev) => prev.filter((l) => !(l.id === productId && l.size === size))),
    []
  );

  const updateQty = useCallback(
    (productId: number, size: string, qty: number) => {
      if (qty <= 0) return removeFromCart(productId, size);
      setLines((prev) =>
        prev.map((l) => (l.id === productId && l.size === size ? { ...l, qty: Math.min(9, qty) } : l))
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => setLines([]), []);

  const toggleWish = useCallback((id: number) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  // Stable for the whole lifetime of the provider, so consumers can be memoised.
  const actions = useMemo<ShopActions>(
    () => ({ setCartOpen, addToCart, removeFromCart, updateQty, clearCart, toggleWish, showToast }),
    [addToCart, removeFromCart, updateQty, clearCart, toggleWish, showToast]
  );

  const cartState = useMemo<CartState>(() => {
    let count = 0;
    let sub = 0;
    for (const c of cart) {
      count += c.qty;
      sub += Number(c.product.price) * c.qty;
    }
    return { cart, cartOpen, cartCount: count, subtotal: sub };
  }, [cart, cartOpen]);

  return (
    <ActionsCtx.Provider value={actions}>
      <CartCtx.Provider value={cartState}>
        <WishlistCtx.Provider value={wishlist}>
          <ToastCtx.Provider value={toast}>
            {children}
            {toast && (
              <div
                className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[100]"
                role="status"
                aria-live="polite"
              >
                <div className="flex items-center gap-2 bg-[#0f2f52] text-[#f5f9fe] text-sm font-bold px-5 py-3 rounded-full shadow-2xl border border-[#2f9de4]/40 whitespace-nowrap max-w-[92vw] overflow-hidden text-ellipsis">
                  <span className="w-2 h-2 rounded-full bg-[#5ab0f0] animate-pulse shrink-0" />
                  {toast}
                </div>
              </div>
            )}
          </ToastCtx.Provider>
        </WishlistCtx.Provider>
      </CartCtx.Provider>
    </ActionsCtx.Provider>
  );
}
