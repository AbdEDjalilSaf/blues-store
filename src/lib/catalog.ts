import type { Order, Product, Review } from './api';

export const products: Product[] = [
  {
    id: 1,
    name_ar: 'قميص البرازيل 1970 — بيليه',
    team: 'البرازيل',
    year: 1970,
    era: 'السبعينات',
    price: 1299,
    old_price: 1799,
    image: '/images/jersey-brazil.webp',
    sizes: 'M,L,XL',
    condition: 'ممتاز',
    rarity: 'نادر جداً',
    stock: 2,
    rating: 4.9,
    reviews_count: 87,
    description_ar: 'نسخة موثّقة من قميص البرازيل الأسطوري في مونديال 1970 — الفريق الذي يعده كثيرون الأفضل في التاريخ. شعار المونديال مطرّز بدقة، والقماش الأصلي محفوظ بحالة ممتازة مع شهادة أصالة.',
    category: 'منتخبات',
    featured: true,
    badge: 'الأكثر طلباً',
    brand: 'Adidas',
  },
  {
    id: 2,
    name_ar: 'قميص الأرجنتين 1986 — مارادونا',
    team: 'الأرجنتين',
    year: 1986,
    era: 'الثمانينات',
    price: 1499,
    old_price: 1999,
    image: '/images/jersey-argentina.webp',
    sizes: 'L,XL',
    condition: 'ممتاز',
    rarity: 'نادر جداً',
    stock: 1,
    rating: 5.0,
    reviews_count: 64,
    description_ar: 'القميص الأزرق والأبيض الأيقوني الذي قاد به مارادونا منتخبه للقب مونديال 1986. نسخة مفحوصة ومصادق عليها من الفحص المعتمد، قطعة محورية لأي مجموعة فينتاج.',
    category: 'منتخبات',
    featured: true,
    badge: 'قطعة نادرة',
    brand: 'Le Coq Sportif',
  },
  {
    id: 3,
    name_ar: 'قميص سانتوس 1962 — عصر بيليه',
    team: 'سانتوس',
    year: 1962,
    era: 'الستينات',
    price: 1899,
    image: '/images/jersey-santos.webp',
    sizes: 'M',
    condition: 'جيد جداً',
    rarity: 'أيقوني',
    stock: 1,
    rating: 4.8,
    reviews_count: 41,
    description_ar: 'قميص سانتوس البرازيلي من عصر الهيمنة الذهبية مع الأسطورة بيليه، أيقونة الأندية في الستينات. أبيض نقي بلمسات تقليدية، قطعة نادرة تبحث عنها المجموعات العالمية.',
    category: 'أندية',
    featured: true,
    badge: 'أيقوني',
  },
  {
    id: 4,
    name_ar: 'قميص أياكس 1971 — جيل الأبطال الثلاثة',
    team: 'أياكس',
    year: 1971,
    era: 'السبعينات',
    price: 1099,
    old_price: 1399,
    image: '/images/jersey-ajax.webp',
    sizes: 'M,L',
    condition: 'ممتاز',
    rarity: 'نادر',
    stock: 3,
    rating: 4.7,
    reviews_count: 28,
    description_ar: 'قميص أياكس أمستردام من انطلاقة حقبة الكؤوس الأوروبية الثلاثة المتتالية مع كرويف. الطبع الأحمر والنادي الشهير في الواجهة، حالة ممتازة مع فحص معتمد.',
    category: 'أندية',
    featured: false,
    brand: 'Adidas',
  },
  {
    id: 5,
    name_ar: 'قميص إيطاليا 1982 — الأزوري اللاتسيالي',
    team: 'إيطاليا',
    year: 1982,
    era: 'الثمانينات',
    price: 1199,
    image: '/images/jersey-italy.webp',
    sizes: 'M,L,XL',
    condition: 'ممتاز',
    rarity: 'نادر',
    stock: 4,
    rating: 4.8,
    reviews_count: 35,
    description_ar: 'قميص الأتزوري من مشوار إيطاليا نحو لقب مونديال إسبانيا 1982. الأزرق الملكي الكلاسيكي وطبع 4 نجوم ذهبية، قطعة محبوبة لدى جامعي المنتخبات.',
    category: 'منتخبات',
    featured: false,
    badge: 'الأكثر طلباً',
  },
  {
    id: 6,
    name_ar: 'قميص البرتقالة هولندا 1988',
    team: 'هولندا',
    year: 1988,
    era: 'الثمانينات',
    price: 999,
    old_price: 1249,
    image: '/images/jersey-holland.webp',
    sizes: 'M,L',
    condition: 'ممتاز',
    rarity: 'محدود',
    stock: 5,
    rating: 4.6,
    reviews_count: 19,
    description_ar: 'قميص هولندا البرتقالي الشهير من تتويجها بكأس أمم أوروبا 1988 بقيادة فان باستن. لون برتقالي مشرق وطبع الاتحاد الأوروبي، بحالة ممتازة وشهادة فحص.',
    category: 'منتخبات',
    featured: false,
    brand: 'Adidas',
  },
  {
    id: 7,
    name_ar: 'قميص ليفربول — عصر الأساطير',
    team: 'ليفربول',
    year: 1984,
    era: 'الثمانينات',
    price: 899,
    image: '/images/jersey-liverpool.webp',
    sizes: 'S,M,L',
    condition: 'جيد جداً',
    rarity: 'محدود',
    stock: 3,
    rating: 4.7,
    reviews_count: 22,
    description_ar: 'قميص ليفربول الأحمر من فترة هيمنة الريدز أوروبياً في الثمانينات. الأحمر العنابي الكلاسيكي مع شعار الطائر الأسطوري، قطعة ملهمة لعشاق الأنفيلد.',
    category: 'أندية',
    featured: false,
  },
  {
    id: 8,
    name_ar: 'قميص ميلان 1990 — عائلة أسطورة',
    team: 'ميلان',
    year: 1990,
    era: 'التسعينات',
    price: 1049,
    old_price: 1299,
    image: '/images/jersey-milan.webp',
    sizes: 'M,L',
    condition: 'ممتاز',
    rarity: 'نادر',
    stock: 2,
    rating: 4.9,
    reviews_count: 48,
    description_ar: 'قميص ميلان الأحمر والأسود من بداية عقد التسعينات الذهبي حين أحكم الروسونيري قبضته على أوروبا. الألوان المخططة المميزة بحالة ممتازة، قطعة أساسية لأي جامع.',
    category: 'أندية',
    featured: false,
    badge: 'قطعة نادرة',
  },
  {
    id: 9,
    name_ar: 'قميص برشلونة — حقبة الأحلام',
    team: 'برشلونة',
    year: 1992,
    era: 'التسعينات',
    price: 949,
    image: '/images/jersey-barca.webp',
    sizes: 'M,L,XL',
    condition: 'جيد جداً',
    rarity: 'محدود',
    stock: 6,
    rating: 4.5,
    reviews_count: 31,
    description_ar: 'قميص برشلونة من عصر فريق الأحلام والحملات الأوروبية وصولاً لأول كأس أوروبية للنادي في 1992. الكلاسيكية الكتالونية بخطوطها الحمراء والزرقاء، بحالة جيدة جداً.',
    category: 'أندية',
    featured: false,
  },
  {
    id: 10,
    name_ar: 'قميص ألمانيا 1990 — الجيل الذهبي',
    team: 'ألمانيا',
    year: 1990,
    era: 'التسعينات',
    price: 1099,
    old_price: 1349,
    image: '/images/jersey-germany.webp',
    sizes: 'M,L',
    condition: 'ممتاز',
    rarity: 'نادر',
    stock: 2,
    rating: 4.8,
    reviews_count: 26,
    description_ar: 'قميص الماكينات الألماني من تتويجها بلقب مونديال إيطاليا 1990 على يد بيكينباور. الأبيض بلمسات سوداء مميزة، قطعة محفوظة بحالة ممتازة مع شهادة أصالة وتسليم موثّق.',
    category: 'منتخبات',
    featured: false,
  },
  {
    id: 11,
    name_ar: 'قميص فرنسا 1998 — النجوم على الصدر',
    team: 'فرنسا',
    year: 1998,
    era: 'التسعينات',
    price: 899,
    image: '/images/jersey-france.webp',
    sizes: 'M,L,XL',
    condition: 'بكر مع العلامات',
    rarity: 'محدود',
    stock: 7,
    rating: 4.6,
    reviews_count: 33,
    description_ar: 'قميص الديوك بيضوي الشارة من نسخة مونديال فرنسا 1998 الذي تُوّجت به منتخبها على أرضه. نجوم 98 على الصدر، قطعة بكر مع العلامات الأصلية تقريباً.',
    category: 'منتخبات',
    featured: false,
    brand: 'Adidas',
  },
  {
    id: 12,
    name_ar: 'قميص اسكتلندا 1982 — الأسطورة الزرقاء',
    team: 'اسكتلندا',
    year: 1982,
    era: 'الثمانينات',
    price: 749,
    image: '/images/jersey-scotland.webp',
    sizes: 'M,L',
    condition: 'جيد جداً',
    rarity: 'محدود',
    stock: 5,
    rating: 4.4,
    reviews_count: 12,
    description_ar: 'قميص اسكتلندا الأزرق من مشاركتها في مونديال 1982 مع شارة الاتحاد الاسكتلندي المرسومة يدوياً على الصدر. قطعة مثيرة للاهتمام لعشاق المنتخبات العريقة.',
    category: 'منتخبات',
    featured: false,
  },
];

const baseReviews: Review[] = [
  { id: 9001, product_id: 1, author: 'عبدالرحمن العتيبي', rating: 5, text: 'وصل القميص والتغليف فخم جداً، والفحص مع الشهادة عطاني ثقة كاملة بالأصالة. القطعة أجمل من الصور.', created_at: '2026-08-12T10:00:00.000Z' },
  { id: 9002, product_id: 2, author: 'خالد الدوسري', rating: 5, text: 'قميص مارادونا أسطوري بكل معنى الكلمة. اللون والشعار مطابقين للقطعات الأصلية، وأعجبني سرعة التوصيل.', created_at: '2026-07-28T09:30:00.000Z' },
  { id: 9003, product_id: 1, author: 'فهد القحطاني', rating: 5, text: 'ثاني مرة أطلب من المتجر، والجودة ثابتة. وثيقة الأصالة توضعت بعناية والمقاس مضبوط.', created_at: '2026-07-15T14:20:00.000Z' },
  { id: 9004, product_id: 8, author: 'سامي الغامدي', rating: 4, text: 'قميص ميلان وصل بحالة ممتازة كما في الوصف. تأخر التوصيل يوم واحد فقط، عدا ذلك تجربة رائعة.', created_at: '2026-06-30T11:45:00.000Z' },
  { id: 9005, product_id: 3, author: 'نورة الشمري', rating: 5, text: 'قطعة نادرة جداً، شكراً لفريق البحث عن القطع. وصلتني مع بطاقة تحكي قصة القميص، تجربة مشتراة ما أتخيلها بأحسن من كذا.', created_at: '2026-06-18T16:05:00.000Z' },
  { id: 9006, product_id: 10, author: 'عمر الحارثي', rating: 5, text: 'الشهادة والفحص 21 نقطة حقيقيين، قارنت القميص مع قطعة موثقة عندي وطابق تماماً. أنصح بهم لكل المتخصصين.', created_at: '2026-05-22T13:10:00.000Z' },
];

const LS_ORDERS = 'zaman-orders';
const LS_REVIEWS = 'zaman-reviews';
const LS_SUBSCRIBERS = 'zaman-subscribers';

function read<T>(key: string): T[] {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, value: T[]): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

export function getOrdersByPhone(phone: string): Order[] {
  const clean = String(phone).replace(/[\s-]/g, '');
  return read<Order>(LS_ORDERS)
    .filter((o) => String(o.phone).replace(/[\s-]/g, '') === clean)
    .sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
}

export function saveOrder(input: Omit<Order, 'id' | 'status' | 'created_at'>): Order {
  const orders = read<Order>(LS_ORDERS);
  const id = orders.reduce((m, o) => Math.max(m, Number(o.id) || 0), 0) + 1;
  const order: Order = { ...input, id, status: 'جديد', created_at: new Date().toISOString() };
  write(LS_ORDERS, [order, ...orders]);
  return order;
}

export function loadReviews(productId?: number): Review[] {
  const user = read<Review>(LS_REVIEWS);
  const merged = [...user, ...baseReviews].sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  return productId ? merged.filter((r) => r.product_id === productId) : merged;
}

export function saveReview(input: Omit<Review, 'id' | 'created_at'>): Review {
  const review: Review = { ...input, id: Date.now(), created_at: new Date().toISOString() };
  write(LS_REVIEWS, [...read<Review>(LS_REVIEWS), review]);
  return review;
}

export function getSubscriberCount(): number {
  return read<string>(LS_SUBSCRIBERS).length;
}

export function subscribe(email: string): { ok: boolean; message: string } {
  const subs = read<string>(LS_SUBSCRIBERS);
  if (subs.includes(email)) return { ok: true, message: 'أنت مشترك بالفعل، أهلاً بعودتك!' };
  write(LS_SUBSCRIBERS, [...subs, email]);
  return { ok: true, message: 'تم الاشتراك بنجاح! كود خصمك: ZAMAN10' };
}