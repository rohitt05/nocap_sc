import { useEffect } from "react";
import { Platform } from "react-native";
import { useNavigation, usePathname, router } from "expo-router";

// Custom hook to handle navigation gestures for iOS
export function useCustomNavigationGesture(sourceTab: string) {
  const navigation = useNavigation();
  const pathname = usePathname();

  useEffect(() => {
    if (Platform.OS === "ios") {
      // Only apply this to specific screens like user profiles
      if (pathname.includes("/Screens/user/users")) {
        const unsubscribe = navigation.addListener("beforeRemove", (e) => {
          // Prevent default navigation behavior
          e.preventDefault();

          // Navigate to the source tab instead
          router.replace(`/(tabs)/${sourceTab}`);
        });

        return unsubscribe;
      }
    }

    return () => {};
  }, [navigation, pathname, sourceTab]);

  return null;
}

// Component to wrap around screens that need custom navigation handling
export default function NavigationHandler({ sourceTab = "friends" }) {
  useCustomNavigationGesture(sourceTab);

  // This component doesn't render anything
  return null;
}
