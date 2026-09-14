import { CreditCard, Instagram, MapPin, Phone, Twitter, Youtube } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-[#0a2140] text-[#f5f9fe] pt-12 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-6 grid gap-8 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <Logo className="w-10 h-10" />
            <span><span className="block font-black text-lg">بلوز سيتي</span><span className="block text-[10px] font-bold tracking-[.25em] text-[#bfe1f8]">BLUES CITY</span></span>
          </div>
          <p className="text-[13px] font-medium text-[#f5f9fe]/60 leading-7 mb-4">وجهة جامعي الأقمصة الفينتاج في الوطن العربي. قطع أصلية موثقة من 1962 حتى 1998.</p>
          <div className="flex gap-2">
            {[Instagram, Twitter, Youtube].map((I, i) => <a key={i} href="#home" className="w-10 h-10 grid place-items-center rounded-full bg-white/8 hover:bg-[#2f9de4] hover:text-[#0f2f52] transition-all" aria-label="تواصل"><I size={18} /></a>)}
          </div>
        </div>
        <div>
          <div className="font-black mb-4 text-[#bfe1f8]">تسوّق</div>
          <ul className="space-y-2.5 text-[14px] font-bold text-[#f5f9fe]/70">
            {[['المتجر الكامل', '#shop'], ['حقبة الستينات', '#shop'], ['حقبة السبعينات', '#shop'], ['حقبة الثمانينات', '#shop'], ['حقبة التسعينات', '#shop']].map(([t, h]) => <li key={t}><a href={h} className="hover:text-[#bfe1f8]">{t}</a></li>)}
          </ul>
        </div>
        <div>
          <div className="font-black mb-4 text-[#bfe1f8]">مساعدة</div>
          <ul className="space-y-2.5 text-[14px] font-bold text-[#f5f9fe]/70">
            {[['تتبع طلبك', '#track'], ['سياسة الإرجاع 14 يوم', '#auth'], ['دليل المقاسات', '#shop'], ['شهادة الأصالة', '#auth'], ['قصتنا', '#story']].map(([t, h]) => <li key={t}><a href={h} className="hover:text-[#bfe1f8]">{t}</a></li>)}
          </ul>
        </div>
        <div>
          <div className="font-black mb-4 text-[#bfe1f8]">تواصل</div>
          <ul className="space-y-3 text-[14px] font-bold text-[#f5f9fe]/70">
            <li className="flex items-center gap-2"><Phone size={16} className="text-[#bfe1f8]" /><span dir="ltr">+966 55 123 4567</span></li>
            <li className="flex items-center gap-2"><MapPin size={16} className="text-[#bfe1f8]" /> الرياض • نشحن لكل المدن</li>
            <li className="flex items-center gap-2"><CreditCard size={16} className="text-[#bfe1f8]" /> مدى • Visa • Apple Pay • عند الاستلام</li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 md:px-6 mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] font-bold text-[#f5f9fe]/40">
        <span>© 2026 بلوز سيتي — جميع الحقوق محفوظة</span>
        <span>صُنع بشغف لكرة القدم الجميلة</span>
      </div>
    </footer>
  );
}
