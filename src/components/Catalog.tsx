import { Suspense, lazy, memo, useMemo } from 'react';
import { Flame, Sparkles } from 'lucide-react';
import type { Product } from '../lib/api';
import { useProducts } from '../lib/products';
import ProductCard from './ProductCard';
import Reveal from './Reveal';
import LazySection from './LazySection';
import { ProductGridSkeleton } from './ProductSkeleton';

/** The shop grid is its own chunk; `LazySection` delays fetching it until near. */
const ShopSection = lazy(() => import('./ShopSection'));

interface Props {
  search: string;
  onView: (p: Product) => void;
}

function FeaturedRow({ products, onView }: { products: Product[]; onView: (p: Product) => void }) {
  return (
    <Reveal
      as="section"
      effect="fade-up"
      className="bg-[#f5f9fe] pt-10 md:pt-14"
      aria-labelledby="featured-heading"
    >
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
          <a
            href="#shop"
            className="hidden sm:inline-flex items-center gap-1.5 font-black text-sm text-[#1565c0] hover:gap-3 transition-all"
          >
            عرض الكل <Sparkles size={16} />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} onView={onView} />
          ))}
        </div>
      </div>
    </Reveal>
  );
}

const FeaturedMemo = memo(FeaturedRow);

/**
 * Suspends on the catalog promise, so the parent `<Suspense>` shows the
 * skeleton until the products arrive. Rendering itself is split so the heavy
 * shop chunk only downloads when the user approaches it.
 */
function Catalog({ search, onView }: Props) {
  const products = useProducts();

  const featured = useMemo(() => {
    const marked = products.filter((p) => p.featured);
    return marked.length > 0 ? marked.slice(0, 4) : products.slice(0, 4);
  }, [products]);

  return (
    <>
      <FeaturedMemo products={featured} onView={onView} />
      <LazySection minHeight={760}>
        <Suspense
          fallback={
            <div className="bg-[#f5f9fe] py-12 md:py-20">
              <div className="max-w-7xl mx-auto px-4 md:px-6">
                <ProductGridSkeleton count={8} />
              </div>
            </div>
          }
        >
          <ShopSection products={products} search={search} onView={onView} />
        </Suspense>
      </LazySection>
    </>
  );
}

export default memo(Catalog);
