import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import { queryClient } from './store/queryClient';
import { ToastProvider } from './components/ui/toast';
import { SelectedBrandProvider } from './store/selectedBrand';
import './styles/index.css';

const rootEl = document.getElementById('root');
if (!rootEl) {
  throw new Error('Root element #root not found');
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SelectedBrandProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </SelectedBrandProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
