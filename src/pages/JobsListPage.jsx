import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllJobs, deleteJob } from '../api/bulkUpload';
import AppLayout from '../components/AppLayout';

const STATUS = {
  completed:  { dot: 'bg-green-500',  bg: 'bg-green-50',  text: 'text-green-700',  label: 'Completed'  },
  partial:    { dot: 'bg-amber-500',  bg: 'bg-amber-50',  text: 'text-amber-700',  label: 'Partial'    },
  failed:     { dot: 'bg-red-500',    bg: 'bg-red-50',    text: 'text-red-600',    label: 'Failed'     },
  pending:    { dot: 'bg-slate-400',  bg: 'bg-slate-100', text: 'text-slate-600',  label: 'Pending'    },
  processing: { dot: 'bg-blue-500',   bg: 'bg-blue-50',   text: 'text-blue-600',   label: 'Processing' },
};

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {[1,2,3,4,5,6].map(i => (
        <td key={i} className="px-5 py-4">
          <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${50 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 px-6 py-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function JobsListPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getAllJobs()
      .then((res) => setJobs(Array.isArray(res.data.data) ? res.data.data : []))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this import job?')) return;
    setDeletingId(jobId);
    try {
      await deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.job_id !== jobId));
    } catch {
      alert('Failed to delete job');
    } finally {
      setDeletingId(null);
    }
  };

  const totalImported = jobs.reduce((s, j) => s + (j.imported_rows || 0), 0);
  const successRate = jobs.length
    ? Math.round((jobs.filter(j => j.status === 'completed').length / jobs.length) * 100)
    : 0;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Import History</h1>
            <p className="text-slate-400 text-sm mt-1">All your bulk menu import jobs</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-red-600 transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Import
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Imports"
            value={jobs.length}
            color="bg-orange-50"
            icon={<svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
          />
          <StatCard
            label="Items Imported"
            value={totalImported.toLocaleString()}
            color="bg-green-50"
            icon={<svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
          />
          <StatCard
            label="Success Rate"
            value={`${successRate}%`}
            color="bg-blue-50"
            icon={<svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          />
          <StatCard
            label="Failed Jobs"
            value={jobs.filter(j => j.status === 'failed').length}
            color="bg-red-50"
            icon={<svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Recent Imports</h2>
            {!loading && <span className="text-xs text-slate-400">{jobs.length} records</span>}
          </div>

          {!loading && jobs.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-16 h-16 mx-auto bg-orange-50 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-slate-700 font-semibold">No imports yet</p>
              <p className="text-slate-400 text-sm mt-1">Upload your first CSV or Excel file to get started</p>
              <button
                onClick={() => navigate('/')}
                className="mt-5 px-6 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold text-sm hover:from-orange-600 hover:to-red-600 transition"
              >
                Start Bulk Import
              </button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {['File Name', 'Date', 'Total', 'Imported', 'Invalid', 'Status', ''].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : jobs.map((job) => {
                      const s = STATUS[job.status] || STATUS.pending;
                      return (
                        <tr
                          key={job.job_id}
                          className="border-b border-slate-50 hover:bg-slate-50 transition-colors group"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate max-w-[180px]">{job.file_name}</p>
                                <p className="text-xs text-slate-400 font-mono mt-0.5 truncate max-w-[180px]">{job.job_id?.slice(0, 18)}…</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">
                            {new Date(job.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="px-5 py-4 text-sm font-semibold text-slate-700">{job.total_rows ?? '—'}</td>
                          <td className="px-5 py-4">
                            <span className="text-sm font-semibold text-green-600">{job.imported_rows ?? '—'}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className="text-sm font-semibold text-red-500">{job.invalid_rows ?? '—'}</span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                              {s.label}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => navigate(`/jobs/${job.job_id}`)}
                                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition"
                              >
                                View
                              </button>
                              <button
                                onClick={() => handleDelete(job.job_id)}
                                disabled={deletingId === job.job_id}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 text-xs font-semibold rounded-lg transition disabled:opacity-50"
                              >
                                {deletingId === job.job_id ? '…' : 'Delete'}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
