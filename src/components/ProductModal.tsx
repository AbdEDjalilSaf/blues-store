import { useEffect, useRef, useState } from 'react';
import { BadgeCheck, Heart, Minus, Plus, Ruler, ShoppingBag, Star, Truck, X } from 'lucide-react';
import { formatPrice, parseSizes, type Product, type Review } from '../lib/api';
import { loadReviews, saveReview } from '../lib/catalog';
import { useShopActions, useWishlist } from '../store/shop';

interface Props {
  p: Product;
  onClose: () => void;
}

/**
 * Mounted only while a product is open (see `App`), and remounted via
 * `key={product.id}`, so the per-product state below initialises fresh without
 * a reset effect.
 */
export default function ProductModal({ p, onClose }: Props) {
  const { addToCart, setCartOpen, toggleWish, showToast } = useShopActions();
  const wishlist = useWishlist();
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [sizeErr, setSizeErr] = useState(false);
  const [reviews, setReviews] = useState<Review[]>(() => loadReviews(p.id));
  const [form, setForm] = useState({ author: '', rating: 5, text: '' });
  const [sending, setSending] = useState(false);
  const panel = useRef<HTMLDivElement | null>(null);

  // Scroll lock + Escape to close. Pure external-system work, no setState.
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    panel.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const sizes = parseSizes(p.sizes);
  const wished = wishlist.includes(p.id);
  const discount = p.old_price ? Math.round((1 - Number(p.price) / Number(p.old_price)) * 100) : 0;

  const buy = () => {
    if (!size) { setSizeErr(true); return; }
    addToCart(p, size, qty);
    onClose();
    setCartOpen(true);
  };

  const sendReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author.trim() || !form.text.trim()) { showToast('فضلاً أكمل اسمك وتقييمك'); return; }
    setSending(true);
    try {
      const r = saveReview({ product_id: p.id, author: form.author.trim(), rating: form.rating, text: form.text.trim() });
      setReviews((prev) => [r, ...prev]);
      setForm({ author: '', rating: 5, text: '' });
      showToast('شكراً! تم نشر تقييمك');
    } catch {
      showToast('تعذر إرسال التقييم، حاول لاحقاً');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={p.name_ar}>
      <div className="absolute inset-0 bg-[#0f2f52]/70 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panel}
        tabIndex={-1}
        className="relative bg-[#f5f9fe] w-full max-w-4xl max-h-[94vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl outline-none"
      >
        <button onClick={onClose} className="absolute top-3 left-3 z-10 w-10 h-10 grid place-items-center rounded-full bg-[#0f2f52] text-white hover:bg-[#1565c0]" aria-label="إغلاق"><X size={20} /></button>
        <div className="grid md:grid-cols-2">
          <div className="relative bg-[#e7eff8] p-4 md:p-6">
            <img src={p.image} alt={p.name_ar} loading="lazy" decoding="async" width={640} height={640} className="w-full aspect-square object-cover rounded-2xl border-2 border-[#0f2f52]/10 shadow" />
            <div className="absolute top-6 right-6 md:top-8 md:right-8 flex flex-col gap-1.5">
              {p.badge && <span className="bg-[#1565c0] text-white text-[11px] font-black px-3 py-1 rounded-full shadow">{p.badge}</span>}
              {discount > 0 && <span className="bg-[#2f9de4] text-[#0f2f52] text-[11px] font-black px-3 py-1 rounded-full shadow">خصم {discount}%</span>}
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {[{ i: BadgeCheck, t: 'شهادة أصالة' }, { i: Truck, t: 'شحن سريع' }, { i: Ruler, t: 'دليل مقاسات' }].map((f) => (
                <div key={f.t} className="bg-white rounded-xl border border-[#0f2f52]/10 p-2 text-center text-[11px] font-black text-[#0f2f52] flex flex-col items-center gap-1"><f.i size={18} className="text-[#1d6fd1]" />{f.t}</div>
              ))}
            </div>
          </div>
          <div className="p-5 md:p-7">
            <div className="flex items-center gap-2 text-[12px] font-black text-[#1565c0] mb-2 flex-wrap"><span className="bg-[#1565c0]/10 px-3 py-1 rounded-full">{p.team} • {p.year}</span><span className="bg-[#0f2f52]/8 text-[#0f2f52] px-3 py-1 rounded-full">{p.category}</span></div>
            <h3 className="font-black text-2xl md:text-3xl text-[#0f2f52] leading-snug mb-2">{p.name_ar}</h3>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={16} className={i < Math.round(Number(p.rating)) ? 'fill-[#2f9de4] text-[#2f9de4]' : 'text-[#0f2f52]/20'} />)}</span>
              <span className="text-[13px] font-black text-[#0f2f52]">{Number(p.rating).toFixed(1)}</span>
              <span className="text-[12px] font-bold text-[#0f2f52]/50">({reviews.length || p.reviews_count} تقييم)</span>
            </div>
            <p className="text-[14px] leading-7 font-medium text-[#0f2f52]/75 mb-4">{p.description_ar}</p>
            <div className="flex flex-wrap gap-2 mb-4 text-[12px] font-black">
              <span className="px-3 py-1.5 rounded-full bg-[#0f2f52] text-[#f5f9fe]">الحقبة: {p.era}</span>
              <span className="px-3 py-1.5 rounded-full bg-white border border-[#0f2f52]/15 text-[#0f2f52]">الحالة: {p.condition}</span>
              <span className="px-3 py-1.5 rounded-full bg-[#2f9de4]/15 border border-[#2f9de4]/40 text-[#0f4c9c]">الندرة: {p.rarity}</span>
            </div>
            <div className="mb-1 flex items-center justify-between">
              <div className="font-black text-[#0f2f52] text-sm">اختر المقاس: {p.stock <= 3 && p.stock > 0 && <span className="text-[#1565c0] text-[12px]"> (بقي {p.stock} فقط!)</span>}</div>
              <span className="text-[12px] font-bold text-[#0f2f52]/50 underline underline-offset-4 cursor-pointer" onClick={() => showToast('الصدر: M=96 • L=102 • XL=108 سم')}>دليل المقاسات</span>
            </div>
            <div className="flex flex-wrap gap-2 my-3">
              {sizes.map((s) => (
                <button key={s} onClick={() => { setSize(s); setSizeErr(false); }} className={`min-w-12 h-12 px-4 rounded-2xl font-black text-[15px] border-2 transition-all ${size === s ? 'bg-[#0f2f52] text-[#f5f9fe] border-[#0f2f52] scale-105' : 'bg-white text-[#0f2f52] border-[#0f2f52]/15 hover:border-[#0f2f52]'}`}>{s}</button>
              ))}
            </div>
            {sizeErr && <div className="text-[13px] font-black text-[#1565c0] mb-2">فضلاً اختر المقاس أولاً</div>}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1 bg-white border-2 border-[#0f2f52]/15 rounded-full p-1">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 grid place-items-center rounded-full hover:bg-[#0f2f52]/10" aria-label="إنقاص"><Minus size={16} /></button>
                <span className="w-8 text-center font-black">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(9, q + 1))} className="w-9 h-9 grid place-items-center rounded-full hover:bg-[#0f2f52]/10" aria-label="زيادة"><Plus size={16} /></button>
              </div>
              <div className="ms-auto text-left">
                <div className="font-black text-2xl text-[#0f2f52]">{formatPrice(Number(p.price) * qty)}</div>
                {p.old_price && <div className="text-[13px] font-bold text-[#0f2f52]/40 line-through">{formatPrice(Number(p.old_price) * qty)}</div>}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button onClick={buy} disabled={(p.stock || 0) <= 0} className="bg-[#1565c0] hover:bg-[#0d47a1] disabled:opacity-40 text-white font-black py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[.98]"><ShoppingBag size={19} /> أضف إلى السلة — {formatPrice(Number(p.price) * qty)}</button>
              <button onClick={() => { if (!size) { setSizeErr(true); return; } addToCart(p, size, qty); }} disabled={(p.stock || 0) <= 0} className="bg-white border-2 border-[#0f2f52] text-[#0f2f52] font-black py-3 rounded-2xl hover:bg-[#0f2f52] hover:text-white transition-all">إضافة سريعة بدون فتح السلة</button>
            </div>
            <div className="mt-6 border-t-2 border-dashed border-[#0f2f52]/15 pt-4">
              <div className="font-black text-[#0f2f52] mb-3">آراء المقتنين ({reviews.length})</div>
              <div className="space-y-2.5 max-h-44 overflow-y-auto pe-1 mb-4">
                {reviews.length === 0 && <div className="text-[13px] font-bold text-[#0f2f52]/50 bg-white rounded-xl p-3 border border-[#0f2f52]/10">كن أول من يقيّم هذه التحفة</div>}
                {reviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-xl border border-[#0f2f52]/10 p-3">
                    <div className="flex items-center gap-2 mb-1"><span className="font-black text-[13px] text-[#0f2f52]">{r.author}</span><span className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < r.rating ? 'fill-[#2f9de4] text-[#2f9de4]' : 'text-[#0f2f52]/20'} />)}</span></div>
                    <div className="text-[13px] font-medium text-[#0f2f52]/70 leading-6">{r.text}</div>
                  </div>
                ))}
              </div>
              <form onSubmit={sendReview} className="bg-white rounded-2xl border-2 border-[#0f2f52]/10 p-3 grid gap-2">
                <div className="grid grid-cols-[1fr_auto] gap-2">
                  <input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} placeholder="اسمك الكريم" className="bg-[#f5f9fe] rounded-xl px-3 py-2.5 text-[13px] font-bold outline-none focus:ring-2 ring-[#2f9de4]" />
                  <select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="bg-[#0f2f52] text-white rounded-xl px-3 text-[13px] font-black outline-none">
                    {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
                  </select>
                </div>
                <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} placeholder="حدثنا عن تجربتك مع القميص…" rows={2} className="bg-[#f5f9fe] rounded-xl px-3 py-2.5 text-[13px] font-bold outline-none focus:ring-2 ring-[#2f9de4] resize-none" />
                <button disabled={sending} className="bg-[#0f2f52] text-white font-black text-[13px] py-2.5 rounded-xl hover:bg-[#174a7c] disabled:opacity-50">{sending ? 'جارٍ النشر…' : 'نشر التقييم'}</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
