import { RouterProvider } from 'react-router-dom';
import { router } from './routes/router';

/**
 * App root. The data router (createBrowserRouter) provides routing context,
 * so no separate <BrowserRouter> is needed here. Providers (QueryClient,
 * Toast) are mounted above this component in main.tsx.
 */
export default function App() {
  return <RouterProvider router={router} />;
}
