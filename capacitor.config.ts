import type { CapacitorConfig } from '@capacitor/cli';

// Android-only setup. Replace appId and server.url with your own values
// once you've deployed Aanu (e.g. to Vercel) and picked your app id.
const config: CapacitorConfig = {
  appId: 'com.yourname.aanu',
  appName: 'Aanu',
  webDir: 'public',
  server: {
    url: 'https://your-deployed-url.vercel.app',
    cleartext: false,
  },
};

export default config;
