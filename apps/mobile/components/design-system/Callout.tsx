import React from 'react';
import { View, Text } from 'react-native';
import { Block } from './Block';

interface CalloutProps {
    children: React.ReactNode;
    icon?: string; // Emoji character
}

/**
 * The Callout
 * A highlighted block used for the AI "Gist" summary and other highlights.
 */
export const Callout: React.FC<CalloutProps> = ({ children, icon = '💡' }) => {
    return (
        <Block>
            <View className="flex-row bg-canvas-subtle border border-border rounded-md p-4">
                {icon && (
                    <View className="mr-3 pt-0.5 select-none">
                        <Text className="text-lg leading-6">{icon}</Text>
                    </View>
                )}
                <View className="flex-1 justify-center">
                    {/* 
               We wrap children in a View to ensure text styling inherits correctly 
               if simple text is passed, though ideally children are styled Text nodes.
            */}
                    {children}
                </View>
            </View>
        </Block>
    );
};
