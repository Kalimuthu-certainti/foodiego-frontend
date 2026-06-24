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
export const router = createBrowserRouter([
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
]);
