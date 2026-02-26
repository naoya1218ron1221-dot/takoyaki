import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.ballparkdiary.app",
  appName: "Ballpark Diary",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0,
      backgroundColor: "#1a56db",
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#1a56db",
    },
  },
  android: {
    allowMixedContent: false,
    backgroundColor: "#f8fafc",
  },
};

export default config;
