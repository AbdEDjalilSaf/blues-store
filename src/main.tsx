import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

/**
 * Admin ships as its own entry graph: the storefront bundle never includes
 * any admin module, and the admin chunks are only fetched on /admin routes.
 */
const AdminApp = lazy(() => import('./admin/AdminApp.tsx'))

const isAdmin = window.location.pathname.startsWith('/admin')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdmin ? (
      <Suspense fallback={<div className="min-h-screen bg-gray-50" aria-busy="true" />}>
        <AdminApp />
      </Suspense>
    ) : (
      <App />
    )}
  </StrictMode>,
)
