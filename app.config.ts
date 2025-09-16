import { ConfigContext, ExpoConfig } from "@expo/config";

const IS_DEV = process.env.APP_VARIANT === "development";
const IS_PREVIEW = process.env.APP_VARIANT === "preview";

// Log the current build variant when the config is processed
console.log(
  "Current build variant:",
  IS_DEV ? "DEVELOPMENT" : IS_PREVIEW ? "PREVIEW" : "PRODUCTION"
);

const getUniqueIdentifier = () => {
  if (IS_DEV) {
    console.log("Using DEV bundle identifier");
    return "com.rohitt05.nocap.dev";
  }

  if (IS_PREVIEW) {
    console.log("Using PREVIEW bundle identifier");
    return "com.rohitt05.nocap.preview";
  }

  console.log("Using PRODUCTION bundle identifier");
  return "com.rohitt05.nocap";
};

const getAppName = () => {
  if (IS_DEV) {
    console.log("Using DEV app name");
    return "nocap (Dev)";
  }

  if (IS_PREVIEW) {
    console.log("Using PREVIEW app name");
    return "nocap (Preview)";
  }

  console.log("Using PRODUCTION app name");
  return "nocap: Emoji Stickers";
};

export default ({ config }: ConfigContext): ExpoConfig => {
  // Get Mapbox download token for SDK installation
  const downloadToken = process.env.MAPBOX_DOWNLOAD_TOKEN;

  console.log(
    `Building app: ${getAppName()} with ID: ${getUniqueIdentifier()}`
  );

  if (!downloadToken) {
    console.warn("⚠️ MAPBOX_DOWNLOAD_TOKEN not found in environment variables");
  } else {
    console.log("✅ MAPBOX_DOWNLOAD_TOKEN found for SDK download");
  }

  return {
    ...config,
    name: getAppName(),
    slug: "nocap",
    scheme: "circlenocap",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash.png",
      resizeMode: "contain",
      backgroundColor: "#000",
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: getUniqueIdentifier(),
      infoPlist: {
        NSContactsUsageDescription:
          "Allow $(NoCap) to access your contacts to help you connect with friends",
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      package: getUniqueIdentifier(),
      googleServicesFile: "./google-services.json",
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.READ_CONTACTS",
        "android.permission.WRITE_CONTACTS",
      ],
    },
    web: {
      favicon: "./assets/favicon.png",
    },
    plugins: [
      "expo-router",
      "expo-dev-client",
      [
        "expo-sensors",
        {
          motionPermission:
            "Allow $(NoCap) to access motion and orientation sensors for compass functionality",
        },
      ],
      [
        "expo-camera",
        {
          cameraPermission: "Allow $(NoCap) to access your camera",
          microphonePermission: "Allow $(NoCap) to access your microphone",
          recordAudioAndroid: true,
        },
      ],
      [
        "expo-contacts",
        {
          contactsPermission:
            "Allow $(NoCap) to access your contacts to help you connect with friends",
        },
      ],
      [
        "@rnmapbox/maps",
        {
          // ✅ FIXED: Use exact configuration from @rnmapbox/maps docs
          RNMapboxMapsDownloadToken: downloadToken || "",
          RNMapboxMapsVersion: "11.0.0", // ✅ FIXED: Changed from 11.8.0 to 11.0.0
        },
      ],
      [
        "expo-location",
        {
          // ✅ ADDED: Required location permission for Mapbox
          locationWhenInUsePermission: "Show current location on map.",
          locationAlwaysAndWhenInUsePermission:
            "Allow $(NoCap) to use your location for maps and compass features",
          isIosBackgroundLocationEnabled: false,
          isAndroidBackgroundLocationEnabled: false,
        },
      ],
    ],
    extra: {
      router: {
        origin: false,
      },
      eas: {
        projectId: "1970dca5-18db-4f84-9d4c-baff6c3c7e2b",
      },
      // ✅ SIMPLIFIED: Only include build variant for debugging
      buildVariant: IS_DEV
        ? "development"
        : IS_PREVIEW
        ? "preview"
        : "production",
    },
    owner: "rohitt05",
  };
};
