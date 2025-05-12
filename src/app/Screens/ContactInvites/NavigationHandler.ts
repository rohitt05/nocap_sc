import { useEffect } from "react";
import { Platform } from "react-native";
import { usePathname, router } from "expo-router";
import { useNavigation } from "@react-navigation/native";

export default function NavigationHandler({ sourceTab = "friends" }) {
  const navigation = useNavigation();
  const pathname = usePathname();

  useEffect(() => {
    if (Platform.OS === "ios" && pathname.includes("/Screens/ContactInvites")) {
      const unsubscribe = navigation.addListener("beforeRemove", (e) => {
        e.preventDefault(); // Stop normal back behavior
        router.replace(`/(tabs)/${sourceTab}`); // Go to tabs/friends using Expo Router
      });

      return unsubscribe;
    }
  }, [pathname, sourceTab]);

  return null;
}
