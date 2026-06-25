import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AppLayout } from '../components/AppLayout';
import LoginPage from '../pages/LoginPage';
import BrandListPage from '../pages/BrandListPage';
import BrandDetailPage from '../pages/BrandDetailPage';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || undefined;

export const router = createBrowserRouter(
  [
    { path: '/login', element: <LoginPage /> },
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppLayout />,
          children: [
            { index: true, element: <BrandListPage /> },
            { path: ':tab', element: <BrandDetailPage /> },
          ],
        },
      ],
    },
    { path: '*', element: <Navigate to="/" replace /> },
  ],
  { basename },
);
