// Mocks are enabled by default in development so the UI can run without the API.
export const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' ||
  (import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API !== 'false');
