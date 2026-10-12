import { Suspense, lazy, memo, useCallback, useEffect, useState } from 'react';
import { ShopProvider } from './store/ShopContext';
import { useCart } from './store/shop';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategoryCarousel from './components/CategoryCarousel';
import Ticker from './components/Ticker';
import Footer from './components/Footer';
import LazySection from './components/LazySection';
import ErrorBoundary from './components/ErrorBoundary';
import CatalogError from './components/CatalogError';
import { CatalogSkeleton } from './components/ProductSkeleton';
import AdminLogin from './components/AdminLogin';
import { prefetchProducts, resetProducts, useProductsSnapshot } from './lib/products';

import type { Product } from './lib/api';

/* Start the catalog request during script evaluation, in parallel with the
   entry bundle + fonts, so the data is usually already in flight by the time
   the lazy `Catalog` chunk mounts. Skipped on the admin route. */
if (typeof window !== 'undefined' && window.location.hash !== '#admin') {
  prefetchProducts();
}

const Catalog = lazy(() => import('./components/Catalog'));
const ProductModal = lazy(() => import('./components/ProductModal'));
const CartDrawer = lazy(() => import('./components/CartDrawer'));
const CheckoutModal = lazy(() => import('./components/CheckoutModal'));
const Story = lazy(() => import('./components/Story'));
const Auth = lazy(() => import('./components/Auth'));
const ReviewsSection = lazy(() => import('./components/ReviewsSection'));

const TickerMemo = memo(Ticker);
const HeroMemo = memo(Hero);
const CategoryMemo = memo(CategoryCarousel);

function Site() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const [checkout, setCheckout] = useState(false);
  const { cartOpen } = useCart();
  // Non-suspending view of the catalog: lets the hero paint immediately and
  // pick up the real count once the request resolves.
  const products = useProductsSnapshot();

  // `setSelected` is already stable; these wrappers keep every prop identity
  // stable so the memoised children below never re-render on App state change.
  const openProduct = useCallback((p: Product) => setSelected(p), []);
  const closeProduct = useCallback(() => setSelected(null), []);
  const closeCheckout = useCallback(() => setCheckout(false), []);
  const onSearch = useCallback((q: string) => setSearch(q), []);

  return (
    <div className="min-h-screen bg-[#f5f9fe]">
      <a
        href="#main"
        className="sr-only-focusable absolute top-2 z-[110] bg-[#0f2f52] text-[#f5f9fe] font-black text-sm px-4 py-2 rounded-full"
      >
        تخطَّ إلى المحتوى
      </a>

      <Navbar onSearch={onSearch} />

      <main id="main">
        <HeroMemo count={products.length} />
        <TickerMemo />
        <CategoryMemo />

        <ErrorBoundary
          onReset={resetProducts}
          fallback={(error, reset) => <CatalogError error={error} onRetry={reset} />}
        >
          <Suspense fallback={<CatalogSkeleton />}>
            <Catalog search={search} onView={openProduct} />
          </Suspense>
        </ErrorBoundary>

        <LazySection minHeight={900}>
          <Suspense fallback={<div style={{ minHeight: 900 }} />}>
            <Story />
          </Suspense>
        </LazySection>

        <LazySection minHeight={420}>
          <Suspense fallback={<div style={{ minHeight: 420 }} />}>
            <Auth />
          </Suspense>
        </LazySection>

        <LazySection minHeight={420}>
          <Suspense fallback={<div style={{ minHeight: 420 }} />}>
            <ReviewsSection />
          </Suspense>
        </LazySection>

      </main>

      <Footer />

      {/* Overlays are mounted only while they are actually open, so their chunks
          are never part of the initial page load. */}
      {selected && (
        <Suspense fallback={null}>
          <ProductModal key={selected.id} p={selected} onClose={closeProduct} />
        </Suspense>
      )}
      {cartOpen && (
        <Suspense fallback={null}>
          <CartDrawer onCheckout={() => setCheckout(true)} />
        </Suspense>
      )}
      {checkout && (
        <Suspense fallback={null}>
          <CheckoutModal open onClose={closeCheckout} />
        </Suspense>
      )}
    </div>
  );
}

export default function App() {
  const [hash, setHash] = useState(() => window.location.hash);

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (hash === '#admin') return <AdminLogin />;

  return (
    <ShopProvider>
      <Site />
    </ShopProvider>
  );
}
