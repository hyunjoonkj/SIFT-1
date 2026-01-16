import React, { useCallback, useState } from 'react';
import { View, TextInput, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { Typography } from '../../components/design-system/Typography';
import { Theme } from '../../lib/theme';
import { MagnifyingGlass, Sliders, ArrowUpRight } from 'phosphor-react-native';
import { supabase } from '../../lib/supabase';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - (Theme.spacing.l * 2) - 15) / 2;

interface SiftItem {
    id: string;
    title: string;
    url: string;
    tags: string[];
    created_at: string;
    metadata?: {
        image_url?: string;
        category?: string;
    };
}

export default function SiftScreen() {
    const [pages, setPages] = useState<SiftItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchPages = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('pages')
                .select('*')
                .eq('is_archived', false)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPages(data || []);
        } catch (error) {
            console.error('Error fetching sifts:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchPages();
        }, [fetchPages])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchPages();
    };

    const filteredPages = pages.filter(p => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            p.title?.toLowerCase().includes(q) ||
            p.url?.toLowerCase().includes(q) ||
            p.tags?.some(t => t.toLowerCase().includes(q))
        );
    });

    if (loading && !refreshing) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator color={Theme.colors.primary} />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* 1. HEADER */}
            <View style={styles.header}>
                <Typography variant="h1">Sift</Typography>
                <TouchableOpacity style={styles.filterButton}>
                    <Sliders size={20} color={Theme.colors.text.primary} />
                </TouchableOpacity>
            </View>

            {/* 2. SEARCH BAR */}
            <View style={styles.searchContainer}>
                <MagnifyingGlass size={18} color={Theme.colors.text.tertiary} style={styles.searchIcon} />
                <TextInput
                    style={styles.input}
                    placeholder="Search your curation..."
                    placeholderTextColor={Theme.colors.text.tertiary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    autoCapitalize="none"
                />
            </View>

            {/* 3. MASONRY GRID */}
            <ScrollView
                contentContainerStyle={styles.gridContainer}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />
                }
            >
                <View style={styles.column}>
                    {filteredPages.filter((_, i) => i % 2 === 0).map((item) => (
                        <Card key={item.id} item={item} />
                    ))}
                </View>
                <View style={styles.column}>
                    {filteredPages.filter((_, i) => i % 2 !== 0).map((item) => (
                        <Card key={item.id} item={item} />
                    ))}
                </View>

                {filteredPages.length === 0 && (
                    <View style={styles.emptyState}>
                        <Typography variant="body" style={{ textAlign: 'center', opacity: 0.5 }}>
                            {searchQuery ? "No results found." : "No sifts yet."}
                        </Typography>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const Card = ({ item }: { item: SiftItem }) => (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
        <Image
            source={{ uri: item.metadata?.image_url || 'https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?q=80&w=400' }}
            style={styles.cardImage}
        />
        <View style={styles.cardInfo}>
            <Typography variant="h2" style={styles.cardTitle}>{item.title}</Typography>
            <Typography variant="caption" style={styles.cardTag}>
                {item.tags?.[0] || item.metadata?.category || 'Sifted'}
            </Typography>
        </View>
        <View style={styles.iconBadge}>
            <ArrowUpRight size={14} color="#FFF" weight="bold" />
        </View>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Theme.colors.background
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Theme.spacing.l,
        marginTop: 10,
        marginBottom: 20,
    },
    filterButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: Theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#FFF',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: Theme.spacing.l,
        marginBottom: 25,
        paddingHorizontal: 15,
        height: 48,
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    searchIcon: {
        marginRight: 10
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: Theme.colors.text.primary,
        fontFamily: 'System',
    },
    gridContainer: {
        flexDirection: 'row',
        paddingHorizontal: Theme.spacing.l,
        paddingBottom: 140
    },
    column: {
        width: COLUMN_WIDTH,
        gap: 15
    },
    card: {
        borderRadius: 16,
        backgroundColor: '#FFF',
        overflow: 'hidden',
        marginBottom: 15,
        ...Theme.shadows.card,
        borderWidth: 1,
        borderColor: Theme.colors.border,
    },
    cardImage: {
        width: '100%',
        height: 180,
        resizeMode: 'cover'
    },
    cardInfo: {
        padding: 12
    },
    cardTitle: {
        fontSize: 14,
        marginBottom: 4
    },
    cardTag: {
        color: Theme.colors.text.tertiary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    iconBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        width: width - (Theme.spacing.l * 2),
        padding: 40,
        alignItems: 'center',
    }
});
