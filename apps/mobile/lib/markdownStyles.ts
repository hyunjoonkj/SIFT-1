import { StyleSheet, Platform } from 'react-native';

const ink = '#37352F';
const border = '#E3E2E0';

export const markdownStyles = StyleSheet.create({
    body: {
        fontSize: 16,
        lineHeight: 24,
        color: ink,
        fontFamily: Platform.select({ ios: 'System', default: 'sans-serif' }),
    },
    heading1: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: 8,
        marginTop: 24,
        color: ink,
    },
    heading2: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 8,
        marginTop: 20,
        color: ink,
        borderBottomWidth: 1,
        borderBottomColor: border,
        paddingBottom: 4,
    },
    heading3: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
        marginTop: 16,
        color: ink,
    },
    blockquote: {
        backgroundColor: '#F7F7F5', // Sidebar grey often used for callouts
        borderLeftWidth: 3,
        borderLeftColor: ink,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginVertical: 8,
        borderRadius: 4,
    },
    code_inline: {
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
        backgroundColor: '#F7F7F5',
        color: '#EB5757', // Notion-ish red for code
        fontSize: 14,
        paddingHorizontal: 4,
        borderRadius: 4,
    },
    code_block: {
        fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
        backgroundColor: '#F7F7F5',
        padding: 16,
        borderRadius: 4,
        fontSize: 13,
        color: ink,
    },
    list_item: {
        marginBottom: 4,
    },
    bullet_list: {
        marginBottom: 8,
    },
    link: {
        color: ink,
        textDecorationLine: 'underline',
        textDecorationStyle: 'dotted', // Gentle underline
        opacity: 0.8,
    },
});
