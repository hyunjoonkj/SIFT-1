import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';

interface SafeContentRendererProps {
    content: string;
}

const SafeContentRenderer: React.FC<SafeContentRendererProps> = ({ content }) => {
    // Guard Clause: If content is null/undefined, don't crash
    if (!content) return <Text style={styles.placeholder}>No summary available.</Text>;

    let parsedData: any;
    let isJson = false;

    // 1. Try to parse it as JSON
    try {
        parsedData = JSON.parse(content);
        // basic check to ensure it's not just a JSON string "Hello"
        if (typeof parsedData === 'object' && parsedData !== null) {
            isJson = true;
        }
    } catch (e) {
        // If it crashes, it's just plain text. Ignore the error.
        isJson = false;
    }

    // 2. SCENARIO A: It is Plain Text / Markdown (TikTok / New Sifts)
    if (!isJson) {
        // Use Markdown renderer for better native appearance than raw text
        return (
            <View style={styles.markdownContainer}>
                <Markdown style={markdownStyles}>
                    {content}
                </Markdown>
            </View>
        );
    }

    // 3. SCENARIO B: It is JSON (Instagram / Recipe)
    // We handle the specific fields we discussed earlier
    return (
        <View style={styles.container}>
            {/* If it has a specific 'summary' field inside the JSON */}
            {parsedData.summary && (
                <Text style={styles.bodyText}>{parsedData.summary}</Text>
            )}

            {/* Render Ingredients if present */}
            {parsedData.Inputs && (
                <View style={styles.section}>
                    <Text style={styles.header}>Ingredients</Text>
                    {typeof parsedData.Inputs === 'object' && !Array.isArray(parsedData.Inputs) ? (
                        // Handle Grouped Ingredients (Object)
                        Object.entries(parsedData.Inputs).map(([key, value]) => (
                            <View key={key} style={styles.groupContainer}>
                                <Text style={styles.subHeader}>{key}</Text>
                                {Array.isArray(value) && value.map((item: any, i: number) => (
                                    <View key={i} style={styles.row}>
                                        <Text style={styles.bullet}>•</Text>
                                        <Text style={styles.listItem}>{String(item)}</Text>
                                    </View>
                                ))}
                            </View>
                        ))
                    ) : (
                        // Handle Flat List (Array)
                        Array.isArray(parsedData.Inputs) && parsedData.Inputs.map((value: any, index: number) => (
                            <View key={index} style={styles.row}>
                                <Text style={styles.bullet}>•</Text>
                                <Text style={styles.listItem}>
                                    {String(value)}
                                </Text>
                            </View>
                        ))
                    )}
                </View>
            )}

            {/* Render Steps if present */}
            {parsedData.Actions && Array.isArray(parsedData.Actions) && (
                <View style={styles.section}>
                    <Text style={styles.header}>Steps</Text>
                    {parsedData.Actions.map((step: any, index: number) => (
                        <View key={index} style={styles.stepRow}>
                            <Text style={styles.stepNum}>{index + 1}.</Text>
                            <Text style={styles.listItem}>{String(step)}</Text>
                        </View>
                    ))}
                </View>
            )}

            {/* DEBUG LOGGING as requested */}
            {/* {console.log("DEBUG SIFT Content:", content.substring(0, 50))} */}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginTop: 8 },
    markdownContainer: { flex: 1 },
    bodyText: { fontSize: 16, lineHeight: 24, color: '#333', marginBottom: 16 },
    placeholder: { color: '#999', fontStyle: 'italic', padding: 20 },
    section: { marginTop: 16, marginBottom: 8 },
    groupContainer: { marginBottom: 16 },
    header: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#111', fontFamily: 'System' },
    subHeader: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: '#444', textTransform: 'uppercase', letterSpacing: 0.5 },
    row: { flexDirection: 'row', marginBottom: 8, paddingRight: 16 },
    stepRow: { flexDirection: 'row', marginBottom: 16, paddingRight: 16 },
    bullet: { marginRight: 8, fontSize: 18, color: '#555', lineHeight: 22 },
    stepNum: { marginRight: 12, fontWeight: '700', color: '#555', fontSize: 16 },
    listItem: { fontSize: 17, lineHeight: 24, color: '#37352F', flex: 1, fontFamily: 'System' },
});

const markdownStyles = {
    body: { fontSize: 17, lineHeight: 26, color: '#37352F', fontFamily: 'System' },
    heading1: { fontSize: 24, fontWeight: '700', marginTop: 20, marginBottom: 10, lineHeight: 30 },
    heading2: { fontSize: 20, fontWeight: '600', marginTop: 16, marginBottom: 8 },
    list_item: { marginBottom: 8 },
    bullet_list: { marginBottom: 10 },
};

export default SafeContentRenderer;
