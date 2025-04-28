
import { supabase } from "@/integrations/supabase/client";

// Simple performance monitoring and error tracking service
export const monitoring = {
  // Track page load performance
  trackPageLoad: (page: string, loadTimeMs: number) => {
    try {
      console.log(`📊 Page Load: ${page} loaded in ${loadTimeMs}ms`);
      
      // In a production app, you'd send this to your backend
      // supabase.from('analytics_page_loads').insert([
      //   { page, load_time_ms: loadTimeMs, timestamp: new Date() }
      // ]);
    } catch (error) {
      console.error('Error tracking page load:', error);
    }
  },

  // Track user events
  trackEvent: (eventName: string, properties: Record<string, any> = {}) => {
    try {
      console.log(`📊 Event: ${eventName}`, properties);
      
      // In a production app, you'd send this to your backend
      // supabase.from('analytics_events').insert([
      //   { event_name: eventName, properties, timestamp: new Date() }
      // ]);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  },

  // Report errors
  reportError: (error: Error, context: Record<string, any> = {}) => {
    try {
      console.error(`🔴 Error:`, error.message, context);
      
      // In a production app, you'd send this to your backend
      // supabase.from('error_logs').insert([
      //   { 
      //     error_message: error.message,
      //     error_stack: error.stack,
      //     context,
      //     timestamp: new Date()
      //   }
      // ]);
    } catch (reportingError) {
      console.error('Error reporting error:', reportingError);
    }
  },

  // Measure component render time
  measureRenderTime: (componentName: string) => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTimeMs = endTime - startTime;
      console.log(`📊 Component Render: ${componentName} rendered in ${renderTimeMs.toFixed(2)}ms`);
      
      // In a production app, you'd send this to your backend for slower renders
      // if (renderTimeMs > 100) {
      //   supabase.from('analytics_slow_renders').insert([
      //     { component: componentName, render_time_ms: renderTimeMs, timestamp: new Date() }
      //   ]);
      // }
    };
  }
};

// Custom hook for monitoring component performance
export const usePerformanceMonitoring = (componentName: string) => {
  const endMeasurement = monitoring.measureRenderTime(componentName);
  
  // In a real implementation, you'd use useEffect to call endMeasurement
  // when the component mounts and again if it re-renders
  return {
    trackEvent: (eventName: string, properties: Record<string, any> = {}) => {
      monitoring.trackEvent(`${componentName}:${eventName}`, properties);
    },
    reportError: (error: Error, context: Record<string, any> = {}) => {
      monitoring.reportError(error, { ...context, component: componentName });
    }
  };
};
