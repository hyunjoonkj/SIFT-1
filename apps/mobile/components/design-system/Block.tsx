import React from 'react';
import { View, ViewProps } from 'react-native';

interface BlockProps extends ViewProps {
    children: React.ReactNode;
    /** Visual indicator for drag-and-drop availability (future proofing) */
    draggable?: boolean;
}

/**
 * The Block (Base Primitive)
 * A content wrapper with consistent vertical spacing and optional drag-handles.
 */
export const Block: React.FC<BlockProps> = ({ children, draggable, style, ...props }) => {
    return (
        <View
            className="flex-row items-start py-1 px-1 my-0.5"
            style={style}
            {...props}
        >
            {draggable && (
                <View className="w-6 h-6 mr-2 items-center justify-center opacity-0 hover:opacity-100">
                    {/* Visual drag handle placeholder - typically 6 dots or similar */}
                    <View className="w-1 h-1 bg-ink-subtle rounded-full mb-0.5" />
                    <View className="w-1 h-1 bg-ink-subtle rounded-full mb-0.5" />
                    <View className="w-1 h-1 bg-ink-subtle rounded-full" />
                </View>
            )}
            <View className="flex-1">
                {children}
            </View>
        </View>
    );
};
