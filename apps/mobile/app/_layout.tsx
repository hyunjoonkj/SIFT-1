import "../global.css";
import { Stack } from "expo-router";
import { useShareIntent } from "expo-share-intent";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Theme } from "../lib/theme";
import * as SplashScreenIs from "expo-splash-screen";
import * as SecureStore from 'expo-secure-store';
import { View, Text } from "react-native";
import SplashScreen from "../components/SplashScreen";
import Onboarding from "../components/Onboarding";

// Safe Splash Screen Prevention
try {
    SplashScreenIs.preventAutoHideAsync().catch(() => { });
} catch (e) {
    // Ignore native module missing
}

export default function RootLayout() {
    const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

    useEffect(() => {
        // Safe Hide
        try {
            SplashScreenIs.hideAsync().catch(err => console.warn("Splash hide error", err));
        } catch (e) { }
    }, []);

    useEffect(() => {
        if (hasShareIntent && shareIntent.type === "weburl") {
            console.log("🚀 Sifting URL from Share Sheet:", shareIntent.webUrl);
            // TODO: Handle the URL (e.g., navigate to a specific screen or call an API)
            resetShareIntent();
        }
    }, [hasShareIntent, shareIntent, resetShareIntent]);

    const [appReady, setAppReady] = useState(false);
    const [splashAnimationFinished, setSplashAnimationFinished] = useState(false);
    const [splashDismissed, setSplashDismissed] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);

    useEffect(() => {
        // Check Onboarding state & Prepare resources
        async function prepare() {
            try {
                // Check if user has completed onboarding (Mocking secure store check for now or implementing)
                const hasLaunched = await SecureStore.getItemAsync('has_launched');
                if (hasLaunched !== 'true') {
                    setShowOnboarding(true);
                }
            } catch (e) {
                console.warn(e);
            } finally {
                setAppReady(true);
            }
        }
        prepare();
    }, []);

    // Combine states to determine when to dismiss splash
    useEffect(() => {
        if (appReady && splashAnimationFinished) {
            setSplashDismissed(true);
        }
    }, [appReady, splashAnimationFinished]);

    // 1. Show Splash until animation finishes AND app is ready
    if (!splashDismissed) {
        return (
            <SplashScreen
                onFinish={() => setSplashAnimationFinished(true)}
            />
        );
    }

    // 2. Show Onboarding if needed
    if (showOnboarding) {
        return (
            <Onboarding
                onComplete={() => {
                    setShowOnboarding(false);
                    // Force refresh or just let state update mount Stack
                }}
            />
        );
    }

    return (
        <GestureHandlerRootView className="flex-1 bg-canvas">
            <Stack initialRouteName="(tabs)" screenOptions={{ contentStyle: { backgroundColor: Theme.colors.background } }}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="share" options={{ headerShown: false, presentation: 'modal' }} />
                <Stack.Screen name="+not-found" options={{ headerShown: false }} />
            </Stack>
        </GestureHandlerRootView>
    );
}
