import { ArrowLeft, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck, X } from 'lucide-react';
import { formatPrice } from '../lib/api';
import { useCart, useShopActions } from '../store/shop';

export default function CartDrawer({ onCheckout }: { onCheckout: () => void }) {
  const { cart, cartOpen, subtotal, cartCount } = useCart();
  const { setCartOpen, updateQty, removeFromCart } = useShopActions();
  const shipping = subtotal >= 300 || subtotal === 0 ? 0 : 25;
  const total = subtotal + shipping;

  if (!cartOpen) return null;
  return (
    <div className="fixed inset-0 z-[85]" role="dialog" aria-modal="true" aria-label="سلة المقتنيات">
      <div className="absolute inset-0 bg-[#0f2f52]/70 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
      <aside className="absolute top-0 bottom-0 left-0 w-full max-w-md bg-[#f5f9fe] shadow-2xl flex flex-col" aria-label="سلة المقتنيات">
        <div className="bg-[#0f2f52] text-[#f5f9fe] p-5 flex items-center justify-between">
          <div className="font-black text-lg flex items-center gap-2"><ShoppingBag size={20} className="text-[#bfe1f8]" /> سلة المقتنيات ({cartCount})</div>
          <button onClick={() => setCartOpen(false)} className="w-9 h-9 grid place-items-center rounded-full hover:bg-white/10" aria-label="إغلاق"><X size={20} /></button>
        </div>
        {cart.length === 0 ? (
          <div className="flex-1 grid place-items-center p-8 text-center">
            <div>
              <div className="w-20 h-20 mx-auto rounded-full bg-[#0f2f52]/8 grid place-items-center mb-4"><ShoppingBag size={32} className="text-[#0f2f52]/40" /></div>
              <div className="font-black text-xl text-[#0f2f52] mb-1">سلتك فارغة</div>
              <p className="text-sm font-bold text-[#0f2f52]/50 mb-5">التاريخ ينتظرك… اختر تحفتك الأولى</p>
              <button onClick={() => setCartOpen(false)} className="bg-[#0f2f52] text-white font-black px-6 py-3 rounded-full text-sm">تصفح التشكيلة</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map((c) => (
                <div key={`${c.product.id}-${c.size}`} className="bg-white rounded-2xl border-2 border-[#0f2f52]/10 p-3 flex gap-3">
                  <img src={c.product.image} alt={c.product.name_ar} loading="lazy" decoding="async" width={160} height={160} className="w-20 h-20 rounded-xl object-cover border border-[#0f2f52]/10 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-[13px] text-[#0f2f52] truncate">{c.product.name_ar}</div>
                    <div className="text-[12px] font-bold text-[#0f2f52]/50">مقاس {c.size} • {c.product.year}</div>
                    <div className="flex justify-end mt-2">
                      
                      <div className="font-black flex justify-end text-[14px] text-[#0f2f52]">{formatPrice(Number(c.product.price) * c.qty)}</div>
                    </div>
                  </div>
                  <button onClick={() => removeFromCart(c.product.id, c.size)} className="self-start text-[#1565c0]/60 hover:text-[#1565c0] p-1" aria-label="حذف"><Trash2 size={17} /></button>
                </div>
              ))}
              <div className="grid grid-cols-2 gap-2 text-[12px] font-black">
                <div className="bg-[#1d6fd1]/10 border border-[#1d6fd1]/20 text-[#0f4c9c] rounded-xl p-2.5 flex items-center gap-1.5"><ShieldCheck size={16} /> فحص + شهادة أصالة</div>
              </div>
            </div>
            <div className="border-t-2 border-dashed border-[#0f2f52]/15 bg-white p-5 space-y-2">
              <div className="flex justify-between text-[13px] font-bold text-[#0f2f52]/70"><span>المجموع الفرعي</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between text-[13px] font-bold text-[#0f2f52]/70"><span>الشحن</span><span className={shipping === 0 ? 'text-[#1d6fd1] font-black' : ''}>{shipping === 0 ? 'مجاني' : formatPrice(shipping)}</span></div>
              {shipping > 0 && <div className="text-[12px] font-black text-[#0f4c9c] bg-[#2f9de4]/15 rounded-xl px-3 py-2">أضف بقيمة {formatPrice(300 - subtotal)} للحصول على شحن مجاني</div>}
              <div className="flex justify-between font-black text-lg text-[#0f2f52] pt-1"><span>الإجمالي</span><span>{formatPrice(total)}</span></div>
              <button onClick={onCheckout} className="w-full bg-[#1565c0] hover:bg-[#0d47a1] text-white font-black py-3.5 rounded-2xl transition-all active:scale-[.98] flex items-center justify-center gap-2">إتمام الطلب <ArrowLeft size={18} /></button>
              <button onClick={() => setCartOpen(false)} className="w-full text-[13px] font-black text-[#0f2f52]/60 hover:text-[#0f2f52] py-1">مواصلة التسوق</button>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
