import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  {
    id: 1,
    title: 'LDC 2026/27',
    pieces: 10116,
    image: '/images/jersey-brazil.webp',
  },
  {
    id: 2,
    title: 'PREMIER LEAGUE',
    pieces: 8538,
    image: '/images/jersey-liverpool.webp',
  },
  {
    id: 3,
    title: 'LIGUE 1',
    pieces: 13407,
    image: '/images/jersey-milan.webp',
  },
  {
    id: 4,
    title: 'MYSTERY BOXES',
    pieces: 5,
    image: '/images/jersey-barca.webp',
  },
  {
    id: 5,
    title: 'PSG THOMSO',
    pieces: 1442,
    image: '/images/jersey-france.webp',
  },
];

export default function CategoryCarousel() {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerId = 'category-carousel';

  const scroll = (direction: 'left' | 'right') => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const cardWidth = container.querySelector('.flex-shrink-0')?.clientWidth || 280;
    const gap = 16;
    const scrollAmount = cardWidth + gap;
    const newPosition = direction === 'left'
      ? scrollPosition - scrollAmount
      : scrollPosition + scrollAmount;

    container.scrollTo({
      left: newPosition,
      behavior: 'smooth',
    });
    setScrollPosition(newPosition);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (e.currentTarget as HTMLElement).offsetLeft);
    setScrollLeft((e.currentTarget as HTMLElement).scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - (e.currentTarget as HTMLElement).offsetLeft;
    const walk = (x - startX) * 2;
    (e.currentTarget as HTMLElement).scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
  };

  return (
    <section className="bg-[#f5f9fe] py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <h2 className="font-black text-xl md:text-2xl text-[#0f2f52] mb-6">
          الأكثر بحثاً
        </h2>

        <div className="relative">
          <button
            onClick={() => scroll('left')}
            aria-label="Previous categories"
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#0f2f52] text-[#f5f9fe] flex items-center justify-center hover:bg-[#2f9de4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hidden md:flex"
          >
            <ChevronLeft size={20} />
          </button>

          <div
            id={containerId}
            className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide cursor-grab active:cursor-grabbing"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
          >
          {CATEGORIES.map((category) => (
            <div
              key={category.id}
              className="flex-shrink-0 w-[200px] sm:w-[240px] md:w-[280px] snap-start group cursor-pointer"
            >
              <div className="relative h-32 sm:h-40 md:h-48 rounded-2xl overflow-hidden bg-[#0f2f52]">
                <img
                  src={category.image}
                  alt={category.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0f2f52]/90 via-[#0f2f52]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="font-black text-white text-lg md:text-xl mb-1">
                    {category.title}
                  </h3>
                  <p className="text-[#bfe1f8] text-xs md:text-sm font-bold">
                    {category.pieces.toLocaleString()} PIECES
                  </p>
                </div>
              </div>
            </div>
          ))}
          </div>

          <button
            onClick={() => scroll('right')}
            aria-label="Next categories"
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#0f2f52] text-[#f5f9fe] flex items-center justify-center hover:bg-[#2f9de4] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hidden md:flex"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
