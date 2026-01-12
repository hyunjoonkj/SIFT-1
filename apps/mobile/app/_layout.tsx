import "../global.css";
import { Stack } from "expo-router";
import { useShareIntent } from "expo-share-intent";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Theme } from "../lib/theme";
import * as SplashScreen from "expo-splash-screen";
import { View, Text } from "react-native";

// Prevent the splash screen from auto-hiding
SplashScreen.preventAutoHideAsync().catch(() => {
    /* reloading the app might trigger some race conditions, ignore them */
});

export default function RootLayout() {
    const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

    useEffect(() => {
        console.log("RootLayout mounted");
        // Hide splash screen once layout is mounted
        SplashScreen.hideAsync().catch(err => console.warn("Splash hide error", err));
    }, []);

    useEffect(() => {
        if (hasShareIntent && shareIntent.type === "weburl") {
            console.log("🚀 Sifting URL from Share Sheet:", shareIntent.webUrl);
            resetShareIntent();
        }
    }, [hasShareIntent, shareIntent, resetShareIntent]);

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
