import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

// Auth & Layout (always needed, load eagerly)
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';

// Lazy-loaded pages (code-split by route)
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ProductListPage = lazy(() => import('./pages/ProductListPage'));
const ProductFormPage = lazy(() => import('./pages/ProductFormPage'));
const CategoryListPage = lazy(() => import('./pages/CategoryListPage'));
const OrderListPage = lazy(() => import('./pages/OrderListPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const VoucherListPage = lazy(() => import('./pages/VoucherListPage'));
const VoucherFormPage = lazy(() => import('./pages/VoucherFormPage'));
const UserListPage = lazy(() => import('./pages/UserListPage'));
const ReviewListPage = lazy(() => import('./pages/ReviewListPage'));
const ReturnListPage = lazy(() => import('./pages/ReturnListPage'));
const SendNotificationPage = lazy(() => import('./pages/SendNotificationPage'));
const UserDetailPage = lazy(() => import('./pages/UserDetailPage'));
const HeroSliderListPage = lazy(() => import('./pages/HeroSliderListPage'));
const HeroSliderFormPage = lazy(() => import('./pages/HeroSliderFormPage'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'hsl(224, 71%, 6%)',
            color: 'hsl(213, 31%, 91%)',
            border: '1px solid hsl(216, 34%, 17%)',
            borderRadius: '8px',
            fontSize: '13px',
          },
        }}
      />
      <BrowserRouter basename="/admin">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected + Dashboard Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<DashboardLayout />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="products" element={<ProductListPage />} />
                <Route path="products/new" element={<ProductFormPage />} />
                <Route path="products/:id/edit" element={<ProductFormPage />} />
                <Route path="categories" element={<CategoryListPage />} />
                <Route path="orders" element={<OrderListPage />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
                <Route path="vouchers" element={<VoucherListPage />} />
                <Route path="vouchers/new" element={<VoucherFormPage />} />
                <Route path="vouchers/:id/edit" element={<VoucherFormPage />} />
                <Route path="users" element={<UserListPage />} />
                <Route path="users/:id" element={<UserDetailPage />} />
                <Route path="reviews" element={<ReviewListPage />} />
                <Route path="returns" element={<ReturnListPage />} />
                <Route path="notifications/send" element={<SendNotificationPage />} />
                <Route path="hero-sliders" element={<HeroSliderListPage />} />
                <Route path="hero-sliders/new" element={<HeroSliderFormPage />} />
                <Route path="hero-sliders/:id/edit" element={<HeroSliderFormPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  );
}
