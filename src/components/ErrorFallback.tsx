export interface FallbackProps {
  error: unknown
  resetErrorBoundary: (...args: unknown[]) => void
}

// Type guard function
function isError(error: unknown): error is Error {
  return error instanceof Error
}

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  // Type-safe error handling
  let errorMessage = 'An unknown error occurred'
  
  if (isError(error)) {
    errorMessage = error.message
  } else if (typeof error === 'string') {
    errorMessage = error
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = String(error.message)
  }

  return (
    <div className="error-container" style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Something went wrong</h2>
      <pre style={{ color: 'red', margin: '10px 0' }}>
        {errorMessage}
      </pre>
      <button 
        onClick={resetErrorBoundary}
        style={{
          padding: '8px 16px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Try again
      </button>
    </div>
  )
}