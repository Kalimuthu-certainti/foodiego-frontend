export const EmptyState = ({ icon = '🍽️', title, message }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    <span className="text-5xl mb-4">{icon}</span>
    <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    {message && <p className="text-sm text-gray-500 mt-1 max-w-xs">{message}</p>}
  </div>
);
