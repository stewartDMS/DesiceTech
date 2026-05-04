// When deploying to Vercel (or any CI), this file is overwritten at build time
// by scripts/set-env.js using the VITE_API_URL / VITE_UPLOADS_URL / VITE_UPLOAD_FILE
// environment variables you set in the Vercel project dashboard.
// The values below are the defaults used when those variables are not set.
export const environment = {
  production: true,
  apiUrl: 'https://desice.co.nz/v1/',
  uploadsUrl: 'https://desice.co.nz/uploads/',
  uploadFile: 'https://17imjsjqd8.execute-api.eu-north-1.amazonaws.com/dev/desice-uploaded-files/',

  // TODO: Replace with actual App Store / Google Play URLs before deploying to production.
  // App store download links — replace with actual URLs when available
  appStoreUrl: 'https://apps.apple.com/app/desice',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=nz.co.desice',
};
