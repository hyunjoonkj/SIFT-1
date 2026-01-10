import "../global.css";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
    return (
        <GestureHandlerRootView className="flex-1 bg-canvas">
            <Stack
                screenOptions={{
                    headerShown: false,
                    contentStyle: { backgroundColor: "#FFFFFF" },
                }}
            />
        </GestureHandlerRootView>
    );
}
