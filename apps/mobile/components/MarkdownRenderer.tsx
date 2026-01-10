import React from 'react';
import { ScrollView, ScrollViewProps } from 'react-native';
import Markdown, { MarkdownProps } from 'react-native-markdown-display';
import { markdownStyles } from '../lib/markdownStyles';

// Helper to avoid import errors if MarkdownProps isn't exported
type SafeMarkdownProps = React.ComponentProps<typeof Markdown>;

interface MarkdownRendererProps extends SafeMarkdownProps {
    scrollable?: boolean;
}

export function MarkdownRenderer({ children, scrollable = false, style, ...props }: MarkdownRendererProps) {
    const mergedStyles = { ...markdownStyles, ...style };

    if (scrollable) {
        return (
            <ScrollView>
                <Markdown style={mergedStyles} {...props}>
                    {children}
                </Markdown>
            </ScrollView>
        );
    }

    return (
        <Markdown style={mergedStyles} {...props}>
            {children}
        </Markdown>
    );
}
