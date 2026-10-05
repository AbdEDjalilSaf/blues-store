import { useEffect, useRef, useState } from 'react';
import { Menu, Search, ShoppingBag, X } from 'lucide-react';
import { useCart, useShopActions } from '../store/shop';
import Logo from './Logo';

const LINKS = [
  { label: 'الرئيسية', href: '#home' },
  { label: 'المتجر', href: '#shop' },
  { label: 'قصتنا', href: '#story' },
  { label: 'آراء العملاء', href: '#reviews' },
];

interface Props {
  onSearch: (q: string) => void;
}

export default function Navbar({ onSearch }: Props) {
  const { cartCount } = useCart();
  const { setCartOpen } = useShopActions();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const searchInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (showSearch) searchInput.current?.focus();
  }, [showSearch]);

  // Close the mobile drawer when the viewport grows past the lg breakpoint,
  // otherwise it stays open behind the desktop nav.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e: MediaQueryListEvent) => { if (e.matches) setOpen(false); };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const clear = () => { setQ(''); onSearch(''); };

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-[#f5f9fe]/95 text-[#0f2f52] text-center text-[12px] md:text-[13px] font-bold py-2 px-3 tracking-wide">
        شحن مجاني للطلبات فوق 10000 د.ج • توصيل متوفر 69 ولاية • شحن سريع 48 ساعة
      </div>

      <nav aria-label="التنقل الرئيسي" className="bg-[#0c418b] backdrop-blur-md border-b-2 border-[#0f2f52]/10 shadow-[0_2px_20px_rgba(18,41,28,.06)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-[72px] flex items-center justify-between gap-3">
          <a href="#home" className="flex items-center gap-2.5 shrink-0" aria-label="بلوز سيتي — الصفحة الرئيسية">
            <Logo />
          </a>

          <ul className="hidden lg:flex items-center gap-1">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href} className="px-4 py-2 rounded-full text-[15px] font-bold text-[#f5f9fe]/95 hover:bg-[#0f2f52] hover:text-[#f5f9fe] transition-all">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5 md:gap-2">
            <button
              onClick={() => setShowSearch((s) => !s)}
              aria-expanded={showSearch}
              aria-controls="site-search"
              aria-label="بحث"
              className="w-10 h-10 grid place-items-center rounded-full hover:bg-[#0f2f52]/20 text-[#f5f9fe]/95"
            >
              <Search size={20} />
            </button>

            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 bg-[#0f2f52] hover:bg-[#174a7c] text-[#f5f9fe] font-black text-sm rounded-full ps-4 pe-2 py-2 transition-all shadow-lg"
              aria-label={`السلة${cartCount > 0 ? ` (${cartCount} قطعة)` : ''}`}
            >
              <span className="hidden sm:inline">السلة</span>
              <span className="w-8 h-8 grid place-items-center rounded-full bg-[#2f9de4] text-[#0f2f52] relative">
                <ShoppingBag size={17} strokeWidth={2.4} />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -left-1.5 min-w-5 h-5 px-1 rounded-full bg-[#1565c0] text-white text-[11px] font-black grid place-items-center border-2 border-[#f5f9fe]">
                    {cartCount}
                  </span>
                )}
              </span>
            </button>

            <button
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label="القائمة"
              className="lg:hidden w-10 h-10 grid place-items-center rounded-full hover:bg-[#0f2f52]/20 text-[#f5f9fe]/95"
            >
              {open ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {showSearch && (
          <div id="site-search" className="border-t border-[#0f2f52]/10 px-4 py-3 bg-[#f5f9fe]">
            <form
              onSubmit={(e) => e.preventDefault()}
              role="search"
              className="max-w-3xl mx-auto flex items-center gap-2 bg-white rounded-full border-2 border-[#0f2f52]/15 focus-within:border-[#2f9de4] px-4 py-2.5"
            >
              <Search size={18} className="text-[#0f2f52]/50 shrink-0" />
              <input
                ref={searchInput}
                type="search"
                value={q}
                onChange={(e) => { setQ(e.target.value); onSearch(e.target.value); }}
                placeholder="ابحث عن فريق أو سنة… (مثال: البرازيل 1970)"
                aria-label="ابحث عن قميص"
                className="flex-1 bg-transparent outline-none text-sm font-bold text-[#0f2f52] placeholder:text-[#0f2f52]/40"
              />
              {q && (
                <button type="button" onClick={clear} className="text-xs font-black text-[#1565c0]">
                  مسح
                </button>
              )}
            </form>
          </div>
        )}

        {open && (
          <div id="mobile-nav" className="lg:hidden border-t border-[#0f2f52]/10 bg-[#f5f9fe] px-4 py-3">
            <ul className="grid gap-1">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a href={l.href} onClick={() => setOpen(false)} className="block px-4 py-3 rounded-xl font-black text-[#0f2f52] hover:bg-[#0f2f52] hover:text-[#f5f9fe] transition-all">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>
    </header>
  );
}