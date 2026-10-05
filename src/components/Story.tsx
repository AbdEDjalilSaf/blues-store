import { Award, Gem, SearchCheck, Shirt } from 'lucide-react';
import Reveal from './Reveal';

export default function Story() {
  return (
    <section id="story" className="bg-[#0f2f52] text-[#f5f9fe] py-14 md:py-24 scroll-mt-20 relative overflow-hidden" aria-labelledby="story-heading">
      <div className="absolute inset-0 opacity-[.07]" style={{ backgroundImage: 'radial-gradient(#bfe1f8 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
      <div className="relative max-w-7xl mx-auto px-4 md:px-6 grid lg:grid-cols-2 gap-10 items-center">
        <Reveal effect="fade-up">
          <div className="inline-block bg-[#2f9de4]/15 border border-[#2f9de4]/40 text-[#bfe1f8] font-black text-[12px] px-4 py-1.5 rounded-full mb-4">قصتنا • من المدرجات إلى خزانتك</div>
          <h2 id="story-heading" className="font-black text-3xl md:text-5xl leading-snug mb-5">بدأنا بشغف…<br />وصرنا <span className="text-[#bfe1f8]">وجهة جامعي القمصان</span> في الوطن العربي</h2>
          <p className="text-[#f5f9fe]/75 leading-8 font-medium mb-6 text-[15px]">
            في 2016 انطلقنا من غرفة صغيرة مليئة بقمصان الثمانينات. اليوم نوثّق كل قطعة بخبراء فحص، نرممها بأيدي حرفيين، ونوصلها بتغليف يليق بتاريخها — من قميص بيليه 1970 إلى سحر التسعينات.
          </p>
          <div className="grid sm:grid-cols-2 gap-3 mb-7">
            {[
              { i: SearchCheck, t: 'فحص 21 نقطة', d: 'قماش، خياطة، شعارات، بطاقات' },
              { i: Award, t: 'شهادة أصالة', d: 'رقم توثيق فريد لكل قطعة' },
              { i: Shirt, t: 'ترميم حرفي', d: 'تنظيف ومعالجة تحفظ القماش' },
              { i: Gem, t: 'ندرة مضمونة', d: 'قطع أصلية من حقبتها فقط' },
            ].map((f) => (
              <div key={f.t} className="bg-[#f5f9fe]/6 border border-[#f5f9fe]/12 rounded-2xl p-4 flex gap-3">
                <span className="w-11 h-11 shrink-0 rounded-xl bg-[#2f9de4] text-[#0f2f52] grid place-items-center"><f.i size={21} /></span>
                <span><span className="block font-black text-[15px]">{f.t}</span><span className="block text-[13px] text-[#f5f9fe]/60 font-bold">{f.d}</span></span>
              </div>
            ))}
          </div>
          
        </Reveal>
        <Reveal effect="zoom-in" delay={100}>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          <img src="/images/shop-rack.webp" alt="رفوف متجر بلوز سيتي满了 بالأقمصة الفينتاج الأصلية" loading="lazy" decoding="async" width={640} height={478} className="rounded-3xl border-4 border-[#bfe1f8]/30 object-cover w-full" />
          <div className="space-y-3 md:space-y-4">
            <img src="/images/craft.webp" alt="حرفية ترميم القماش يدوياً في ورشة المتجر" loading="lazy" decoding="async" width={640} height={478} className="rounded-3xl border-4 border-[#f5f9fe]/20 object-cover w-full" />
            <img src="/images/ball.webp" alt="كرة جلدية قديمة من حقبة الستينات" loading="lazy" decoding="async" width={640} height={640} className="rounded-3xl border-4 border-[#1565c0]/60 object-cover w-full" />
          </div>
        </div>
        </Reveal>
      </div>
    </section>
  );
}
