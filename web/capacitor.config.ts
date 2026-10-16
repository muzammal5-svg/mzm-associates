import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId:    "com.mzmassociates.cms",
  appName:  "MZM & Associates",
  webDir:   "out",          // Next.js static export output directory

  // Local dev server (comment out for production builds)
  // server: {
  //   url: "http://192.168.x.x:3000",  // replace with your LAN IP
  //   cleartext: true,
  // },

  plugins: {
    SplashScreen: {
      launchShowDuration:    2000,
      launchAutoHide:        true,
      backgroundColor:       "#0B1B3A",
      androidSplashResourceName: "splash",
      showSpinner:           false,
      iosShowOnLaunch:       true,
    },
    StatusBar: {
      style:           "DARK",
      backgroundColor: "#0B1B3A",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
      // FCM is configured in android/app/google-services.json (native Android).
      // VAPID public key is used for web push (NEXT_PUBLIC_VAPID_PUBLIC_KEY).
    },
  },

  android: {
    buildOptions: {
      keystorePath:    "",  // set in CI / local env — never hardcode
      keystoreAlias:   "mzm-key",
    },
  },

  ios: {
    scheme: "MZM",
    contentInset: "automatic",
  },
};

export default config;
