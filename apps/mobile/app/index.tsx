import { View, Text, FlatList, RefreshControl, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState, useCallback } from "react";
import * as Linking from 'expo-linking';
import Constants from 'expo-constants';
import { supabase } from "../lib/supabase";
import { PageCard } from "../components/PageCard";
import { Toast } from "../components/Toast";

interface Page {
    id: string;
    title: string;
    summary: string;
    tags: string[];
    created_at: string;
}

export default function Index() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastVisible, setToastVisible] = useState(false);
    const [manualUrl, setManualUrl] = useState("");


    const showToast = (message: string) => {
        setToastMessage(message);
        setToastVisible(true);
    };

    const fetchPages = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('pages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching pages:', error);
            } else if (data) {
                setPages(data);
            }
        } catch (e) {
            console.error('Exception fetching pages:', e);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // API Handling
    const processSharedUrl = async (url: string) => {
        console.log('Processing shared URL:', url);
        showToast("Sifting...");

        try {
            // Dynamically determine host for dev environment
            const debuggerHost = Constants.expoConfig?.hostUri;
            const localhost = debuggerHost?.split(':')[0] || 'localhost';
            const apiUrl = `http://${localhost}:3000/api/sift`;

            console.log('Calling API at:', apiUrl);

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: url,
                    platform: 'share_sheet',
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('API Error:', text);
                throw new Error('API failed');
            }

            // Success is handled by Realtime subscription
            showToast("Sifted!");

        } catch (error) {
            console.error('Error processing URL:', error);
            showToast("Error sifting");
        }
    };

    const handleDeepLink = useCallback((event: Linking.EventType) => {
        const { url } = event;
        const parsed = Linking.parse(url);

        // Expected format: sift://share?url=https...
        if (parsed.queryParams?.url) {
            const targetUrl = parsed.queryParams.url as string;
            processSharedUrl(targetUrl);
        }
    }, []);

    useEffect(() => {
        fetchPages();

        // Deep Linking
        const getInitialURL = async () => {
            const initialUrl = await Linking.getInitialURL();
            if (initialUrl) {
                console.log('Initial URL:', initialUrl);
                const parsed = Linking.parse(initialUrl);
                if (parsed.queryParams?.url) {
                    processSharedUrl(parsed.queryParams.url as string);
                }
            }
        };

        getInitialURL();
        const listener = Linking.addEventListener('url', handleDeepLink);

        // Realtime Subscription
        const subscription = supabase
            .channel('public:pages')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'pages' },
                (payload) => {
                    console.log('New page received:', payload.new);
                    setPages((prev) => [payload.new as Page, ...prev]);
                    showToast("New Page Received");
                }
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
            listener.remove();
        };
    }, [fetchPages, handleDeepLink]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchPages();
    }, [fetchPages]);

    useEffect(() => {
        // console.log("--- INDEX SCREEN MOUNTED ---");
    }, []);

    const deletePage = async (id: string) => {
        try {
            const { error } = await supabase.from('pages').delete().eq('id', id);
            if (error) throw error;
            setPages((prev) => prev.filter((p) => p.id !== id));
            showToast("Page Deleted");
        } catch (error) {
            console.error('Error deleting page:', error);
            showToast("Delete failed");
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-canvas">
            <View className="px-4 py-2 border-b border-border/50 bg-canvas z-10">
                <Text className="text-2xl font-sans font-bold text-ink">Sift</Text>
            </View>

            <FlatList
                data={pages}
                keyExtractor={(item) => item.id}
                contentContainerClassName="p-4 pb-20"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#37352F" />
                }
                ListEmptyComponent={() => (
                    <View className="mt-8 p-4 bg-sidebar rounded-lg border border-border items-center">
                        <Text className="text-ink font-mono text-sm">No pages yet.</Text>
                        <Text className="text-ink/60 text-xs mt-2">Paste a link above or share to Sift.</Text>
                    </View>
                )}
                ListHeaderComponent={
                    <View className="mb-4 flex-row gap-2">
                        <TextInput
                            className="flex-1 bg-white border border-border rounded-lg px-3 py-2 text-ink font-sans"
                            placeholder="Paste a URL to sift..."
                            placeholderTextColor="#9CA3AF"
                            value={manualUrl}
                            onChangeText={setManualUrl}
                            autoCapitalize="none"
                            autoCorrect={false}
                            keyboardType="url"
                            returnKeyType="go"
                            onSubmitEditing={() => {
                                if (manualUrl.trim()) {
                                    processSharedUrl(manualUrl.trim());
                                    setManualUrl("");
                                }
                            }}
                        />
                        <TouchableOpacity
                            className="bg-ink px-4 py-2 rounded-lg justify-center items-center active:opacity-80"
                            onPress={() => {
                                if (manualUrl.trim()) {
                                    processSharedUrl(manualUrl.trim());
                                    setManualUrl("");
                                }
                            }}
                        >
                            <Text className="text-white font-sans font-semibold">Sift</Text>
                        </TouchableOpacity>
                    </View>
                }
                renderItem={({ item }) => (
                    <PageCard
                        id={item.id}
                        title={item.title}
                        gist={item.summary}
                        tags={item.tags}
                        onDelete={deletePage}
                    />
                )}
            />


            <Toast
                message={toastMessage}
                visible={toastVisible}
                onHide={() => setToastVisible(false)}
            />
        </SafeAreaView>
    );
}
