declare module "@expo/config" {
  export type ConfigContext = {
    config: ExpoConfig;
  };

  export type ExpoConfig = {
    name: string;
    slug: string;
    scheme: string;
    version: string;
    orientation: string;
    icon: string;
    userInterfaceStyle: string;
    newArchEnabled: boolean;
    splash: {
      image: string;
      resizeMode: string;
      backgroundColor: string;
    };
    ios: {
      supportsTablet: boolean;
      bundleIdentifier: string;
      infoPlist: {
        NSContactsUsageDescription: string;
      };
    };
    android: {
      adaptiveIcon: {
        foregroundImage: string;
        backgroundColor: string;
      };
      package: string;
      googleServicesFile: string;
      permissions: string[];
    };
    web: {
      favicon: string;
    };
    plugins: any[];
    extra: {
      router: {
        origin: boolean;
      };
      eas: {
        projectId: string;
      };
    };
    owner: string;
  };
}
