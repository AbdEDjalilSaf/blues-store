import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

interface Slide {
  image: string;
  srcSet?: string;
  alt: string;
  badge?: string;
  title: string;
  highlight: string;
  desc: string;
  cta: string;
  useCount: boolean;
  caption: string;
  captionSub: string;
}

const SLIDES: Slide[] = [
  {
    image: '/images/jersey-brazil.webp',
    srcSet: undefined,
    alt: 'قميص البرازيل 1970 الشهير الذي ارتدى بيليه — قطعة فينتاج أصلية موثّقة',
    badge: 'الأكثر طلباً',
    title: 'قميص البرازيل 1970',
    highlight: 'أسطورة بيليه',
    desc: 'نسخة موثّقة من قميص البرازيل في مونديال 1970 — مفحوصة ومصادق عليها مع شهادة أصالة.',
    cta: 'اكتشف القميص',
    useCount: false,
    caption: 'البرازيل 1970',
    captionSub: 'قميص بيليه الأسطوري',
  },
  {
    image: '/images/jersey-argentina.webp',
    srcSet: undefined,
    alt: 'قميص الأرجنتين 1986 الذهبي الذي قاد به مارادونا منتخبه للقب المونديال',
    badge: 'قطعة نادرة',
    title: 'قميص مارادونا الذهبي',
    highlight: 'مونديال 1986',
    desc: 'الأزرق والأبيض الأيقوني الذي قاد به مارادونا منتخبه للقب المونديال. قطعة لا تُعوَّض.',
    cta: 'اكتشف القميص',
    useCount: false,
    caption: 'الأرجنتين 1986',
    captionSub: 'قميص مارادونا الذهبي',
  },
  {
    image: '/images/hero-stadium.webp',
    srcSet: '/images/hero-stadium-768.webp 768w, /images/hero-stadium.webp 1280w',
    alt: 'متجر بلوز سيتي — أكثر من 12,000 قميص رياضي فينتاج موثّق قطعة بقطعة',
    title: 'أكثر من 12,000 قميص أصلي',
    highlight: 'موثّق قطعة قطعة',
    desc: 'متجر عربي متخصص في الأقمصة الرياضية الفينتاج من الستينات حتى التسعينات، مع فحص معتمد 21 نقطة.',
    cta: 'تسوّق التشكيلة',
    useCount: true,
    caption: '',
    captionSub: '',
  },
];

const AUTOPLAY_MS = 4000;

export default function Hero({ count }: { count: number }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const total = SLIDES.length;
  const sectionRef = useRef<HTMLElement | null>(null);

  // Stable interval: `active` is not a dependency, the tick is functional.
  // Autoplay also stops while the hero is off-screen or the tab is hidden,
  // which removes a permanent 250ms-wide timer + repaint from the main thread.
  useEffect(() => {
    if (paused) return;
    if (typeof window === 'undefined') return;

    let id: number | undefined;
    const start = () => {
      if (id !== undefined) return;
      id = window.setInterval(() => setActive((a) => (a + 1) % total), AUTOPLAY_MS);
    };
    const stop = () => {
      if (id === undefined) return;
      window.clearInterval(id);
      id = undefined;
    };

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver !== 'undefined' && sectionRef.current) {
      io = new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop()), {
        threshold: 0.25,
      });
      io.observe(sectionRef.current);
    } else {
      start();
    }

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
      io?.disconnect();
    };
  }, [paused, total]);

  const next = useCallback(() => setActive((a) => (a + 1) % total), [total]);
  const prev = useCallback(() => setActive((a) => (a - 1 + total) % total), [total]);

  // Only the active slide is mounted, so the browser downloads one hero image
  // at a time instead of all three (the stadium plate alone is ~185 KB).
  const s = SLIDES[active];
  const Heading = active === 0 ? 'h1' : 'h2';

  return (
    <section
      ref={sectionRef}
      id="home"
      role="region"
      aria-roledescription="carousel"
      aria-label="إعلانات المتجر"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="relative overflow-hidden bg-[#0f2f52] text-[#f5f9fe] min-h-[540px] sm:min-h-[600px] md:min-h-[640px]"
    >
      <div key={active} role="group" aria-roledescription="slide" className="absolute inset-0 animate-[heroSlideIn_.9s_cubic-bezier(.22,.61,.36,1)_both]">
        {s.srcSet ? (
          <picture>
            <source srcSet={s.srcSet} sizes="100vw" type="image/webp" />
            <img
              src={s.image}
              alt={s.alt}
              width={1280}
              height={714}
              loading="eager"
              decoding="async"
              fetchPriority={active === 0 ? 'high' : 'auto'}
              className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
          </picture>
        ) : (
          <img
            src={s.image}
            alt={s.alt}
            width={640}
            height={640}
            loading="eager"
            decoding="async"
            fetchPriority={active === 0 ? 'high' : 'auto'}
            className="absolute inset-0 w-full h-full object-cover opacity-50"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-l from-[#0f2f52]/70 via-[#0f2f52]/40 to-[#0f2f52]/70" />

        <div className="relative h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 md:px-6 w-full pt-14 pb-16">
            {s.badge && (
              <div className="inline-flex items-center gap-2 bg-[#f5f9fe]/10 border border-[#bfe1f8]/40 rounded-full px-4 py-1.5 text-[12px] md:text-[13px] font-black text-[#bfe1f8] mb-5 backdrop-blur">
                <span className="w-2 h-2 rounded-full bg-[#5ab0f0] animate-pulse" />
                {s.badge}
              </div>
            )}
            <Heading className="font-black text-4xl sm:text-5xl lg:text-[60px] leading-[1.15] mb-4 max-w-2xl">
              {s.title}
              <br />
              <span className="text-[#bfe1f8]">{s.highlight}</span>
            </Heading>
            <p className="text-[#f5f9fe]/80 text-base md:text-lg leading-8 font-medium max-w-xl mb-7">
              {s.desc}
            </p>
            <div className="flex flex-wrap gap-3 mb-8">
              <a href="#shop" className="bg-[#2f9de4] hover:bg-[#bfe1f8] text-[#0f2f52] font-black px-7 py-3.5 rounded-full text-[15px] shadow-[0_10px_30px_rgba(47,157,228,.35)] transition-all hover:-translate-y-0.5">
                {s.useCount ? `${s.cta} (${count})` : s.cta}
              </a>
              <a href="#story" className="border-2 border-[#f5f9fe]/30 hover:border-[#bfe1f8] hover:text-[#bfe1f8] font-black px-7 py-3.5 rounded-full text-[15px] transition-all">
                قصتنا
              </a>
            </div>

            {s.caption && (
              <div className="flex items-center gap-2 bg-[#f5f9fe] text-[#0f2f52] rounded-2xl px-4 py-3 shadow-xl w-fit -rotate-1">
                <ShieldCheck size={22} className="text-[#1d6fd1] shrink-0" />
                <div className="text-xs font-black">
                  {s.caption}
                  <div className="font-bold text-[#0f2f52]/60">{s.captionSub}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={prev}
        aria-label="الشريحة السابقة"
        className="absolute top-1/2 -translate-y-1/2 right-3 md:right-5 z-20 w-11 h-11 grid place-items-center rounded-full bg-[#f5f9fe]/10 border border-[#f5f9fe]/30 hover:bg-[#2f9de4] hover:text-[#0f2f52] hover:border-[#2f9de4] text-[#f5f9fe] backdrop-blur transition-all"
      >
        <ChevronRight size={22} />
      </button>
      <button
        onClick={next}
        aria-label="الشريحة التالية"
        className="absolute top-1/2 -translate-y-1/2 left-3 md:left-5 z-20 w-11 h-11 grid place-items-center rounded-full bg-[#f5f9fe]/10 border border-[#f5f9fe]/30 hover:bg-[#2f9de4] hover:text-[#0f2f52] hover:border-[#2f9de4] text-[#f5f9fe] backdrop-blur transition-all"
      >
        <ChevronLeft size={22} />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.alt}
            onClick={() => setActive(i)}
            aria-label={`الانتقال للشريحة ${i + 1}`}
            aria-current={i === active}
            className={`h-2.5 rounded-full transition-all duration-300 ${i === active ? 'w-8 bg-[#2f9de4]' : 'w-2.5 bg-[#f5f9fe]/40 hover:bg-[#f5f9fe]/70'}`}
          />
        ))}
      </div>
    </section>
  );
}