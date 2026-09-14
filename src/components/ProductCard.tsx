import { memo } from 'react';
import { Eye, Heart, Star } from 'lucide-react';
import { formatPrice, parseSizes, type Product } from '../lib/api';
import { useShop } from '../store/ShopContext';

function ProductCard({ p, onView }: { p: Product; onView: (p: Product) => void }) {
  const { addToCart, toggleWish, wishlist } = useShop();
  const wished = wishlist.includes(p.id);
  const sizes = parseSizes(p.sizes);
  const discount = p.old_price ? Math.round((1 - Number(p.price) / Number(p.old_price)) * 100) : 0;
  const soldOut = (p.stock || 0) <= 0;

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border-2 border-[#0f2f52]/10 hover:border-[#2f9de4] hover:shadow-[0_20px_50px_rgba(18,41,28,.15)] transition-all duration-300 hover:-translate-y-1.5 flex flex-col">
      <div className="relative overflow-hidden bg-[#e7eff8] cursor-pointer" onClick={() => onView(p)}>
        <img src={p.image} alt={p.name_ar} loading="lazy" decoding="async" width={640} height={640} draggable={false} className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-3 right-3 flex flex-col gap-1.5">
          {p.badge && <span className="bg-[#1565c0] text-white text-[11px] font-black px-3 py-1 rounded-full shadow">{p.badge}</span>}
          {discount > 0 && <span className="bg-[#2f9de4] text-[#0f2f52] text-[11px] font-black px-3 py-1 rounded-full shadow">خصم {discount}%</span>}
        </div>
        <button onClick={(e) => { e.stopPropagation(); toggleWish(p.id); }} aria-label="مفضلة" className={`absolute top-3 left-3 w-9 h-9 grid place-items-center rounded-full shadow transition-all ${wished ? 'bg-[#1565c0] text-white' : 'bg-white/90 text-[#0f2f52] hover:bg-[#1565c0] hover:text-white'}`}>
          <Heart size={17} className={wished ? 'fill-current' : ''} />
        </button>
        {soldOut && <div className="absolute inset-0 bg-[#0f2f52]/60 grid place-items-center"><span className="bg-[#f5f9fe] text-[#1565c0] font-black px-5 py-2 rounded-full text-sm rotate-[-6deg] border-2 border-[#1565c0]">نفدت الكمية</span></div>}
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={(e) => { e.stopPropagation(); onView(p); }} className="w-full bg-[#0f2f52]/90 backdrop-blur text-[#f5f9fe] font-black text-[13px] py-2.5 rounded-full flex items-center justify-center gap-2 hover:bg-[#0f2f52]"><Eye size={16} /> عرض سريع</button>
        </div>
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-black bg-[#0f2f52]/8 text-[#0f2f52] px-2.5 py-1 rounded-full">{p.team} • {p.year}</span>
          <span className="flex items-center gap-1 text-[12px] font-black text-[#1565c0]"><Star size={13} className="fill-[#2f9de4] text-[#2f9de4]" />{Number(p.rating).toFixed(1)}</span>
        </div>
        <h3 onClick={() => onView(p)} className="font-black text-[15px] leading-6 text-[#0f2f52] cursor-pointer hover:text-[#1565c0] transition-colors line-clamp-1">{p.name_ar}</h3>
        <div className="flex items-center gap-1.5 flex-wrap text-[11px] font-bold text-[#0f2f52]/60">
          <span className="border border-[#0f2f52]/15 rounded-full px-2 py-0.5">{p.era}</span>
          <span className="border border-[#0f2f52]/15 rounded-full px-2 py-0.5">{p.condition}</span>
          <span className="border border-[#2f9de4]/50 bg-[#2f9de4]/10 text-[#0f4c9c] rounded-full px-2 py-0.5">{p.rarity}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1">
          {sizes.slice(0, 5).map((s) => <span key={s} className="text-[11px] font-black w-7 h-7 grid place-items-center rounded-lg bg-[#f5f9fe] border border-[#0f2f52]/15 text-[#0f2f52]">{s}</span>)}
          {p.stock <= 3 && p.stock > 0 && <span className="text-[11px] font-black text-[#1565c0] ms-auto">بقي {p.stock} فقط!</span>}
        </div>
        <div className="flex items-end justify-between mt-auto pt-2 border-t border-dashed border-[#0f2f52]/15">
          <div>
            <div className="font-black text-lg text-[#0f2f52]">{formatPrice(Number(p.price))}</div>
            {p.old_price && <div className="text-[12px] font-bold text-[#0f2f52]/40 line-through">{formatPrice(Number(p.old_price))}</div>}
          </div>
          <button disabled={soldOut} onClick={() => (sizes.length === 1 ? addToCart(p, sizes[0]) : onView(p))} className="bg-[#0f2f52] hover:bg-[#1565c0] disabled:opacity-40 text-[#f5f9fe] font-black text-[13px] px-5 py-2.5 rounded-full transition-all active:scale-95">
            {sizes.length === 1 ? 'أضف للسلة' : 'اختر المقاس'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(ProductCard);
