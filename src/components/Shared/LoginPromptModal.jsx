export const LoginPromptModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
        <span className="text-4xl">🔐</span>
        <h3 className="text-lg font-bold text-gray-900 mt-3">Login Required</h3>
        <p className="text-sm text-gray-500 mt-1">{message || 'Please login to continue.'}</p>
        <div className="flex gap-3 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={() => { onClose(); window.location.href = '/login'; }}
            className="flex-1 py-2 rounded-full bg-[#E85D04] text-white text-sm font-semibold hover:bg-[#c94e00]"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
};
