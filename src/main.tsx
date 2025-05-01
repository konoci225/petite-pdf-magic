
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import { ErrorBoundary } from './components/ErrorBoundary'; 
import './index.css'

// Add error monitoring for React component errors
const originalConsoleError = console.error;
console.error = function(...args) {
  // Log the original error
  originalConsoleError.apply(console, args);
  
  // Check for specific Radix UI errors
  if (args[0] && typeof args[0] === 'string' && 
      args[0].includes('RovingFocusGroupItem') && 
      args[0].includes('RovingFocusGroup')) {
    console.warn('🔍 Debugging RovingFocus error - Component hierarchy issue detected');
    console.trace('Component stack trace:');
  }
};

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
