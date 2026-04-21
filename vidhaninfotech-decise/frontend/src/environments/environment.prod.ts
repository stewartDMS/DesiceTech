// When deploying to Vercel (or any CI), this file is overwritten at build time
// by scripts/set-env.js using the VITE_API_URL / VITE_UPLOADS_URL / VITE_UPLOAD_FILE
// environment variables you set in the Vercel project dashboard.
// The values below are the defaults used when those variables are not set.
export const environment = {
  production: true,
  apiUrl: 'https://desice.co.nz/v1/',
  uploadsUrl: 'https://desice.co.nz/uploads/',
  uploadFile: 'https://17imjsjqd8.execute-api.eu-north-1.amazonaws.com/dev/desice-uploaded-files/',
};
