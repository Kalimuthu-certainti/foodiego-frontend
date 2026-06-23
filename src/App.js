import { BrowserRouter, Routes, Route } from 'react-router-dom';
import UploadPage from './pages/UploadPage';
import JobStatusPage from './pages/JobStatusPage';
import JobsListPage from './pages/JobsListPage';
import MenuItemsPage from './pages/MenuItemsPage';
import AnalyticsPage from './pages/AnalyticsPage';

localStorage.setItem('token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6InJlc3RhdXJhbnRfb3duZXIiLCJpYXQiOjE3ODE2MDczNDV9.EZhJKOyYr-O3QFiLhRBaY3_DMh8WRCUs5q-IFM5id_c');

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<UploadPage />} />
        <Route path="/jobs" element={<JobsListPage />} />
        <Route path="/jobs/:jobId" element={<JobStatusPage />} />
        <Route path="/menu-items" element={<MenuItemsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
