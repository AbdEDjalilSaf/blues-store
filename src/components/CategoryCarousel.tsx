import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  { id: 1, title: 'LDC 2026/27', pieces: 10116, image: '/images/jersey-brazil.webp', alt: 'قميص البرازيل الفينتاج ضمن فئة الأكثر بحثاً' },
  { id: 2, title: 'PREMIER LEAGUE', pieces: 8538, image: '/images/jersey-liverpool.webp', alt: 'قميص ليفربول الفينتاج ضمن فئة الدوري الإنجليزي' },
  { id: 3, title: 'LIGUE 1', pieces: 13407, image: '/images/jersey-milan.webp', alt: 'قميص ميلان الفينتاج ضمن فئة الدوري الإيطالي' },
  { id: 4, title: 'MYSTERY BOXES', pieces: 5, image: '/images/jersey-barca.webp', alt: 'قميص برشلونة الفينتاج ضمن فئة صناديق الغموض' },
  { id: 5, title: 'PSG THOMSO', pieces: 1442, image: '/images/jersey-france.webp', alt: 'قميص فرنسا الفينتاج ضمن فئة الأكثر طلباً' },
];

/** How close to either edge before the previous/next buttons appear. */
const EDGE_PX = 8;

export default function CategoryCarousel() {
  const track = useRef<HTMLUListElement | null>(null);
  const frame = useRef(0);
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false });
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [dragging, setDragging] = useState(false);

  const syncEdges = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= EDGE_PX);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - EDGE_PX - 1);
  }, []);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    syncEdges();
    el.addEventListener('scroll', syncEdges, { passive: true });
    window.addEventListener('resize', syncEdges);
    return () => {
      el.removeEventListener('scroll', syncEdges);
      window.removeEventListener('resize', syncEdges);
    };
  }, [syncEdges]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const page = useCallback((dir: -1 | 1) => {
    const el = track.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const amount = (card?.offsetWidth ?? 280) + 16;
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  }, []);

  const onKeyDown = (e: React.KeyboardEvent) => {
    // The track is a horizontally scrollable list, so it must be focusable and
    // respond to arrows — otherwise it is keyboard-inaccessible.
    if (e.key === 'ArrowLeft') { e.preventDefault(); page(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); page(1); }
  };

  const onPointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
    if (e.pointerType === 'touch') return; // native touch scrolling already works
    const el = e.currentTarget;
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false };
    setDragging(true);
    el.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 3) drag.current.moved = true;
    e.preventDefault();
    // Write straight to the DOM inside a rAF: the previous version pushed a
    // `setState` per mousemove, re-rendering the whole carousel at 60-120 Hz.
    const left = drag.current.startScroll - dx * 1.6;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const el = track.current;
      if (el) el.scrollLeft = left;
    });
  };

  const endDrag = (e: React.PointerEvent<HTMLUListElement>) => {
    if (!drag.current.active) return;
    drag.current.active = false;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  return (
    <section className="bg-[#f5f9fe] py-8 md:py-12" aria-labelledby="categories-heading">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h2 id="categories-heading" className="font-black text-xl md:text-2xl text-[#0f2f52] mb-6">
          الأكثر بحثاً
        </h2>

        <div className="relative">
          <button
            onClick={() => page(-1)}
            disabled={atStart}
            aria-label="الفئات السابقة"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#0f2f52] text-[#f5f9fe] flex items-center justify-center hover:bg-[#2f9de4] transition-colors disabled:opacity-0 disabled:pointer-events-none shadow-lg hidden md:flex"
          >
            <ChevronLeft size={20} />
          </button>

          <ul
            ref={track}
            tabIndex={0}
            role="list"
            aria-label="فئات الأكثر بحثاً — استخدم الأسهم للتنقل"
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            className={`flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] select-none ${
              dragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-x pan-y' }}
          >
            {CATEGORIES.map((category) => (
              <li key={category.id} className="flex-shrink-0 w-[200px] sm:w-[240px] md:w-[280px] snap-start group">
                <a href="#shop" className="block relative h-32 sm:h-40 md:h-48 rounded-2xl overflow-hidden bg-[#0f2f52]">
                  <img
                    src={category.image}
                    alt={category.alt}
                    loading="lazy"
                    decoding="async"
                    width={640}
                    height={640}
                    draggable={false}
                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f2f52]/90 via-[#0f2f52]/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="font-black text-white text-lg md:text-xl mb-1">{category.title}</h3>
                    <p className="text-[#bfe1f8] text-xs md:text-sm font-bold">
                      {category.pieces.toLocaleString('en-US')} PIECES
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>

          <button
            onClick={() => page(1)}
            disabled={atEnd}
            aria-label="الفئات التالية"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#0f2f52] text-[#f5f9fe] flex items-center justify-center hover:bg-[#2f9de4] transition-colors disabled:opacity-0 disabled:pointer-events-none shadow-lg hidden md:flex"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}