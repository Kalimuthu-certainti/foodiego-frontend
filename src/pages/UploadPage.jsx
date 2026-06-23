import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadFileWithRestaurant, downloadTemplate, getRestaurants } from '../api/bulkUpload';
import RestaurantDropdown from '../components/RestaurantDropdown';
import AppLayout from '../components/AppLayout';

const parseCSVPreview = (text) => {
  const lines = text.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, '').toLowerCase());
  return lines.slice(1, 6).map((line) => {
    const values = line.split(',').map((v) => v.trim().replace(/"/g, ''));
    const row = {};
    headers.forEach((h, i) => { row[h] = values[i] || ''; });
    return row;
  });
};

function StepIndicator({ step }) {
  const steps = ['Choose Restaurant', 'Upload File', 'Preview & Import'];
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((label, i) => {
        const num = i + 1;
        const done = step > num;
        const active = step === num;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                done ? 'bg-green-500 text-white' : active ? 'bg-orange-500 text-white shadow-md' : 'bg-slate-200 text-slate-400'
              }`}>
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : num}
              </div>
              <span className={`text-xs font-medium whitespace-nowrap ${active ? 'text-orange-600' : done ? 'text-green-600' : 'text-slate-400'}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 h-0.5 mx-2 mb-4 rounded-full transition-all ${done ? 'bg-green-400' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [restaurantId, setRestaurantId] = useState('');
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [previewRows, setPreviewRows] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const step = !restaurantId ? 1 : !file ? 2 : 3;

  useEffect(() => {
    getRestaurants()
      .then((res) => {
        const list = res.data?.data || [];
        setRestaurants(list);
        if (list.length === 1) setRestaurantId(list[0].restaurant_id);
      })
      .catch(() => setError('Failed to load restaurants'))
      .finally(() => setLoadingRestaurants(false));
  }, []);

  const processFile = (selected) => {
    if (!selected) return;
    setFile(selected);
    setError(null);
    setPreviewRows([]);
    if (selected.name.toLowerCase().endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewRows(parseCSVPreview(e.target.result));
      reader.readAsText(selected);
    }
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && /\.(csv|xlsx)$/i.test(dropped.name)) processFile(dropped);
    else setError('Only CSV and XLSX files are supported');
  }, []);

  const handleUpload = async () => {
    if (!restaurantId) return setError('Please select a restaurant');
    if (!file) return setError('Please select a file');
    setLoading(true);
    setError(null);
    try {
      const res = await uploadFileWithRestaurant(file, restaurantId, setProgress);
      navigate(`/jobs/${res.data.data.jobId}`, { state: res.data.data });
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await downloadTemplate();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.setAttribute('download', 'bulk_upload_template.csv');
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      setError('Failed to download template');
    }
  };

  const selectedRestaurant = restaurants.find(r => r.restaurant_id === restaurantId);

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto px-6 py-8">

        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Bulk Import Menu</h1>
          <p className="text-slate-400 text-sm mt-1">Import up to 500 menu items at once via CSV or Excel</p>
        </div>

        {/* Step Indicator */}
        <StepIndicator step={step} />

        <div className="space-y-4">

          {/* Step 1 — Restaurant */}
          <div className={`bg-white rounded-2xl border transition-all ${step === 1 ? 'border-orange-200 shadow-md' : 'border-slate-100 shadow-sm'}`}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <span className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center transition-all ${
                step > 1 ? 'bg-green-500' : 'bg-orange-500'
              }`}>
                {step > 1 ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : '1'}
              </span>
              <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">Choose Restaurant</span>
              {selectedRestaurant && (
                <span className="ml-auto text-xs text-orange-600 font-semibold bg-orange-50 px-2 py-0.5 rounded-full">
                  {selectedRestaurant.name}
                </span>
              )}
            </div>
            <div className="px-6 py-5">
              {loadingRestaurants ? (
                <div className="h-14 bg-slate-100 rounded-2xl animate-pulse" />
              ) : restaurants.length === 0 ? (
                <div className="border border-red-200 bg-red-50 rounded-2xl px-5 py-4 text-red-500 text-sm">
                  No restaurants found. Please add a restaurant first.
                </div>
              ) : (
                <RestaurantDropdown
                  restaurants={restaurants}
                  value={restaurantId}
                  onChange={(id) => { setRestaurantId(id); setError(null); }}
                />
              )}
            </div>
          </div>

          {/* Step 2 — File Upload */}
          <div className={`bg-white rounded-2xl border transition-all ${step === 2 ? 'border-orange-200 shadow-md' : 'border-slate-100 shadow-sm'} ${!restaurantId ? 'opacity-60 pointer-events-none' : ''}`}>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
              <span className={`w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center transition-all ${
                step > 2 ? 'bg-green-500' : step === 2 ? 'bg-orange-500' : 'bg-slate-300'
              }`}>
                {step > 2 ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : '2'}
              </span>
              <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">Upload File</span>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={handleDownloadTemplate} className="text-xs text-orange-500 hover:text-orange-600 font-medium underline underline-offset-2">
                  Download Template
                </button>
              </div>
            </div>
            <div className="px-6 py-5">
              <div
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                  isDragging ? 'border-orange-400 bg-orange-50' : file ? 'border-green-300 bg-green-50' : 'border-slate-200 hover:border-orange-300 hover:bg-orange-50/30'
                }`}
                onClick={() => !file && fileInputRef.current?.click()}
              >
                {file ? (
                  <div>
                    <div className="w-14 h-14 mx-auto mb-3 bg-green-100 rounded-2xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-slate-800">{file.name}</p>
                    <p className="text-slate-400 text-sm mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); setFile(null); setPreviewRows([]); }}
                      className="mt-3 text-xs text-red-400 hover:text-red-500 font-medium"
                    >
                      Remove file
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="w-14 h-14 mx-auto mb-4 bg-orange-100 rounded-2xl flex items-center justify-center">
                      <svg className="w-7 h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="font-semibold text-slate-700">Upload CSV or Excel file</p>
                    <p className="text-slate-400 text-sm mt-1 mb-4">Drag and drop your file here or</p>
                    <button
                      onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      className="px-6 py-2 border border-slate-300 rounded-full text-sm text-slate-600 hover:bg-slate-100 transition font-medium"
                    >
                      Browse Files
                    </button>
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx" onChange={(e) => processFile(e.target.files[0])} className="hidden" />
              </div>
              <p className="text-xs text-slate-400 mt-3 text-center">Max 5 MB · Up to 500 rows · CSV or XLSX format</p>
            </div>
          </div>

          {/* Step 3 — Preview */}
          {file && (
            <div className="bg-white rounded-2xl border border-orange-200 shadow-md">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-orange-500 text-white text-xs font-bold flex items-center justify-center">3</span>
                  <span className="text-xs font-bold text-slate-500 tracking-widest uppercase">Import Preview</span>
                </div>
                {previewRows.length > 0 && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full uppercase tracking-wide">
                    {previewRows.length} Items Detected
                  </span>
                )}
              </div>

              {previewRows.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Item Name</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Category</th>
                          <th className="px-6 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide">Price</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, i) => (
                          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-3.5">
                              <p className="text-sm font-semibold text-slate-800">{row.item_name || '—'}</p>
                              {row.sub_category && <p className="text-xs text-slate-400 mt-0.5">{row.sub_category}</p>}
                            </td>
                            <td className="px-6 py-3.5">
                              <span className="px-2.5 py-1 bg-purple-50 text-purple-600 text-xs font-medium rounded-full">
                                {row.category || '—'}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 text-right">
                              <span className="text-sm font-bold text-orange-500">
                                {row.price ? `₹${parseFloat(row.price).toFixed(2)}` : '—'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-6 py-3.5 bg-amber-50 border-t border-amber-100 flex items-start gap-2">
                    <svg className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-amber-700">
                      Showing first {previewRows.length} rows. Existing items with the same name and category will be updated, not duplicated.
                    </p>
                  </div>
                </>
              ) : (
                <div className="px-6 py-10 text-center text-slate-400 text-sm">
                  {/\.xlsx$/i.test(file.name) ? 'Excel file selected — preview not available for XLSX.' : 'Processing preview…'}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Progress */}
          {loading && (
            <div className="bg-white rounded-xl border border-slate-100 px-5 py-4">
              <div className="flex justify-between text-xs text-slate-400 mb-2">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur border-t border-slate-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button
            onClick={() => navigate('/jobs')}
            className="px-5 py-3 border border-slate-200 text-slate-500 rounded-xl font-semibold text-sm hover:bg-slate-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={loading || !file || !restaurantId}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold text-sm hover:from-orange-600 hover:to-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {loading ? `Uploading… ${progress}%` : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Complete Import
              </span>
            )}
          </button>
        </div>
      </div>
      <div className="h-24" />
    </AppLayout>
  );
}
