import { useState } from 'react';
import { Search } from 'lucide-react';
// import { useShop } from '../store/ShopContext';
import Logo from './Logo';

const LINKS = [
  { label: 'الرئيسية', href: '#home' },
  { label: 'المتجر', href: '#shop' },
  { label: 'قصتنا', href: '#story' },
  { label: 'آراء العملاء', href: '#reviews' },
];

export default function Navbar({ onSearch }: { onSearch: (q: string) => void }) {
  // const { cartCount, wishlist, setCartOpen } = useShop();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-[#f5f9fe]/95  text-[#0f2f52] text-center text-[12px] md:text-[13px] font-bold py-2 px-3 tracking-wide">
        شحن مجاني للطلبات فوق 10000 د.ج   •  توصيل متوفر 69 ولاية   •  شحن سريع 48 ساعة 
      </div> 
      <nav className="bg-[#0c418b] backdrop-blur-md border-b-2 border-[#0f2f52]/10 shadow-[0_2px_20px_rgba(18,41,28,.06)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 md:h-[72px] flex items-center justify-between gap-3">
          <a href="#home" className="flex  items-center gap-2.5 shrink-0">
            <Logo />
            {/* <span className="leading-tight">
              <span className="block font-black text-lg md:text-xl text-[#f5f9fe]/95">Blues Store</span>
            </span> */}
          </a>
          <div className="hidden lg:flex items-center gap-1">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="px-4 py-2 rounded-full text-[15px] font-bold text-[#f5f9fe]/95 hover:bg-[#0f2f52] hover:text-[#f5f9fe] transition-all">{l.label}</a>
            ))}
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <button onClick={() => setShowSearch((s) => !s)} className="w-10 h-10 grid place-items-center  rounded-full hover:bg-[#0f2f52]/10 text-[#f5f9fe]/95" aria-label="بحث">
              <Search size={20} />
            </button>
            {/* <a href="#shop" className="relative w-10 h-10 hidden sm:grid place-items-center rounded-full hover:bg-[#0f2f52]/10 text-[#0f2f52]" aria-label="المفضلة">
              <Heart size={20} />
              {wishlist.length > 0 && <span className="absolute -top-0.5 -left-0.5 min-w-5 h-5 px-1 rounded-full bg-[#1565c0] text-white text-[11px] font-black grid place-items-center">{wishlist.length}</span>}
            </a> */}
            {/* <button onClick={() => setCartOpen(true)} className="relative flex items-center gap-2 bg-[#0f2f52] hover:bg-[#174a7c] text-[#f5f9fe] font-black text-sm rounded-full ps-4 pe-2 py-2 transition-all shadow-lg" aria-label="السلة">
              <span className="hidden sm:inline">السلة</span>
              <span className="w-8 h-8 grid place-items-center rounded-full bg-[#2f9de4] text-[#0f2f52] relative">
                <ShoppingBag size={17} strokeWidth={2.4} />
                {cartCount > 0 && <span className="absolute -top-1.5 -left-1.5 min-w-5 h-5 px-1 rounded-full bg-[#1565c0] text-white text-[11px] font-black grid place-items-center border-2 border-[#f5f9fe]">{cartCount}</span>}
              </span>
            </button>
            <button onClick={() => setOpen((o) => !o)} className="lg:hidden w-10 h-10 grid place-items-center rounded-full hover:bg-[#0f2f52]/10 text-[#0f2f52]" aria-label="القائمة">
              {open ? <X size={22} /> : <Menu size={22} />}
            </button> */}
          </div>
        </div>
        {showSearch && (
          <div className="border-t border-[#0f2f52]/10 px-4 py-3 bg-[#f5f9fe]">
            <div className="max-w-3xl mx-auto flex items-center gap-2 bg-white rounded-full border-2 border-[#0f2f52]/15 focus-within:border-[#2f9de4] px-4 py-2.5">
              <Search size={18} className="text-[#0f2f52]/50 shrink-0" />
              <input value={q} onChange={(e) => { setQ(e.target.value); onSearch(e.target.value); }} placeholder="ابحث عن فريق أو سنة… (مثال: البرازيل 1970)" className="flex-1 bg-transparent outline-none text-sm font-bold text-[#0f2f52] placeholder:text-[#0f2f52]/40" />
              {q && <button onClick={() => { setQ(''); onSearch(''); }} className="text-xs font-black text-[#1565c0]">مسح</button>}
            </div>
          </div>
        )}
        {open && (
          <div className="lg:hidden border-t border-[#0f2f52]/10 bg-[#f5f9fe] px-4 py-3 grid gap-1">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl font-black text-[#0f2f52] hover:bg-[#0f2f52] hover:text-[#f5f9fe] transition-all">{l.label}</a>
            ))}
          </div>
        )}
      </nav>
    </header>
  );
}
