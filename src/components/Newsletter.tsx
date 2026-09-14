import { useState } from 'react';
import { Gift, Loader2, Mail, Send } from 'lucide-react';
import { subscribe } from '../lib/catalog';
import { useShop } from '../store/ShopContext';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { showToast } = useShop();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      const res = subscribe(email.trim());
      setMsg(res.message);
      try { localStorage.setItem('zaman-code', 'ZAMAN10'); } catch { /* ignore */ }
      showToast('تم الاشتراك! كود خصمك ZAMAN10');
      setEmail('');
    } catch { setMsg('تعذر الاشتراك'); }
    finally { setLoading(false); }
  };

  return (
    <section className="bg-[#1565c0] py-12 md:py-16 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #fff 0 2px, transparent 2px 18px)' }} />
      <div className="relative max-w-4xl mx-auto px-4 text-center text-white">
        <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-[12px] font-black mb-4"><Gift size={15} /> نشرة الجامعين — قطع نادرة قبل نفادها</span>
        <h2 className="font-black text-2xl md:text-4xl mb-2">اشترك واحصل على خصم 10% فوراً</h2>
        <p className="text-white/70 font-bold text-sm mb-6">تنبيهات الوصول الجديد، مزادات القطع النادرة، وخصومات حصرية للمشتركين فقط.</p>
        <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 max-w-xl mx-auto">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-2xl px-4 py-3.5">
            <Mail size={18} className="text-[#1565c0] shrink-0" />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="بريدك الإلكتروني" dir="ltr" className="flex-1 bg-transparent outline-none text-[#0f2f52] font-bold text-sm text-left placeholder:text-right" />
          </div>
          <button disabled={loading} className="bg-[#0f2f52] hover:bg-black disabled:opacity-60 text-white font-black px-7 py-3.5 rounded-2xl flex items-center justify-center gap-2 text-sm">
            {loading ? <Loader2 size={17} className="animate-spin" /> : <Send size={17} />} اشترك الآن
          </button>
        </form>
        {msg && <div className="mt-3 text-sm font-black bg-white/15 border border-white/25 rounded-2xl px-4 py-2.5 inline-block">{msg}</div>}
      </div>
    </section>
  );
}
