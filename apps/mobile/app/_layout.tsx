import "../global.css";
import { Stack } from "expo-router";
import { useShareIntent } from "expo-share-intent";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Theme } from "../lib/theme";
import * as SplashScreen from "expo-splash-screen";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
    const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

    useEffect(() => {
        if (hasShareIntent && shareIntent.type === "weburl") {
            console.log("🚀 Sifting URL from Share Sheet:", shareIntent.webUrl);
            // TODO: Handle the URL (e.g., navigate to a specific screen or call an API)
            resetShareIntent();
        }
    }, [hasShareIntent, shareIntent, resetShareIntent]);

    useEffect(() => {
        // Hide splash screen once layout is mounted
        SplashScreen.hideAsync();
    }, []);

    return (
        <GestureHandlerRootView className="flex-1 bg-canvas">
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: Theme.colors.background },
                }}
            />
        </GestureHandlerRootView>
    );
}
