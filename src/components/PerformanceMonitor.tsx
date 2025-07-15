import React, { useEffect, useRef } from 'react';
import { usePerformanceMonitor } from '../hooks/usePerformance';
import { getCacheStats } from '../utils/performanceOptimizations';
import './PerformanceMonitor.css';

interface PerformanceMonitorProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  isVisible = false,
  onToggle
}) => {
  const frameRateRef = useRef<number[]>([]);
  const lastFrameTimeRef = useRef(performance.now());
  const [frameRate, setFrameRate] = React.useState(0);
  const [memoryUsage, setMemoryUsage] = React.useState<any>(null);
  const [cacheStats, setCacheStats] = React.useState<any>(null);

  // Monitor component performance
  usePerformanceMonitor('PerformanceMonitor', [isVisible]);

  // Calculate frame rate
  useEffect(() => {
    if (!isVisible) return;

    let animationId: number;
    
    const measureFrameRate = () => {
      const now = performance.now();
      const delta = now - lastFrameTimeRef.current;
      
      if (delta > 0) {
        const fps = 1000 / delta;
        frameRateRef.current.push(fps);
        
        // Keep only last 60 frames for rolling average
        if (frameRateRef.current.length > 60) {
          frameRateRef.current.shift();
        }
        
        // Calculate average FPS
        const avgFps = frameRateRef.current.reduce((sum, fps) => sum + fps, 0) / frameRateRef.current.length;
        setFrameRate(Math.round(avgFps));
      }
      
      lastFrameTimeRef.current = now;
      animationId = requestAnimationFrame(measureFrameRate);
    };

    measureFrameRate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [isVisible]);

  // Monitor memory usage (if available)
  useEffect(() => {
    if (!isVisible) return;

    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryUsage({
          used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
          total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
          limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024)
        });
      }
    };

    updateMemoryUsage();
    const interval = setInterval(updateMemoryUsage, 1000);

    return () => clearInterval(interval);
  }, [isVisible]);

  // Monitor cache stats
  useEffect(() => {
    if (!isVisible) return;

    const updateCacheStats = () => {
      setCacheStats(getCacheStats());
    };

    updateCacheStats();
    const interval = setInterval(updateCacheStats, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) {
    return (
      <button 
        className="performance-monitor-toggle"
        onClick={onToggle}
        title="Show performance monitor"
      >
        📊
      </button>
    );
  }

  return (
    <div className="performance-monitor">
      <div className="performance-monitor-header">
        <h3>Performance Monitor</h3>
        <button 
          className="performance-monitor-close"
          onClick={onToggle}
          title="Hide performance monitor"
        >
          ✕
        </button>
      </div>
      
      <div className="performance-monitor-content">
        <div className="performance-metric">
          <label>Frame Rate:</label>
          <span className={`metric-value ${frameRate < 30 ? 'warning' : frameRate < 45 ? 'ok' : 'good'}`}>
            {frameRate} FPS
          </span>
        </div>

        {memoryUsage && (
          <div className="performance-metric">
            <label>Memory Usage:</label>
            <span className={`metric-value ${memoryUsage.used / memoryUsage.limit > 0.8 ? 'warning' : 'good'}`}>
              {memoryUsage.used}MB / {memoryUsage.limit}MB
            </span>
          </div>
        )}

        {cacheStats && (
          <div className="performance-metric">
            <label>Cache Entries:</label>
            <span className="metric-value">
              {cacheStats.size}
            </span>
          </div>
        )}

        <div className="performance-metric">
          <label>DOM Nodes:</label>
          <span className="metric-value">
            {document.querySelectorAll('*').length}
          </span>
        </div>

        <div className="performance-metric">
          <label>Navigation Timing:</label>
          <span className="metric-value">
            {Math.round(performance.timing.loadEventEnd - performance.timing.navigationStart)}ms
          </span>
        </div>

        {cacheStats && cacheStats.entries.length > 0 && (
          <div className="cache-details">
            <details>
              <summary>Cache Details ({cacheStats.size} entries)</summary>
              <ul>
                {cacheStats.entries.slice(0, 10).map((entry: string, index: number) => (
                  <li key={index} title={entry}>
                    {entry.length > 40 ? `${entry.substring(0, 40)}...` : entry}
                  </li>
                ))}
                {cacheStats.entries.length > 10 && (
                  <li>...and {cacheStats.entries.length - 10} more</li>
                )}
              </ul>
            </details>
          </div>
        )}

        <div className="performance-actions">
          <button 
            onClick={() => {
              // Force garbage collection if available
              if ('gc' in window) {
                (window as any).gc();
              }
              // Clear performance cache
              const { clearMemoCache } = require('../utils/performanceOptimizations');
              clearMemoCache();
              setCacheStats(getCacheStats());
            }}
            className="btn btn-sm"
          >
            Clear Cache
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;