import { useEffect, useRef, useState } from 'react';
import AppLayout from '../components/AppLayout';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SUPERSET_URL = 'http://localhost:8088';
const EMBEDDED_UUID = '0371ec9d-8576-4039-a826-c21229ccb0de';

async function fetchGuestToken() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE}/superset/guest-token`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch guest token');
  const data = await res.json();
  return data.token;
}

export default function AnalyticsPage() {
  const containerRef = useRef(null);
  const dashboardRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = async () => {
    const next = !darkMode;
    setDarkMode(next);
    if (dashboardRef.current) {
      await dashboardRef.current.setThemeConfig(
        next ? { algorithm: 'dark' } : { algorithm: 'default' }
      );
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function mount() {
      try {
        const { embedDashboard } = await import('@superset-ui/embedded-sdk');
        const dashboard = await embedDashboard({
          id: EMBEDDED_UUID,
          supersetDomain: SUPERSET_URL,
          mountPoint: containerRef.current,
          fetchGuestToken,
          dashboardUiConfig: {
            hideTitle: false,
            hideChartControls: false,
            hideFilters: false,
          },
        });
        if (!cancelled) {
          dashboardRef.current = dashboard;
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    mount();

    return () => {
      cancelled = true;
      if (dashboardRef.current) {
        dashboardRef.current.unmount();
        dashboardRef.current = null;
      }
    };
  }, []);

  return (
    <AppLayout>
      {/* Thin header bar — full width, no max-w constraint */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-slate-200 bg-white">
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-none">Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">Live dashboard powered by Apache Superset</p>
        </div>
        <button
          onClick={toggleDarkMode}
          disabled={loading || !!error}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
        >
          {darkMode ? (
            <>
              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              Light mode
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              Dark mode
            </>
          )}
        </button>
      </div>

      {/* Dashboard — full width, fills remaining viewport height */}
      <div style={{ height: 'calc(100vh - 112px)', position: 'relative' }}>
        {loading && !error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-slate-400 bg-slate-50">
            <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span className="text-sm">Loading dashboard…</span>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-800">Could not load dashboard</p>
              <p className="text-xs text-slate-400 mt-1">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-4 py-2 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        <style>{`
          .superset-container iframe {
            width: 100% !important;
            height: 100% !important;
            border: none !important;
          }
        `}</style>
        <div
          ref={containerRef}
          className="superset-container"
          style={{ width: '100%', height: '100%', display: error ? 'none' : 'block' }}
        />
      </div>
    </AppLayout>
  );
}
