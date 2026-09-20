import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

if (typeof window !== 'undefined') {
  import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
    const report = (metric: any) => {
      if (import.meta.env.DEV) {
        console.debug('[web-vitals]', metric.name, metric.value);
      }
    };
    onCLS(report);
    onINP(report);
    onFCP(report);
    onLCP(report);
    onTTFB(report);
  }).catch(() => { /* noop */ });
}
