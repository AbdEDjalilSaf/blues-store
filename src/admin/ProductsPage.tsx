import { useState } from 'react';
import { MoreVertical, Plus, Search, Upload, X } from 'lucide-react';
import type { Product } from '../lib/api';
import { products as initialProducts } from '../lib/catalog';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name_ar: '',
    slug: '',
    team: '',
    year: '',
    description_ar: '',
    price: '',
    old_price: '',
    stock: '',
    category: 'منتخبات',
    is_active: true,
    image: '',
  });

  const filteredProducts = products.filter(
    (p) =>
      p.name_ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.team.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newProduct: Product = {
      id: editingProduct?.id || products.length + 1,
      name_ar: formData.name_ar,
      team: formData.team,
      year: Number(formData.year),
      era: Number(formData.year) >= 1960 && Number(formData.year) < 1970 ? 'الستينات' :
           Number(formData.year) >= 1970 && Number(formData.year) < 1980 ? 'السبعينات' :
           Number(formData.year) >= 1980 && Number(formData.year) < 1990 ? 'الثمانينات' : 'التسعينات',
      price: Number(formData.price),
      old_price: formData.old_price ? Number(formData.old_price) : undefined,
      image: formData.image || '/images/placeholder.webp',
      sizes: 'M,L,XL',
      condition: 'ممتاز',
      rarity: 'محدود',
      stock: Number(formData.stock),
      rating: 4.5,
      reviews_count: 0,
      description_ar: formData.description_ar,
      category: formData.category as 'منتخبات' | 'أندية',
      featured: false,
      brand: 'Adidas',
    };

    if (editingProduct) {
      setProducts(products.map((p) => (p.id === editingProduct.id ? newProduct : p)));
    } else {
      setProducts([newProduct, ...products]);
    }

    setShowForm(false);
    setEditingProduct(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name_ar: '',
      slug: '',
      team: '',
      year: '',
      description_ar: '',
      price: '',
      old_price: '',
      stock: '',
      category: 'منتخبات',
      is_active: true,
      image: '',
    });
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name_ar: product.name_ar,
      slug: product.name_ar.toLowerCase().replace(/\s+/g, '-'),
      team: product.team,
      year: String(product.year),
      description_ar: product.description_ar,
      price: String(product.price),
      old_price: product.old_price ? String(product.old_price) : '',
      stock: String(product.stock),
      category: product.category,
      is_active: true,
      image: product.image,
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-black text-2xl text-[#0f2f52]">المنتجات</h1>
          <p className="text-sm font-bold text-gray-500">إدارة مخزون المنتجات</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="w-full sm:w-auto bg-[#0f2f52] hover:bg-[#1565c0] text-white font-black px-4 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          <Plus size={18} />
          إنشاء منتج جديد
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="بحث المنتجات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 rounded-xl pl-4 pr-10 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#2f9de4]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-black text-gray-500 uppercase tracking-wider">
                  الاسم
                </th>
                <th className="px-6 py-3 text-right text-xs font-black text-gray-500 uppercase tracking-wider">
                  الرابط
                </th>
                <th className="px-6 py-3 text-right text-xs font-black text-gray-500 uppercase tracking-wider">
                  السنة
                </th>
                <th className="px-6 py-3 text-right text-xs font-black text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-black text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-all">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name_ar}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <div>
                        <div className="font-black text-sm text-[#0f2f52]">{product.name_ar}</div>
                        <div className="text-xs font-bold text-gray-500">{product.team}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-600">
                    {product.name_ar.toLowerCase().replace(/\s+/g, '-')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-600">
                    {product.year}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-green-100 text-green-700">
                      نشط
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                        <MoreVertical size={18} className="text-gray-600" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-200 py-2 hidden group-hover:block">
                        <button
                          onClick={() => handleEdit(product)}
                          className="w-full px-4 py-2 text-right text-sm font-bold text-gray-700 hover:bg-gray-50"
                        >
                          تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="w-full px-4 py-2 text-right text-sm font-bold text-red-600 hover:bg-red-50"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="font-black text-xl text-[#0f2f52]">
                {editingProduct ? 'تعديل المنتج' : 'إنشاء منتج جديد'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-black text-[#0f2f52] mb-1.5">الاسم</label>
                  <input
                    type="text"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4]"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-black text-[#0f2f52] mb-1.5">الرابط</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-[#0f2f52] mb-1.5">الفريق</label>
                  <input
                    type="text"
                    value={formData.team}
                    onChange={(e) => setFormData({ ...formData, team: e.target.value })}
                    className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-[#0f2f52] mb-1.5">السنة</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4]"
                    required
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-black text-[#0f2f52] mb-1.5">الوصف</label>
                  <textarea
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    rows={3}
                    className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4] resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-[#0f2f52] mb-1.5">السعر (دج)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-[#0f2f52] mb-1.5">السعر القديم</label>
                  <input
                    type="number"
                    value={formData.old_price}
                    onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
                    className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-[#0f2f52] mb-1.5">المخزون</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-[#0f2f52] mb-1.5">الفئة</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4]"
                  >
                    <option value="منتخبات">منتخبات</option>
                    <option value="أندية">أندية</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-black text-[#0f2f52] mb-1.5">رابط الصورة</label>
                  <input
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/images/jersey-name.webp"
                    className="w-full bg-gray-100 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:border-[#2f9de4]"
                  />
                </div>

                <div className="col-span-2 flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-5 h-5 accent-[#0f2f52]"
                    />
                    <span className="text-sm font-black text-[#0f2f52]">نشط</span>
                  </label>
                </div>

                <div className="col-span-2">
                  <button
                    type="button"
                    className="w-full bg-gray-100 hover:bg-gray-200 text-[#0f2f52] font-black py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Upload size={18} />
                    رفع الصور
                  </button>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#0f2f52] font-black py-3 rounded-xl transition-all"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#0f2f52] hover:bg-[#1565c0] text-white font-black py-3 rounded-xl transition-all"
                >
                  {editingProduct ? 'تحديث المنتج' : 'إنشاء المنتج'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
