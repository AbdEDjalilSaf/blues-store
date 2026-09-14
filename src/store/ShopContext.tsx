import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { CartItem, Product } from '../lib/api';

interface ShopState {
  cart: CartItem[];
  wishlist: number[];
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  addToCart: (p: Product, size: string, qty?: number) => void;
  removeFromCart: (productId: number, size: string) => void;
  updateQty: (productId: number, size: string, qty: number) => void;
  clearCart: () => void;
  toggleWish: (id: number) => void;
  cartCount: number;
  subtotal: number;
  toast: string | null;
  showToast: (msg: string) => void;
}

const Ctx = createContext<ShopState | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem('zaman-cart') || '[]'); } catch { return []; }
  });
  const [wishlist, setWishlist] = useState<number[]>(() => {
    try { return JSON.parse(localStorage.getItem('zaman-wish') || '[]'); } catch { return []; }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    try { localStorage.setItem('zaman-cart', JSON.stringify(cart)); } catch { /* ignore */ }
  }, [cart]);
  useEffect(() => {
    try { localStorage.setItem('zaman-wish', JSON.stringify(wishlist)); } catch { /* ignore */ }
  }, [wishlist]);
  useEffect(() => () => window.clearTimeout(toastTimer.current), []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2400);
  }, []);

  const addToCart = useCallback((p: Product, size: string, qty = 1) => {
    setCart((prev) => {
      const i = prev.findIndex((c) => c.product.id === p.id && c.size === size);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], qty: Math.min(9, next[i].qty + qty) };
        return next;
      }
      return [...prev, { product: p, size, qty }];
    });
    showToast(`أُضيف "${p.name_ar}" إلى السلة`);
  }, [showToast]);
  const removeFromCart = useCallback((productId: number, size: string) =>
    setCart((prev) => prev.filter((c) => !(c.product.id === productId && c.size === size))), []);
  const updateQty = useCallback((productId: number, size: string, qty: number) => {
    if (qty <= 0) return removeFromCart(productId, size);
    setCart((prev) => prev.map((c) => (c.product.id === productId && c.size === size ? { ...c, qty: Math.min(9, qty) } : c)));
  }, [removeFromCart]);
  const clearCart = useCallback(() => setCart([]), []);
  const toggleWish = useCallback((id: number) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const cartCount = useMemo(() => cart.reduce((s, c) => s + c.qty, 0), [cart]);
  const subtotal = useMemo(() => cart.reduce((s, c) => s + Number(c.product.price) * c.qty, 0), [cart]);

  return (
    <Ctx.Provider value={{ cart, wishlist, cartOpen, setCartOpen, addToCart, removeFromCart, updateQty, clearCart, toggleWish, cartCount, subtotal, toast, showToast }}>
      {children}
      {toast && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-[100]">
          <div className="flex items-center gap-2 bg-[#0f2f52] text-[#f5f9fe] text-sm font-bold px-5 py-3 rounded-full shadow-2xl border border-[#2f9de4]/40 whitespace-nowrap max-w-[92vw] overflow-hidden text-ellipsis">
            <span className="w-2 h-2 rounded-full bg-[#5ab0f0] animate-pulse shrink-0" />
            {toast}
          </div>
        </div>
      )}
    </Ctx.Provider>
  );
}

export function useShop() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useShop outside provider');
  return v;
}
