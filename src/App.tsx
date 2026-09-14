import { Suspense, lazy, useState } from 'react';
import { ShopProvider } from './store/ShopContext';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Ticker from './components/Ticker';
import ShopSection from './components/ShopSection';
import Footer from './components/Footer';

import type { Product } from './lib/api';
import { products } from './lib/catalog';
import { Flame, Sparkles } from 'lucide-react';
import ProductCard from './components/ProductCard';
import Reveal from './components/Reveal';

const ProductModal = lazy(() => import('./components/ProductModal'));
const CartDrawer = lazy(() => import('./components/CartDrawer'));
const CheckoutModal = lazy(() => import('./components/CheckoutModal'));
const Story = lazy(() => import('./components/Story'));
const ReviewsSection = lazy(() => import('./components/ReviewsSection'));
const OrderTracker = lazy(() => import('./components/OrderTracker'));
const Newsletter = lazy(() => import('./components/Newsletter'));

function Site() {
  const items = products;
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Product | null>(null);
  const [checkout, setCheckout] = useState(false);

  const featured = items.filter((p) => p.featured).slice(0, 4);

  return (
    <div className="min-h-screen bg-[#f5f9fe]">
      <Navbar onSearch={setSearch} />
      <Hero count={items.length} />
      <Ticker />

      {featured.length > 0 && (
        <Reveal as="section" effect="fade-up" className="bg-[#f5f9fe] pt-10 md:pt-14">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex items-end justify-between mb-5">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-[#1565c0] text-white font-black text-[12px] px-4 py-1.5 rounded-full mb-2"><Flame size={14} /> الأكثر طلباً</div>
                <h2 className="font-black text-2xl md:text-4xl text-[#0f2f52]">قطع يتنافس عليها الجامعون</h2>
              </div>
              <a href="#shop" className="hidden sm:inline-flex items-center gap-1.5 font-black text-sm text-[#1565c0] hover:gap-3 transition-all">عرض الكل <Sparkles size={16} /></a>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {featured.map((p) => <ProductCard key={p.id} p={p} onView={setSelected} />)}
            </div>
          </div>
        </Reveal>
      )}

      <ShopSection products={items} loading={false} search={search} onView={setSelected} />
      <Suspense fallback={null}>
        <Story />
        <ReviewsSection />
        <OrderTracker />
        <Newsletter />
      </Suspense>
      <Footer />

      <Suspense fallback={null}>
        <ProductModal p={selected} onClose={() => setSelected(null)} />
        <CartDrawer onCheckout={() => setCheckout(true)} />
        <CheckoutModal open={checkout} onClose={() => setCheckout(false)} />
      </Suspense>
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
