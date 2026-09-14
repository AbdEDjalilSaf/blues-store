import { useState } from 'react';
import { BadgeCheck, Banknote, CheckCircle2, CreditCard, Loader2, MapPin, Phone, User, Wallet, X } from 'lucide-react';
import { formatPrice } from '../lib/api';
import { saveOrder } from '../lib/catalog';
import { useShop } from '../store/ShopContext';

const CITIES = ['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'أبها', 'تبوك', 'بريدة', 'خميس مشيط', 'حائل', 'جازان', 'نجران', 'ينبع', 'الطائف', 'أخرى'];

export default function CheckoutModal({ open, onClose }: { open: boolean; onClose: (orderId?: number) => void }) {
  const { cart, subtotal, clearCart, showToast } = useShop();
  const [form, setForm] = useState({ name: '', phone: '', city: 'الرياض', address: '', notes: '', pay: 'عند الاستلام' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [doneId, setDoneId] = useState<number | null>(null);

  if (!open) return null;
  const shipping = subtotal >= 300 || subtotal === 0 ? 0 : 25;
  const total = subtotal + shipping;
  let discount = 0;
  try {
    const code = localStorage.getItem('zaman-code');
    if (code === 'ZAMAN10') discount = Math.round(total * 0.1);
  } catch { /* ignore */ }
  const grand = total - discount;

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 3) e.name = 'فضلاً أدخل الاسم الكامل';
    if (!/^(05\d{8}|\+9665\d{8})$/.test(form.phone.replace(/[\s-]/g, ''))) e.phone = 'رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام';
    if (!form.city) e.city = 'اختر المدينة';
    if (form.address.trim().length < 8) e.address = 'فضلاً أدخل العنوان بالتفصيل (الحي + الشارع)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    if (cart.length === 0) { showToast('سلتك فارغة'); return; }
    setSending(true);
    try {
      const items = cart.map((c) => ({ product_id: c.product.id, name: c.product.name_ar, size: c.size, qty: c.qty, price: Number(c.product.price), image: c.product.image }));
      const order = saveOrder({
        customer_name: form.name.trim(),
        phone: form.phone.replace(/[\s-]/g, ''),
        city: form.city,
        address: form.address.trim(),
        items,
        total: grand,
      });
      setDoneId(order.id);
      clearCart();
    } catch (err: any) {
      showToast(err.message || 'تعذر إتمام الطلب، حاول لاحقاً');
    } finally { setSending(false); }
  };

  const closeAll = () => { setDoneId(null); onClose(doneId || undefined); };

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center sm:p-4" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-[#0f2f52]/75 backdrop-blur-sm" onClick={closeAll} />
      <div className="relative bg-[#f5f9fe] w-full max-w-2xl max-h-[94vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl">
        {doneId ? (
          <div className="p-8 md:p-10 text-center">
            <CheckCircle2 size={64} className="mx-auto text-[#1d6fd1] mb-4" />
            <h3 className="font-black text-2xl md:text-3xl text-[#0f2f52] mb-2">تم استلام طلبك بنجاح!</h3>
            <p className="font-bold text-[#0f2f52]/60 mb-4">رقم الطلب: <span className="font-black text-[#1565c0] text-xl">#{doneId}</span></p>
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
                  <label className="font-black text-[13px] text-[#0f2f52] flex items-center gap-1.5 mb-1.5"><MapPin size={15} /> المدينة *</label>
                  <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full bg-white border-2 border-[#0f2f52]/12 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-[#2f9de4]">
                    {CITIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-black text-[13px] text-[#0f2f52] mb-1.5 block">ملاحظات (اختياري)</label>
                  <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="تغليف هدية؟ مقاس بديل؟" className="w-full bg-white border-2 border-[#0f2f52]/12 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-[#2f9de4]" />
                </div>
              </div>
              <div>
                <label className="font-black text-[13px] text-[#0f2f52] mb-1.5 block">العنوان التفصيلي *</label>
                <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="الحي، الشارع، رقم المبنى، أقرب معلم…" rows={2} className={`w-full bg-white border-2 rounded-2xl px-4 py-3 text-sm font-bold outline-none focus:border-[#2f9de4] resize-none ${errors.address ? 'border-[#1565c0]' : 'border-[#0f2f52]/12'}`} />
                {errors.address && <div className="text-[12px] font-black text-[#1565c0] mt-1">{errors.address}</div>}
              </div>
              <div>
                <div className="font-black text-[13px] text-[#0f2f52] mb-2">طريقة الدفع</div>
                <div className="grid grid-cols-3 gap-2">
                  {[{ v: 'عند الاستلام', i: Banknote }, { v: 'بطاقة مدى', i: CreditCard }, { v: 'Apple Pay', i: Wallet }].map((m) => (
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
                <div className="flex justify-between text-[13px] font-bold text-[#0f2f52]/60"><span>الشحن</span><span>{shipping === 0 ? 'مجاني' : formatPrice(shipping)}</span></div>
                {discount > 0 && <div className="flex justify-between text-[13px] font-black text-[#1d6fd1]"><span>خصم ZAMAN10</span><span>- {formatPrice(discount)}</span></div>}
                <div className="flex justify-between font-black text-lg text-[#0f2f52] border-t border-dashed border-[#0f2f52]/15 pt-2"><span>الإجمالي</span><span>{formatPrice(grand)}</span></div>
              </div>
              <button disabled={sending} className="bg-[#1565c0] hover:bg-[#0d47a1] disabled:opacity-60 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 text-[15px]">
                {sending ? <><Loader2 size={19} className="animate-spin" /> جارٍ تأكيد طلبك…</> : <><BadgeCheck size={19} /> تأكيد الطلب — {formatPrice(grand)}</>}
              </button>
              <div className="text-center text-[12px] font-bold text-[#0f2f52]/50">بالضغط على تأكيد أنت توافق على سياسة الاستبدال خلال 14 يوم</div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
