import React from 'react';
import { View, Text, Animated } from 'react-native';

interface NotionToastProps {
    visible: boolean;
    message: string;
}

/**
 * The NotionToast
 * A pill-shaped, black background notification that appears at the bottom-center.
 */
export const NotionToast: React.FC<NotionToastProps> = ({ visible, message }) => {
    if (!visible) return null;

    return (
        <View className="absolute bottom-10 left-0 right-0 items-center justify-center z-50 pointer-events-none">
            <View className="px-4 py-2 bg-ink rounded-full shadow-lg">
                <Text className="text-canvas text-sm font-medium">{message}</Text>
            </View>
        </View>
    );
};
