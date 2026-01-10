import React from 'react';
import { ScrollView, View, Text, ViewProps } from 'react-native';
import { Block } from './Block';

interface PageContainerProps extends ViewProps {
    children?: React.ReactNode;
    /**
      * If content is sparse, show ghost blocks to encourage input.
      * In a real app, this might be calculated based on children count or passed explicitly.
      */
    showGhostBlocks?: boolean;
}

/**
 * The PageContainer
 * The blank canvas. Supports infinite scroll (placeholder) and "Ghost" states.
 */
export const PageContainer: React.FC<PageContainerProps> = ({
    children,
    showGhostBlocks = false,
    style,
    ...props
}) => {
    return (
        <View className="flex-1 bg-canvas-subtle" style={style} {...props}>
            <ScrollView
                className="flex-1"
                contentContainerStyle={{ paddingVertical: 24, paddingHorizontal: 16 }}
            >
                {/* Main Content Area - max width for readability on tablets/web */}
                <View className="w-full max-w-3xl mx-auto min-h-[80vh] bg-canvas shadow-sm rounded-none md:rounded-lg md:border md:border-border p-4 md:p-12">
                    {children}

                    {/* The Ghost Blocks ("The IKEA Effect") */}
                    {showGhostBlocks && (
                        <View className="mt-8 opacity-40">
                            <Block>
                                <Text className="text-ink-subtle text-base">+ Add your thoughts</Text>
                            </Block>
                            <View className="mt-2 h-4 w-3/4 bg-border/20 rounded" />
                            <View className="mt-2 h-4 w-1/2 bg-border/20 rounded" />
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
};
