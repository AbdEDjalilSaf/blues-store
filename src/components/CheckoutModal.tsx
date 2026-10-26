import { useState } from 'react';
import { BadgeCheck, Banknote, CheckCircle2, Copy, Loader2, MapPin, Phone, User, X } from 'lucide-react';
import { formatPrice } from '../lib/api';
import { WILAYAS, OrderValidationError, createOrder, type CreatedOrder } from '../lib/checkoutApi';
import { useCart, useShopActions } from '../store/shop';

export default function CheckoutModal({ open, onClose }: { open: boolean; onClose: (orderId?: number) => void }) {
  const { cart, subtotal } = useCart();
  const { clearCart, showToast } = useShopActions();
  const [form, setForm] = useState({ name: '', phone: '', wilayaId: 16, pay: 'عند الاستلام' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<CreatedOrder | null>(null);

  if (!open) return null;
  const shipping = subtotal >= 10000 || subtotal === 0 ? 0 : 25;
  const total = subtotal + shipping;
  const showShipping = subtotal >= 10000;
  let discount = 0;
  try {
    const code = localStorage.getItem('zaman-code');
    if (code === 'ZAMAN10') discount = Math.round(total * 0.1);
  } catch { /* ignore */ }
  const grand = total - discount;

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = 'فضلاً أدخل الاسم الكامل';
    if (!/^(0[5-7]\d{8})$/.test(form.phone.replace(/[\s-]/g, ''))) e.phone = 'رقم الجوال يجب أن يبدأ بـ 05 أو 06 أو 07 ويتكون من 10 أرقام';
    if (!form.wilayaId) e.city = 'اختر الولاية';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    if (cart.length === 0) { showToast('سلتك فارغة'); return; }
    setSending(true);
    try {
      // The contract's items carry only `product_id` (no qty), so each unit
      // of a line becomes its own entry — subtotal math stays correct.
      const items = cart.flatMap((c) =>
        Array.from({ length: Math.max(1, c.qty) }, () => ({ product_id: c.product.id }))
      );
      const order = await createOrder({
        customer_name: form.name.trim(),
        phone: form.phone.replace(/[\s-]/g, ''),
        wilaya_id: form.wilayaId,
        items,
      });
      setDone(order);
      clearCart();
    } catch (err) {
      if (err instanceof OrderValidationError) {
        const mapped: Record<string, string> = {};
        if (err.fields.customer_name) mapped.name = err.fields.customer_name;
        if (err.fields.phone) mapped.phone = err.fields.phone;
        if (err.fields.wilaya_id) mapped.city = err.fields.wilaya_id;
        if (Object.keys(mapped).length > 0) setErrors(mapped);
        showToast(err.message);
      } else {
        showToast(err instanceof Error ? err.message : 'تعذر إتمام الطلب، حاول لاحقاً');
      }
    } finally { setSending(false); }
  };

  const closeAll = () => { const id = done?.id; setDone(null); onClose(id || undefined); };

  const copyOrderNumber = () => {
    const orderNumber = done?.order_number || `#${done?.id}`;
    navigator.clipboard.writeText(orderNumber).then(() => {
      showToast('تم نسخ رقم الطلب');
    }).catch(() => {
      showToast('فشل نسخ رقم الطلب');
    });
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal="true" aria-label="إتمام الطلب">
      <div className="absolute inset-0 bg-[#0f2f52]/75 backdrop-blur-sm" onClick={closeAll} />
      <div className="relative bg-[#f5f9fe] w-full max-w-2xl max-h-[94vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl">
        {done ? (
          <div className="p-8 md:p-10 text-center">
            <CheckCircle2 size={64} className="mx-auto text-[#1d6fd1] mb-4" />
            <h3 className="font-black text-2xl md:text-3xl text-[#0f2f52] mb-2">تم استلام طلبك بنجاح!</h3>
            {done.order_number || done.id > 0 ? (
              <p className="font-bold text-[#0f2f52]/60 mb-1 flex items-center justify-center gap-2">
                رقم الطلب:
                <span className="font-black text-[#1565c0] text-xl" dir="ltr">{done.order_number || `#${done.id}`}</span>
                <button onClick={copyOrderNumber} className="p-1.5 rounded-full hover:bg-[#0f2f52]/10 transition-colors" aria-label="نسخ رقم الطلب">
                  <Copy size={18} className="text-[#1565c0]" />
                </button>
              </p>
            ) : null}
            <p className="font-bold text-[#0f2f52]/60 mb-4">{done.wilaya ? `الولاية: ${done.wilaya} • ` : ''}الإجمالي: <span className="font-black text-[#1565c0]">{formatPrice(done.total)}</span></p>
            <div className="bg-white border-2 border-dashed border-[#1d6fd1]/30 rounded-2xl p-4 text-sm font-bold text-[#0f2f52]/70 leading-7 mb-6">
              سنتواصل معك قريباً لتأكيد الطلب.<br />احتفظ برقم الطلب لتتبع الشحنة من قسم «تتبع طلبك» برقم جوالك.
            </div>
            <button onClick={closeAll} className="bg-[#0f2f52] text-white font-black px-8 py-3.5 rounded-full">مواصلة التسوق</button>
          </div>
        ) : (
          <>
            <div className="bg-[#0f2f52] text-white p-5 flex items-center justify-between rounded-t-3xl sticky top-0 z-10">
              <div className="font-black text-lg">إتمام الطلب <span className="text-[#bfe1f8] text-sm font-bold">• الدفع عند الاستلام متاح</span></div>
              <button onClick={closeAll} className="w-9 h-9 grid place-items-center rounded-full hover:bg-white/10" aria-label="إغلاق"><X size={20} /></button>
            </div>
            <form onSubmit={submit} className="p-5 md:p-7 grid gap-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-[13px] text-[#0f2f52] flex items-center gap-1.5 mb-1.5"><User size={15} /> الاسم الكامل *</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="مثال: عبدالله محمد" className={`w-full bg-white border-2 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-[#2f9de4] ${errors.name ? 'border-[#1565c0]' : 'border-[#0f2f52]/12'}`} />
                  {errors.name && <div className="text-[12px] font-black text-[#1565c0] mt-1">{errors.name}</div>}
                </div>
                <div>
                  <label className="font-black text-[13px] text-[#0f2f52] flex items-center gap-1.5 mb-1.5"><Phone size={15} /> رقم الجوال *</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="0551234567" inputMode="tel" dir="ltr" className={`w-full bg-white border-2 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-[#2f9de4] text-left ${errors.phone ? 'border-[#1565c0]' : 'border-[#0f2f52]/12'}`} />
                  {errors.phone && <div className="text-[12px] font-black text-[#1565c0] mt-1">{errors.phone}</div>}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-black text-[13px] text-[#0f2f52] flex items-center gap-1.5 mb-1.5"><MapPin size={15} /> الولاية *</label>
                  <select value={form.wilayaId} onChange={(e) => setForm({ ...form, wilayaId: Number(e.target.value) })} className={`w-full bg-white border-2 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-[#2f9de4] ${errors.city ? 'border-[#1565c0]' : 'border-[#0f2f52]/12'}`}>
                    {WILAYAS.map((w) => <option key={w.id} value={w.id}>{String(w.id).padStart(2, '0')} — {w.name}</option>)}
                  </select>
                  {errors.city && <div className="text-[12px] font-black text-[#1565c0] mt-1">{errors.city}</div>}
                </div>
              </div>
              
              <div>
                <div className="font-black text-[13px] text-[#0f2f52] mb-2">طريقة الدفع</div>
                <div className="grid grid-cols-3 gap-2">
                  {[{ v: 'عند الاستلام', i: Banknote }].map((m) => (
                    <button type="button" key={m.v} onClick={() => setForm({ ...form, pay: m.v })} className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 font-black text-[12px] transition-all ${form.pay === m.v ? 'border-[#0f2f52] bg-[#0f2f52] text-white' : 'border-[#0f2f52]/12 bg-white text-[#0f2f52]'}`}><m.i size={20} />{m.v}</button>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border-2 border-[#0f2f52]/10 p-4 space-y-1.5">
                <div className="font-black text-sm text-[#0f2f52] mb-2">ملخص الطلب ({cart.length} قطعة)</div>
                <div className="max-h-32 overflow-y-auto space-y-1.5 mb-2">
                  {cart.map((c) => (
                    <div key={`${c.product.id}-${c.size}`} className="flex justify-between text-[13px] font-bold text-[#0f2f52]/70"><span className="truncate">{c.product.name_ar} • {c.size} × {c.qty}</span><span className="shrink-0">{formatPrice(Number(c.product.price) * c.qty)}</span></div>
                  ))}
                </div>
                {showShipping && (
                  <div className="flex justify-between text-[13px] font-bold text-[#0f2f52]/60"><span>الشحن</span><span>{shipping === 0 ? 'مجاني' : formatPrice(shipping)}</span></div>
                )}
                <div className="flex justify-between font-black text-lg text-[#0f2f52] border-t border-dashed border-[#0f2f52]/15 pt-2"><span>الإجمالي</span><span>{formatPrice(Number(cart.reduce((sum, c) => sum + Number(c.product.price) * c.qty, 0)) + shipping)}</span></div>
              </div>
              <button disabled={sending} className="bg-[#1565c0] hover:bg-[#0d47a1] disabled:opacity-60 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-[15px]">
                {sending ? <><Loader2 size={19} className="animate-spin" /> جارٍ تأكيد طلبك…</> : <><BadgeCheck size={19} /> تأكيد الطلب — {formatPrice(grand)}</>}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
