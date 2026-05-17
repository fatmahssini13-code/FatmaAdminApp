/**
 * Backend HTTP origin — no trailing slash, no `/api` suffix.
 * Change this once per machine/network, or use prod replacement file for deployment.
 *
 * Examples: `http://localhost:5001`, `http://192.168.1.50:5001`, `https://api.example.com`
 */
export const environment = {
  production: false,
  apiOrigin: 'http://localhost:5001',
};
