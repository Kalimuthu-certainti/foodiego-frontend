export const OfflineError = ({ onRetry }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <span className="text-4xl mb-3">📡</span>
    <h3 className="text-base font-semibold text-gray-800">Something went wrong</h3>
    <p className="text-sm text-gray-500 mt-1">Check your connection and try again.</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-4 px-5 py-2 bg-[#E85D04] text-white rounded-full text-sm font-semibold hover:bg-[#c94e00] transition"
      >
        Retry
      </button>
    )}
  </div>
);
