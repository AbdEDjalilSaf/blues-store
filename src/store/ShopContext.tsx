import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { products } from '../lib/catalog';
import type { CartItem, Product } from '../lib/api';
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

function hydrateLines(lines: CartItemLine[]): CartItem[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  const merged = new Map<string, CartItem>();
  for (const l of lines) {
    const product = byId.get(l.id);
    if (!product) continue;
    const key = `${l.id}|${l.size}`;
    const existing = merged.get(key);
    if (existing) existing.qty = Math.min(9, existing.qty + l.qty);
    else merged.set(key, { product, size: l.size, qty: Math.min(9, l.qty) });
  }
  return [...merged.values()];
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
  const [cart, setCart] = useState<CartItem[]>(() => hydrateLines(readLines()));
  const [wishlist, setWishlist] = useState<number[]>(readWishlist);
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_KEY,
        JSON.stringify(cart.map((c) => ({ id: c.product.id, size: c.size, qty: c.qty })))
      );
    } catch {
      /* quota / private mode — the cart simply will not persist */
    }
  }, [cart]);

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
      setCart((prev) => {
        const i = prev.findIndex((c) => c.product.id === p.id && c.size === size);
        if (i >= 0) {
          const next = prev.slice();
          next[i] = { ...next[i], qty: Math.min(9, next[i].qty + qty) };
          return next;
        }
        return [...prev, { product: p, size, qty }];
      });
      showToast(`أُضيف "${p.name_ar}" إلى السلة`);
    },
    [showToast]
  );

  const removeFromCart = useCallback(
    (productId: number, size: string) =>
      setCart((prev) => prev.filter((c) => !(c.product.id === productId && c.size === size))),
    []
  );

  const updateQty = useCallback(
    (productId: number, size: string, qty: number) => {
      if (qty <= 0) return removeFromCart(productId, size);
      setCart((prev) =>
        prev.map((c) => (c.product.id === productId && c.size === size ? { ...c, qty: Math.min(9, qty) } : c))
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => setCart([]), []);

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