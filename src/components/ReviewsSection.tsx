import { useState } from 'react';
import { Quote, Star } from 'lucide-react';
import type { Review } from '../lib/api';
import { loadReviews } from '../lib/catalog';
import Reveal from './Reveal';

export default function ReviewsSection() {
  const [reviews] = useState<Review[]>(() => loadReviews().slice(0, 6));
  const loading = false;

  return (
    <section id="reviews" className="bg-[#f5f9fe] py-12 md:py-20 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-8">
          <div className="inline-block bg-[#2f9de4]/15 border border-[#2f9de4]/40 text-[#0f4c9c] font-black text-[12px] px-4 py-1.5 rounded-full mb-3">قالوا عنا 4.9 من 2,300+ تقييم</div>
          <h2 className="font-black text-3xl md:text-4xl text-[#0f2f52]">مقتنون يوثّقون تجربتهم</h2>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-40 bg-white rounded-3xl animate-pulse border-2 border-[#0f2f52]/8" />)}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center font-bold text-[#0f2f52]/50 bg-white rounded-3xl p-10 border-2 border-dashed border-[#0f2f52]/20">لا توجد تقييمات بعد — كن أول من يقيّم من صفحة أي قميص</div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reviews.map((r, i) => (
              <Reveal key={r.id} effect="fade-up" delay={Math.min(i, 5) * 70}>
              <figure className="bg-white rounded-3xl border-2 border-[#0f2f52]/10 p-5 hover:border-[#2f9de4] transition-all hover:-translate-y-1 h-full">
                <Quote size={26} className="text-[#2f9de4] mb-2" />
                <blockquote className="text-[14px] font-medium text-[#0f2f52]/75 leading-7 mb-3 line-clamp-4">“{r.text}”</blockquote>
                <figcaption className="flex items-center justify-between border-t border-dashed border-[#0f2f52]/15 pt-3">
                  <span className="font-black text-[13px] text-[#0f2f52]">{r.author}</span>
                  <span className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} className={i < r.rating ? 'fill-[#2f9de4] text-[#2f9de4]' : 'text-[#0f2f52]/20'} />)}</span>
                </figcaption>
              </figure>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
