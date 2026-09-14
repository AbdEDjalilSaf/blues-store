import { useState } from 'react';
import { Loader2, PackageCheck, Search } from 'lucide-react';
import { formatPrice, type Order } from '../lib/api';
import { getOrdersByPhone } from '../lib/catalog';

const STATUS_STEPS = ['جديد', 'قيد التجهيز', 'تم الشحن', 'تم التوصيل'];

export default function OrderTracker() {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const track = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) { setErr('أدخل رقم الجوال المستخدم في الطلب'); return; }
    setLoading(true); setErr('');
    const data = getOrdersByPhone(phone.trim());
    setOrders(data);
    if (data.length === 0) setErr('لم نجد طلبات بهذا الرقم — تأكد من الرقم أو تواصل معنا');
    setLoading(false);
  };

  return (
    <section id="track" className="bg-[#f5f9fe] pb-12 md:pb-20 scroll-mt-20">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <div className="bg-[#0f2f52] rounded-[28px] p-6 md:p-10 text-[#f5f9fe] relative overflow-hidden">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#bfe1f8 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
          <div className="relative">
            <div className="flex items-center gap-3 mb-2"><span className="w-11 h-11 rounded-2xl bg-[#2f9de4] text-[#0f2f52] grid place-items-center"><PackageCheck size={22} /></span><h2 className="font-black text-2xl md:text-3xl">تتبع طلبك</h2></div>
            <p className="text-[#f5f9fe]/60 font-bold text-sm mb-5">أدخل رقم جوالك لعرض حالة طلباتك لحظة بلحظة</p>
            <form onSubmit={track} className="flex flex-col sm:flex-row gap-2 mb-2">
              <div className="flex-1 flex items-center gap-2 bg-white/10 border-2 border-white/15 focus-within:border-[#2f9de4] rounded-2xl px-4 py-3">
                <Search size={18} className="text-[#bfe1f8] shrink-0" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0551234567" inputMode="tel" dir="ltr" className="flex-1 bg-transparent outline-none font-bold text-left placeholder:text-white/30" />
              </div>
              <button disabled={loading} className="bg-[#2f9de4] hover:bg-[#bfe1f8] disabled:opacity-60 text-[#0f2f52] font-black px-8 py-3 rounded-2xl flex items-center justify-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : null} {loading ? 'جارٍ البحث…' : 'تتبع'}
              </button>
            </form>
            {err && <div className="text-[13px] font-black text-[#fecdd3]">{err}</div>}
            {orders && orders.length > 0 && (
              <div className="space-y-3 mt-5">
                {orders.map((o) => {
                  const step = STATUS_STEPS.indexOf(o.status);
                  return (
                    <div key={o.id} className="bg-white/8 border border-white/12 rounded-2xl p-4 backdrop-blur">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                        <span className="font-black">طلب #{o.id} <span className="text-[#bfe1f8] text-sm">• {o.city}</span></span>
                        <span className="text-[12px] font-black bg-[#2f9de4] text-[#0f2f52] px-3 py-1 rounded-full">{o.status}</span>
                      </div>
                      <div className="flex items-center gap-1 mb-3" dir="ltr">
                        {STATUS_STEPS.map((s, i) => (
                          <div key={s} className="flex-1">
                            <div className={`h-2 rounded-full ${i <= step ? 'bg-[#2f9de4]' : 'bg-white/15'}`} />
                            <div className={`text-[10px] font-black mt-1 text-center ${i <= step ? 'text-[#bfe1f8]' : 'text-white/40'}`}>{s}</div>
                          </div>
                        ))}
                      </div>
                      <div className="text-[12px] font-bold text-white/60">الإجمالي: <span className="text-white font-black">{formatPrice(Number(o.total))}</span> • {new Date(o.created_at).toLocaleDateString('ar-SA')}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
