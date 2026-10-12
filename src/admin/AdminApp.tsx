import { Suspense, lazy, useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdminLayout from './AdminLayout';
import DashboardPage from './DashboardPage';
import OrdersPage from './OrdersPage';
import { ProductsPageSkeleton } from './ProductsStates';
import CustomersPage from './CustomersPage';
import SettingsPage from './SettingsPage';
import { prefetchAdminProducts } from './productCache';

/** Products is the heaviest page, so it is loaded only when opened. */
const ProductsPage = lazy(() => import('./ProductsPage'));

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem('admin-auth') === 'true'
  );
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Warm the products request while the lazy chunk is still downloading.
  useEffect(() => {
    if (isAuthenticated && currentPage === 'products') prefetchAdminProducts();
  }, [isAuthenticated, currentPage]);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('admin-auth');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'orders':
        return <OrdersPage />;
      case 'products':
        return (
          <Suspense fallback={<ProductsPageSkeleton />}>
            <ProductsPage />
          </Suspense>
        );
      case 'customers':
        return <CustomersPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <AdminLayout
      currentPage={currentPage}
      onPageChange={setCurrentPage}
      onLogout={handleLogout}
    >
      {renderPage()}
    </AdminLayout>
  );
}
