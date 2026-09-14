import { useDeferredValue, useMemo, useState } from 'react';
import { PackageSearch, SlidersHorizontal } from 'lucide-react';
import type { Product } from '../lib/api';
import ProductCard from './ProductCard';
import Reveal from './Reveal';

const ERAS = ['الكل', 'الستينات', 'السبعينات', 'الثمانينات', 'التسعينات'];
const CATS = ['الكل', 'منتخبات', 'أندية'];
const SORTS = [
  { v: 'feat', t: 'المميز أولاً' },
  { v: 'cheap', t: 'السعر: من الأقل' },
  { v: 'exp', t: 'السعر: من الأعلى' },
  { v: 'rate', t: 'الأعلى تقييماً' },
  { v: 'new', t: 'الأحدث سنة' },
];

export default function ShopSection({ products, loading, search, onView }: { products: Product[]; loading: boolean; search: string; onView: (p: Product) => void }) {
  const [era, setEra] = useState('الكل');
  const [cat, setCat] = useState('الكل');
  const [sort, setSort] = useState('feat');
  const [onlyAvail, setOnlyAvail] = useState(false);
  const [showWish, setShowWish] = useState(false);
  const deferredSearch = useDeferredValue(search);

  const list = useMemo(() => {
    let l = [...products];
    if (deferredSearch.trim()) {
      const q = deferredSearch.trim();
      l = l.filter((p) => p.name_ar.includes(q) || p.team.includes(q) || String(p.year).includes(q));
    }
    if (era !== 'الكل') l = l.filter((p) => p.era === era);
    if (cat !== 'الكل') l = l.filter((p) => p.category === cat);
    if (onlyAvail) l = l.filter((p) => (p.stock || 0) > 0);
    if (showWish) {
      try {
        const w: number[] = JSON.parse(localStorage.getItem('zaman-wish') || '[]');
        l = l.filter((p) => w.includes(p.id));
      } catch { /* ignore */ }
    }
    switch (sort) {
      case 'cheap': l.sort((a, b) => Number(a.price) - Number(b.price)); break;
      case 'exp': l.sort((a, b) => Number(b.price) - Number(a.price)); break;
      case 'rate': l.sort((a, b) => Number(b.rating) - Number(a.rating)); break;
      case 'new': l.sort((a, b) => Number(b.year) - Number(a.year)); break;
      default: l.sort((a, b) => Number(b.featured) - Number(a.featured));
    }
    return l;
  }, [products, deferredSearch, era, cat, sort, onlyAvail, showWish]);

  return (
    <Reveal as="section" effect="fade-up" id="shop" className="bg-[#f5f9fe] py-12 md:py-20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8 md:mb-10">
          <div className="inline-block bg-[#1565c0]/10 text-[#1565c0] font-black text-[12px] px-4 py-1.5 rounded-full mb-3 tracking-wide">تشكيلتنا المختارة بعناية</div>
          <h2 className="font-black text-3xl md:text-5xl text-[#0f2f52] mb-3">تسوّق حسب الحقبة</h2>
          <p className="text-[#0f2f52]/60 font-bold text-sm md:text-base max-w-2xl mx-auto">كل قميص قطعة تاريخية أصلية — اختر حقبتك المفضلة من الستينات الذهبية حتى تسعينات الأساطير.</p>
        </div>

        <div className="bg-white rounded-3xl border-2 border-[#0f2f52]/10 p-4 md:p-5 mb-8 shadow-[0_10px_30px_rgba(18,41,28,.06)]">
          <div className="flex items-center gap-2 mb-3 text-[#0f2f52] font-black text-sm"><SlidersHorizontal size={17} /> فلترة وترتيب</div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-[12px] font-black text-[#0f2f52]/50 w-full sm:w-auto">الحقبة:</span>
            {ERAS.map((e) => (
              <button key={e} onClick={() => setEra(e)} className={`px-4 py-2 rounded-full text-[13px] font-black transition-all border-2 ${era === e ? 'bg-[#0f2f52] text-[#f5f9fe] border-[#0f2f52]' : 'bg-[#f5f9fe] text-[#0f2f52] border-transparent hover:border-[#0f2f52]/20'}`}>{e}</button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-black text-[#0f2f52]/50">التصنيف:</span>
            {CATS.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`px-4 py-2 rounded-full text-[13px] font-black transition-all border-2 ${cat === c ? 'bg-[#1565c0] text-white border-[#1565c0]' : 'bg-[#f5f9fe] text-[#0f2f52] border-transparent hover:border-[#0f2f52]/20'}`}>{c === 'الكل' ? 'الكل' : c}</button>
            ))}
            <span className="w-full sm:w-auto sm:ms-auto flex flex-wrap items-center gap-2 mt-2 sm:mt-0">
              <label className="flex items-center gap-2 text-[13px] font-black text-[#0f2f52] bg-[#f5f9fe] rounded-full px-4 py-2 cursor-pointer">
                <input type="checkbox" checked={onlyAvail} onChange={(e) => setOnlyAvail(e.target.checked)} className="accent-[#1d6fd1] w-4 h-4" /> المتوفر فقط
              </label>
              <label className="flex items-center gap-2 text-[13px] font-black text-[#0f2f52] bg-[#f5f9fe] rounded-full px-4 py-2 cursor-pointer">
                <input type="checkbox" checked={showWish} onChange={(e) => setShowWish(e.target.checked)} className="accent-[#1565c0] w-4 h-4" /> المفضلة ♥
              </label>
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="text-[13px] font-black bg-[#0f2f52] text-[#f5f9fe] rounded-full px-4 py-2.5 outline-none cursor-pointer">
                {SORTS.map((s) => <option key={s.v} value={s.v}>{s.t}</option>)}
              </select>
            </span>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border-2 border-[#0f2f52]/8 animate-pulse">
                <div className="aspect-square bg-[#d5e4f3]" />
                <div className="p-4 space-y-2"><div className="h-4 bg-[#d5e4f3] rounded w-3/4" /><div className="h-4 bg-[#d5e4f3] rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : list.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-[#0f2f52]/20">
            <PackageSearch size={48} className="mx-auto text-[#0f2f52]/30 mb-3" />
            <div className="font-black text-xl text-[#0f2f52] mb-1">لا توجد نتائج مطابقة</div>
            <p className="text-sm font-bold text-[#0f2f52]/50">جرّب حقبة أو كلمة بحث مختلفة</p>
          </div>
        ) : (
          <>
            <div className="text-[13px] font-black text-[#0f2f52]/50 mb-4">عرض {list.length} قميص</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {list.map((p) => <ProductCard key={p.id} p={p} onView={onView} />)}
            </div>
          </>
        )}
        <div className="mt-8 text-center text-[13px] font-bold text-[#0f2f52]/50">
          جميع القطع أصلية ومرفقة بشهادة فحص • الكميات محدودة بحكم الندرة
        </div>
      </div>
    </Reveal>
  );
}
