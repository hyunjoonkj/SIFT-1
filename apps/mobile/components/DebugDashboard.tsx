import { View, Text, Button } from 'react-native';
import { useShareIntent } from 'expo-share-intent';
import * as Clipboard from 'expo-clipboard';

export default function DebugDashboard() {
    const { hasShareIntent, shareIntent, resetShareIntent } = useShareIntent();

    const copyToClipboard = async () => {
        if (shareIntent?.webUrl) {
            await Clipboard.setStringAsync(shareIntent.webUrl);
        }
    };

    return (
        <View style={{ padding: 20, backgroundColor: '#FFF0F0', marginVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#ffcccb' }}>
            <Text style={{ fontWeight: 'bold', color: 'red', marginBottom: 8 }}>🔧 DEBUG DASHBOARD (Layer 1)</Text>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontWeight: '600' }}>State:</Text>
                <Text>{hasShareIntent ? "🟢 Data Waiting" : "⚪️ Idle"}</Text>
            </View>

            <Text style={{ fontWeight: '600', marginTop: 4 }}>Current Value:</Text>
            <Text style={{ fontFamily: 'Courier', fontSize: 11, backgroundColor: '#fff', padding: 4, marginVertical: 4 }}>
                {shareIntent?.webUrl || "NULL"}
                {shareIntent?.type ? `\n(Type: ${shareIntent.type})` : ""}
            </Text>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <Button title="Force Clear" onPress={() => resetShareIntent()} color="red" />
                <Button title="Copy Value" onPress={copyToClipboard} />
            </View>
        </View>
    );
}
