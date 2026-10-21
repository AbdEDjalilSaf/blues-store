import { Suspense, lazy, memo, useCallback, useEffect, useState } from 'react';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import { prefetchAdminProducts } from './productCache';

/**
 * Every admin page is its own chunk. The shell (login + layout + nav) is all
 * a first-time visitor downloads; page code arrives only when opened, so the
 * initial /admin paint stays small and cached across visits.
 */
const DashboardPage = lazy(() => import('./DashboardPage'));
const OrdersPage = lazy(() => import('./OrdersPage'));
const ProductsPage = lazy(() => import('./ProductsPage'));
const CustomersPage = lazy(() => import('./CustomersPage'));
const SettingsPage = lazy(() => import('./SettingsPage'));

const MemoAdminLayout = memo(AdminLayout);

const PAGE_TITLES: Record<string, string> = {
  dashboard: 'لوحة التحكم',
  orders: 'الطلبات',
  products: 'المنتجات',
  customers: 'العملاء',
  settings: 'الإعدادات',
};

/** Lightweight fallback while a page chunk downloads; avoids layout shift. */
function AdminPageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">جارٍ تحميل الصفحة…</span>
      <div className="space-y-2">
        <div className="h-7 w-40 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-4 w-52 rounded-full bg-gray-200 animate-pulse" />
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-3">
        <div className="h-4 w-1/3 rounded-full bg-gray-200 animate-pulse" />
        <div className="h-24 w-full rounded-xl bg-gray-100 animate-pulse" />
      </div>
    </div>
  );
}

/**
 * SEO: the admin area is private, so it must never be indexed.
 * - The build emits a dedicated `dist/admin/index.html` with `noindex`
 *   (see scripts/seo-prerender.mjs) and vercel.json sends `X-Robots-Tag`.
 * - This runtime pass covers the dev server and any host that falls back to
 *   the shared storefront shell: it rewrites the title per page and pins a
 *   `noindex, nofollow` robots meta so even a JS-executing crawler obeys it.
 */
function useAdminPageMeta(page: string): void {
  useEffect(() => {
    const title = PAGE_TITLES[page] ?? PAGE_TITLES.dashboard;
    document.title = `${title} | إدارة بلوز سيتي`;

    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement('meta');
      robots.name = 'robots';
      document.head.appendChild(robots);
    }
    robots.content = 'noindex, nofollow, noarchive';
  }, [page]);
}

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('admin-auths') === 'true'
  );
  const [currentPage, setCurrentPage] = useState('dashboard');

  useAdminPageMeta(isAuthenticated ? currentPage : 'login');

  // Warm the products request during idle time so the (lazy) Products page
  // usually has its data ready the moment its chunk lands.
  useEffect(() => {
    if (!isAuthenticated) return;
    const id = window.requestIdleCallback(() => prefetchAdminProducts(), { timeout: 3000 });
    return () => window.cancelIdleCallback(id);
  }, [isAuthenticated]);

  const handleLogin = useCallback(() => setIsAuthenticated(true), []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('admin-auths');
    setIsAuthenticated(false);
  }, []);

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'orders':
        return <OrdersPage />;
      case 'products':
        return <ProductsPage />;
      case 'customers':
        return <CustomersPage />;
      case 'settings':
        return <SettingsPage />;
      case 'dashboard':
      default:
        return <DashboardPage />;
    }
  };

  return (
    <MemoAdminLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onLogout={handleLogout}
    >
      <Suspense fallback={<AdminPageSkeleton />}>{renderPage()}</Suspense>
    </MemoAdminLayout>
  );
}
