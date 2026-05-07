import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.ecoeire.app',
  appName: 'EcoÉire',
  webDir: 'static-files',
  server: {
    androidScheme: 'https',
  }
};

export default config;