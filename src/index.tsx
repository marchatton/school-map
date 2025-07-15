import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { 
  registerServiceWorker, 
  requestPersistentStorage, 
  prefetchCriticalResources,
  startUpdateChecker 
} from './utils/serviceWorker';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Initialize performance optimizations
(async () => {
  try {
    // Register service worker for caching and offline support
    const registration = await registerServiceWorker();
    
    if (registration) {
      console.log('Service worker initialized');
      
      // Start periodic update checks
      const stopUpdateChecker = startUpdateChecker();
      
      // Clean up on page unload
      window.addEventListener('beforeunload', stopUpdateChecker);
    }
    
    // Request persistent storage for better caching
    await requestPersistentStorage();
    
    // Prefetch critical resources
    await prefetchCriticalResources();
    
    // Add performance observer for monitoring
    if ('PerformanceObserver' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'navigation') {
            console.log('Navigation timing:', {
              domContentLoaded: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
              loadComplete: entry.loadEventEnd - entry.loadEventStart,
              totalTime: entry.loadEventEnd - entry.fetchStart
            });
          }
          
          if (entry.entryType === 'paint') {
            console.log(`${entry.name}:`, entry.startTime);
          }
        });
      });
      
      observer.observe({ entryTypes: ['navigation', 'paint'] });
    }
    
    // Monitor memory usage in development
    if (process.env.NODE_ENV === 'development' && 'memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.9) {
          console.warn('High memory usage detected:', {
            used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
            limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
          });
        }
      }, 30000); // Check every 30 seconds
    }
    
  } catch (error) {
    console.error('Initialization failed:', error);
  }
})();