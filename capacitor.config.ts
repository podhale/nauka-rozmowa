import type { CapacitorConfig } from '@capacitor/cli';

// Android/iOS wrapper. Build the web app first (npm run build), then `npx cap sync`.
// In the native app the Claude features (cloud sync, AI) are hidden; progress stays on the device.
const config: CapacitorConfig = {
  appId: 'pl.nauka.rozmowa',
  appName: 'Rozmowa .NET + Angular',
  webDir: 'dist/nauka-rozmowa/browser',
};

export default config;
