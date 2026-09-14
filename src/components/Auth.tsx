import { BadgeCheck, Headset, RefreshCcw, ShieldCheck, Truck } from 'lucide-react';
import Reveal from './Reveal';

export default function Auth() {
  return (
    <section id="auth" className="bg-[#e7eff8] py-12 md:py-20 scroll-mt-20 border-y-4 border-[#0f2f52]/10">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <Reveal effect="fade-up">
        <div className="text-center mb-8">
          <div className="inline-block bg-[#1d6fd1]/10 text-[#0f4c9c] font-black text-[12px] px-4 py-1.5 rounded-full mb-3">لماذا يثق بنا الجامعون؟</div>
          <h2 className="font-black text-3xl md:text-4xl text-[#0f2f52]">أصالة مضمونة… من الفحص إلى باب بيتك</h2>
        </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { i: ShieldCheck, t: 'فحص معتمد 21 نقطة', d: 'خبراء يفحصون القماش والخياطة والشعارات وبطاقات المصنع قبل قبول أي قطعة.' },
            { i: BadgeCheck, t: 'شهادة أصالة', d: 'كل قميص يصلك برقم توثيق فريد وبطاقة تروي قصته وموسمه.' },
            { i: Truck, t: 'شحن سريع وآمن', d: 'تغليف مقوى يحمي القماش + شحن 2-4 أيام، مجاني فوق 300 ر.س.' },
            { i: RefreshCcw, t: 'إرجاع 14 يوم', d: 'غيّرت رأيك أو المقاس غير مناسب؟ استبدال واسترجاع بدون تعقيد.' },
          ].map((f, i) => (
            <Reveal key={f.t} effect="fade-up" delay={(i % 4) * 80}>
            <div className="bg-white rounded-3xl border-2 border-[#0f2f52]/10 p-6 text-center hover:border-[#2f9de4] hover:-translate-y-1 transition-all h-full">
              <span className="w-14 h-14 mx-auto rounded-2xl bg-[#0f2f52] text-[#bfe1f8] grid place-items-center mb-4 rotate-[-4deg]"><f.i size={26} /></span>
              <div className="font-black text-[#0f2f52] mb-1.5">{f.t}</div>
              <div className="text-[13px] font-medium text-[#0f2f52]/60 leading-6">{f.d}</div>
            </div>
            </Reveal>
          ))}
        </div>
        <Reveal effect="fade-up">
        <div className="mt-6 bg-[#0f2f52] rounded-3xl p-5 md:p-6 flex flex-col md:flex-row items-center gap-4 text-[#f5f9fe]">
          <span className="w-12 h-12 shrink-0 rounded-2xl bg-[#2f9de4] text-[#0f2f52] grid place-items-center"><Headset size={24} /></span>
          <div className="text-center md:text-right flex-1">
            <div className="font-black">محتار بالمقاس أو تبحث عن قطعة نادرة محددة؟</div>
            <div className="text-sm text-[#f5f9fe]/60 font-bold">فريقنا من الجامعين يرد عليك واتساب خلال دقائق — وخدمة البحث عن القطع النادرة مجانية.</div>
          </div>
          <a href="#track" className="bg-[#2f9de4] hover:bg-[#bfe1f8] text-[#0f2f52] font-black px-6 py-3 rounded-full text-sm whitespace-nowrap transition-all">تواصل معنا</a>
        </div>
        </Reveal>
      </div>
    </section>
  );
}
