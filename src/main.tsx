import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { loadAppConfig } from './api/axios'
import { ErrorFallback } from './components/ErrorFallback'

const root = createRoot(document.getElementById('root')!);

// Ensure runtime configuration is loaded before mounting the application
loadAppConfig()
  .then(() => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  })
  .catch((error) => {
    console.error("Failed to load application configuration from /config.json:", error);
    root.render(
      <StrictMode>
        <ErrorFallback
          error={error}
          resetErrorBoundary={() => {
            window.location.reload();
          }}
        />
      </StrictMode>
    );
  });

