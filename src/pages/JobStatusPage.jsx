import { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getJobStatus } from '../api/bulkUpload';
import AppLayout from '../components/AppLayout';

const STATUS = {
  completed: {
    label: 'Import Successful', sub: 'All rows were imported successfully.',
    iconBg: 'bg-green-100', iconColor: 'text-green-500',
    badgeBg: 'bg-green-100', badgeText: 'text-green-700',
    barColor: 'from-green-400 to-emerald-500',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>,
  },
  partial: {
    label: 'Partially Imported', sub: 'Some rows could not be imported.',
    iconBg: 'bg-orange-100', iconColor: 'text-orange-500',
    badgeBg: 'bg-orange-100', badgeText: 'text-orange-600',
    barColor: 'from-orange-400 to-red-400',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" /></svg>,
  },
  failed: {
    label: 'Import Failed', sub: 'No rows could be imported.',
    iconBg: 'bg-red-100', iconColor: 'text-red-500',
    badgeBg: 'bg-red-100', badgeText: 'text-red-600',
    barColor: 'from-red-400 to-red-500',
    icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>,
  },
  processing: {
    label: 'Processing…', sub: 'Your file is being processed.',
    iconBg: 'bg-blue-100', iconColor: 'text-blue-500',
    badgeBg: 'bg-blue-100', badgeText: 'text-blue-600',
    barColor: 'from-blue-400 to-blue-500',
    icon: <svg className="w-8 h-8 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
  },
};

export default function JobStatusPage() {
  const { jobId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [job, setJob] = useState(location.state || null);
  const [loading, setLoading] = useState(true);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    getJobStatus(jobId)
      .then((res) => setJob(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-32">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-sm">Loading results…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  const cfg = STATUS[job?.status] || STATUS.partial;
  const errorList    = job?.error_log    ?? job?.errors      ?? [];
  const totalRows    = job?.total_rows   ?? job?.totalRows   ?? 0;
  const validRows    = job?.valid_rows   ?? job?.validRows   ?? 0;
  const invalidRows  = job?.invalid_rows ?? job?.invalidRows ?? 0;
  const importedRows = job?.imported_rows ?? job?.importedRows ?? 0;
  const skippedRows  = job?.skipped_rows  ?? job?.skippedRows  ?? 0;
  const successRate  = totalRows > 0 ? Math.round((importedRows / totalRows) * 100) : 0;

  return (
    <AppLayout>
      <div className="max-w-lg mx-auto px-6 py-8 space-y-4">

        {/* Status Hero */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-6 flex items-center gap-4">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${cfg.iconBg} ${cfg.iconColor}`}>
            {cfg.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-bold text-slate-900">{cfg.label}</h2>
            <p className="text-sm text-slate-400 mt-0.5">{cfg.sub}</p>
            <p className="text-xs text-slate-300 font-mono mt-1 truncate">{jobId}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 capitalize ${cfg.badgeBg} ${cfg.badgeText}`}>
            {job?.status}
          </span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Rows',   value: totalRows,           color: 'text-slate-800'  },
            { label: 'Imported',     value: importedRows,        color: 'text-green-500'  },
            { label: 'Invalid Rows', value: invalidRows,         color: 'text-red-500'    },
            { label: 'Success Rate', value: `${successRate}%`,   color: 'text-orange-500' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm px-5 py-5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
              <p className={`text-4xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Progress */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-6 py-5 space-y-3">
          <div className="flex justify-between text-xs text-slate-400">
            <span className="font-semibold">Import Progress</span>
            <span>{importedRows} of {totalRows} rows</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div className={`h-3 rounded-full bg-gradient-to-r ${cfg.barColor} transition-all duration-500`} style={{ width: `${successRate}%` }} />
          </div>
          <div className="flex gap-5">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-xs text-slate-400">{validRows} valid</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs text-slate-400">{invalidRows} invalid</span>
            </div>
            {skippedRows > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                <span className="text-xs text-slate-400">{skippedRows} skipped</span>
              </div>
            )}
          </div>
        </div>

        {/* Invalid Rows */}
        {errorList.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <button
              onClick={() => setShowErrors(!showErrors)}
              className="w-full flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors"
            >
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left flex-1">
                <p className="text-sm font-semibold text-slate-800">Invalid Rows</p>
                <p className="text-xs text-slate-400">{errorList.length} rows could not be imported</p>
              </div>
              <svg className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showErrors ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showErrors && (
              <div className="border-t border-slate-100 max-h-56 overflow-y-auto divide-y divide-slate-50">
                {errorList.map((e, i) => (
                  <div key={i} className="px-6 py-3 flex items-start gap-3">
                    <span className="w-6 h-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                      {e.row}
                    </span>
                    <p className="text-sm text-slate-500">{e.error}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-1">
          <button
            onClick={() => navigate('/menu-items')}
            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl font-bold text-base hover:from-orange-600 hover:to-red-600 transition shadow-sm"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              View Menu Items
            </span>
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-2xl font-semibold text-base hover:bg-slate-50 transition shadow-sm"
          >
            Upload Another File
          </button>
        </div>

      </div>
    </AppLayout>
  );
}
