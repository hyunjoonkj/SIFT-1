import React from 'react';
import { View, Alert, Pressable, Image, Text, ActionSheetIOS, Platform } from 'react-native';
import { FileText, Trash2, Pin } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, SharedValue } from 'react-native-reanimated';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import { Card } from './design-system/Card';
import { Typography } from './design-system/Typography';
import { Theme } from '../lib/theme';

interface PageCardProps {
    id: string;
    title: string;
    gist: string;
    url?: string;
    tags?: string[];
    onDelete?: (id: string) => void;
    onDeleteForever?: (id: string) => void;
    onPin?: (id: string) => void;
    isPinned?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PageCard({ id, title, gist, url, tags = [], onDelete, onDeleteForever, onPin, isPinned, imageUrl }: PageCardProps & { imageUrl?: string }) {
    const router = useRouter();
    const scale = useSharedValue(1);
    const [imageError, setImageError] = React.useState(false);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    // Fallback Title Logic
    const displayTitle = (title && title !== 'Untitled Page') ? title : (url ? new URL(url).hostname.replace('www.', '') : 'Untitled Page');
    const domain = url ? new URL(url).hostname.replace('www.', '') : '';

    // Formatting Tags: Primary Tag • Domain
    const ALLOWED_TAGS = ["Cooking", "Baking", "Tech", "Health", "Lifestyle", "Professional"];
    const validTags = tags.filter(t => ALLOWED_TAGS.includes(t));
    const primaryTag = validTags[0] || 'Lifestyle'; // Default to Lifestyle if no valid tag found
    const tagLine = `${primaryTag}  •  ${domain}`.toUpperCase();

    // Hide summary if empty or "No summary generated"
    const showSummary = gist && gist !== "No summary generated.";

    const handlePressIn = () => {
        scale.value = withSpring(0.98, { damping: 10, stiffness: 300 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 10, stiffness: 300 });
    };

    const handlePress = () => {
        router.push(`/page/${id}`);
    };

    const handleLongPress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        if (Platform.OS === 'ios') {
            ActionSheetIOS.showActionSheetWithOptions(
                {
                    options: ['Cancel', 'Copy Link', 'Pin/Unpin Page', 'Archive Page', 'Delete Permanently'],
                    destructiveButtonIndex: 4,
                    cancelButtonIndex: 0,
                    userInterfaceStyle: 'light',
                },
                (buttonIndex) => {
                    if (buttonIndex === 1) { // Copy Link
                        if (url) Clipboard.setStringAsync(url);
                    } else if (buttonIndex === 2) { // Pin
                        onPin?.(id);
                    } else if (buttonIndex === 3) { // Archive
                        onDelete?.(id);
                    } else if (buttonIndex === 4) { // Delete Forever
                        Alert.alert(
                            "Delete Permanently",
                            "This cannot be undone.",
                            [
                                { text: "Cancel", style: "cancel" },
                                { text: "Delete", style: "destructive", onPress: () => onDeleteForever?.(id) }
                            ]
                        );
                    }
                }
            );
        } else {
            // Android Alert
            Alert.alert(
                "Options",
                displayTitle,
                [
                    { text: "Copy Link", onPress: () => url && Clipboard.setStringAsync(url) },
                    { text: "Pin/Unpin", onPress: () => onPin?.(id) },
                    { text: "Archive", onPress: () => onDelete?.(id) },
                    {
                        text: "Delete Permanently", style: 'destructive', onPress: () => {
                            Alert.alert(
                                "Delete Permanently",
                                "This cannot be undone.",
                                [
                                    { text: "Cancel", style: "cancel" },
                                    { text: "Delete", style: "destructive", onPress: () => onDeleteForever?.(id) }
                                ]
                            );
                        }
                    },
                    { text: "Cancel", style: "cancel" }
                ]
            );
        }
    };

    const handleDelete = () => {
        Alert.alert(
            "Delete Page",
            "Are you sure you want to delete this page?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => onDelete?.(id)
                }
            ]
        );
    };

    const RightAction = () => {
        return (
            <Pressable
                onPress={handleDelete}
                className="bg-red-500 justify-center items-center w-20 rounded-[16px] mb-3 ml-2"
                style={{ height: '100%', maxHeight: 300 }}
            >
                <Trash2 size={24} color="white" />
            </Pressable>
        );
    };

    return (
        <ReanimatedSwipeable
            containerStyle={{ overflow: 'visible' }}
            renderRightActions={RightAction}
            overshootRight={false}
        >
            <AnimatedPressable
                onPress={handlePress}
                onLongPress={handleLongPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                style={animatedStyle}
                className="mb-6" // Increased spacing between cards
            >
                <View
                    className="bg-white rounded-[12px] overflow-hidden border border-gray-100" // Flatter: removed generic Card shadow, added border
                    // Optional: Very subtle shadow if needed, but 'flatter' is more modern
                    style={{
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.03, // Ultra subtle
                        shadowRadius: 8,
                        elevation: 2
                    }}
                >
                    {/* Pin Indicator */}
                    {isPinned && (
                        <View className="absolute top-3 right-3 z-10 bg-white/90 p-1.5 rounded-full shadow-sm backdrop-blur-md">
                            <Pin size={10} color={Theme.colors.text.primary} fill={Theme.colors.text.primary} />
                        </View>
                    )}

                    {/* 1. Cover Image - Taller, more immersive with Fallback */}
                    {imageUrl && (
                        <Image
                            source={imageError ? require('../assets/covers/gastronomy.jpg') : { uri: imageUrl }}
                            style={{ width: '100%', height: 180 }}
                            resizeMode="cover"
                            className="bg-gray-50"
                            onError={() => setImageError(true)}
                        />
                    )}

                    <View className="p-4 pt-3"> {/* Reduced top padding to bring text closer to image */}

                        {/* 2. Refined Eyebrow - Minimalist */}
                        <View className="flex-row items-center mb-1.5 opacity-70">
                            <Text className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px]">
                                {domain || 'SIFT'}
                            </Text>
                        </View>

                        {/* 3. Title - Elegant Serif or Clean Sans */}
                        {/* Using standard font but ensuring tracking/height is refined */}
                        <Text className="text-[18px] font-medium text-gray-900 leading-[24px] tracking-tight mb-1.5">
                            {displayTitle}
                        </Text>

                        {/* 4. Body - Secondary, lighter */}
                        {showSummary && (
                            <Text
                                className="text-[14px] text-gray-500 leading-[20px]"
                                numberOfLines={2}
                            >
                                {gist}
                            </Text>
                        )}
                    </View>
                </View>
            </AnimatedPressable>
        </ReanimatedSwipeable>
    );
}
