import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { Colors } from "@/constants/Colors";
import AuthInitializer from "@/lib/components/AuthInitializer";

export default function RootLayout() {
  return (
    <>
      <AuthInitializer />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="welcome-success" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="light" backgroundColor={Colors.background} />
      <Toast />
    </>
  );
}
