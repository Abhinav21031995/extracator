import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

const mount = (): void => {
  // Log React version and instance during mount
  console.log('[Extractor Bootstrap] React version:', React.version);
  console.log('[Extractor Bootstrap] React instance:', React);
  console.log('[Extractor Bootstrap] createRoot instance:', createRoot);
  
  const container = document.getElementById('root');
  if (container) {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
};

mount();
