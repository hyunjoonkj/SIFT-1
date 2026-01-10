import React from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { FileText, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Reanimated, { useAnimatedStyle, useSharedValue, SharedValue } from 'react-native-reanimated';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

interface PageCardProps {
    id: string;
    title: string;
    gist: string;
    tags?: string[];
    onDelete?: (id: string) => void;
}

export function PageCard({ id, title, gist, tags = [], onDelete }: PageCardProps) {
    const router = useRouter();

    const handlePress = () => {
        router.push(`/page/${id}`);
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

    const RightAction = (prog: SharedValue<number>, drag: SharedValue<number>) => {
        // Simple red background for now
        return (
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleDelete}
                className="bg-[#EF4444] justify-center items-center w-20 rounded-lg mb-3 ml-2"
            >
                <Trash2 size={24} color="white" />
            </TouchableOpacity>
        );
    };

    return (
        <ReanimatedSwipeable
            containerStyle={{ overflow: 'visible' }}
            renderRightActions={RightAction}
            overshootRight={false}
        >
            <TouchableOpacity
                onPress={handlePress}
                activeOpacity={0.7}
                className="bg-white p-4 rounded-lg border border-border mb-3 shadow-sm"
            >
                <View className="flex-row items-start mb-2">
                    <View className="mt-1 mr-2 opacity-60">
                        <FileText size={18} color="#37352F" />
                    </View>
                    <Text className="text-ink font-sans font-semibold text-lg flex-1 leading-6">
                        {title}
                    </Text>
                </View>

                <Text className="text-ink/60 font-sans text-sm leading-5 mb-3" numberOfLines={2}>
                    {gist}
                </Text>

                {tags.length > 0 && (
                    <View className="flex-row flex-wrap gap-2">
                        {tags.map((tag, index) => (
                            <View key={index} className="bg-sidebar px-2 py-1 rounded-md border border-border">
                                <Text className="text-ink/50 text-xs font-mono">{tag}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </TouchableOpacity>
        </ReanimatedSwipeable>
    );
}
