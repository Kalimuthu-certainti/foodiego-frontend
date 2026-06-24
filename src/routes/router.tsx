import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AppLayout } from '../components/AppLayout';
import LoginPage from '../pages/LoginPage';
import BrandListPage from '../pages/BrandListPage';
import BrandDetailPage from '../pages/BrandDetailPage';

/**
 * App routes:
 * - /login         public
 * - everything else wrapped by ProtectedRoute -> AppLayout (header + <Outlet/>)
 *     index            -> BrandListPage
 *     brands/:id       -> BrandDetailPage
 */

// Vite's BASE_URL is "/" in dev and "/foodiego-frontend/" on GitHub Pages.
// React Router needs it (without the trailing slash) so routes resolve under the
// subpath instead of bouncing to the account root (which 404s).
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

export const router = createBrowserRouter(
  [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <BrandListPage /> },
          { path: 'brands/:id', element: <BrandDetailPage /> },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
  ],
  { basename },
);
