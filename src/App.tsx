import { Suspense, lazy, memo, useCallback, useState } from 'react';
import { ShopProvider } from './store/ShopContext';
import { useCart } from './store/shop';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import CategoryCarousel from './components/CategoryCarousel';
import Ticker from './components/Ticker';
import ShopSection from './components/ShopSection';
import Footer from './components/Footer';
import LazySection from './components/LazySection';
import ProductCard from './components/ProductCard';
import Reveal from './components/Reveal';
import { Flame, Sparkles } from 'lucide-react';

import type { Product } from './lib/api';
import { products } from './lib/catalog';

const ProductModal = lazy(() => import('./components/ProductModal'));
const CartDrawer = lazy(() => import('./components/CartDrawer'));
const CheckoutModal = lazy(() => import('./components/CheckoutModal'));
const Story = lazy(() => import('./components/Story'));
const Auth = lazy(() => import('./components/Auth'));
const ReviewsSection = lazy(() => import('./components/ReviewsSection'));
const OrderTracker = lazy(() => import('./components/OrderTracker'));
const Newsletter = lazy(() => import('./components/Newsletter'));

/* Derived from static data once, at module scope, so the array identity is
   stable and the memoised product grid never re-renders because of App state. */
const FEATURED = products.filter((p) => p.featured).slice(0, 4);

const TickerMemo = memo(Ticker);
const HeroMemo = memo(Hero);
const CategoryMemo = memo(CategoryCarousel);
const ShopMemo = memo(ShopSection);

function FeaturedRow({ onView }: { onView: (p: Product) => void }) {
  return (
    <Reveal as="section" effect="fade-up" className="bg-[#f5f9fe] pt-10 md:pt-14" aria-labelledby="featured-heading">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-[#1565c0] text-white font-black text-[12px] px-4 py-1.5 rounded-full mb-2">
              <Flame size={14} /> الأكثر طلباً
            </div>
            <h2 id="featured-heading" className="font-black text-2xl md:text-4xl text-[#0f2f52]">
              قطع يتنافس عليها الجامعون
            </h2>
          </div>
          <a href="#shop" className="hidden sm:inline-flex items-center gap-1.5 font-black text-sm text-[#1565c0] hover:gap-3 transition-all">
            عرض الكل <Sparkles size={16} />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {FEATURED.map((p) => (
            <ProductCard key={p.id} p={p} onView={onView} />
          ))}
        </div>
      </div>
    </Reveal>
  );
}

const FeaturedMemo = memo(FeaturedRow);

function Site() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const [checkout, setCheckout] = useState(false);
  const { cartOpen } = useCart();

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
        <FeaturedMemo onView={openProduct} />
        <ShopMemo products={products} search={search} onView={openProduct} />

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

        <LazySection minHeight={380}>
          <Suspense fallback={<div style={{ minHeight: 380 }} />}>
            <OrderTracker />
          </Suspense>
        </LazySection>

        <LazySection minHeight={340}>
          <Suspense fallback={<div style={{ minHeight: 340 }} />}>
            <Newsletter />
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
  return (
    <ShopProvider>
      <Site />
    </ShopProvider>
  );
}