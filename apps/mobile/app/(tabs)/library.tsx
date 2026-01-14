import React, { useCallback, useState, useEffect } from 'react';
import { View, ActivityIndicator, TextInput, Text, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import LibraryGrid, { Collection } from '../../components/LibraryGrid';
import { Toast } from '../../components/Toast';
import { Search } from 'lucide-react-native';
import SiftFeed from '../../components/SiftFeed';
import { Theme } from '../../lib/theme';

interface Page {
    id: string;
    title: string;
    summary: string;
    tags: string[];
    created_at: string;
    url: string;
    metadata?: {
        image_url?: string;
        category?: string;
    };
}

export default function LibraryScreen() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false); // Can pass to Grid if needed, or handle here
    const [toastMessage, setToastMessage] = useState("");
    const [toastVisible, setToastVisible] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Derived: Search Filtering
    const filteredPages = searchQuery.trim() === ""
        ? []
        : pages.filter(p => {
            const q = searchQuery.toLowerCase();
            return (
                p.title?.toLowerCase().includes(q) ||
                p.summary?.toLowerCase().includes(q) ||
                p.url?.toLowerCase().includes(q) ||
                p.tags?.some(t => t.toLowerCase().includes(q))
            );
        });

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
            console.error('Error fetching library:', error);
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

    // Grouping Logic for "Magazine Rack"
    const CATEGORIES = ["Food", "Skincare", "Aesthetics", "Intel", "Wellness"];

    // Legacy & Expanded Tag Mapping
    const TAG_MAPPING: Record<string, string> = {
        // Food Vertical
        'Gastronomy': 'Food', // Old vertical name
        'Cooking': 'Food',
        'Baking': 'Food',
        'Recipes': 'Food',
        'Restaurants': 'Food',
        'Food': 'Food',

        // Skincare Vertical
        'Beauty': 'Skincare',
        'Makeup': 'Skincare',
        'Dermatology': 'Skincare',
        'Routine': 'Skincare',
        'Skincare': 'Skincare',

        // Aesthetics Vertical
        'Fashion': 'Aesthetics',
        'Style': 'Aesthetics',
        'Art': 'Aesthetics',
        'Design': 'Aesthetics',
        'Interior': 'Aesthetics',
        'Aesthetics': 'Aesthetics',

        // Intel Vertical
        'Tech': 'Intel',
        'Coding': 'Intel',
        'AI': 'Intel',
        'Business': 'Intel',
        'Finance': 'Intel',
        'Career': 'Intel',
        'News': 'Intel',
        'Intel': 'Intel',

        // Wellness Vertical
        'Health': 'Wellness',
        'Fitness': 'Wellness',
        'Gym': 'Wellness',
        'Mental Health': 'Wellness',
        'Lifestyle': 'Wellness',
        'Wellness': 'Wellness'
    };

    // Basic map to store category data
    const collectionsMap = new Map<string, { count: number; latestImage: string | null; hasNew: boolean }>();

    // Initialize map
    CATEGORIES.forEach(cat => {
        collectionsMap.set(cat, { count: 0, latestImage: null, hasNew: false });
    });

    pages.forEach(page => {
        // Set to track which categories this page has already been counted towards
        const matchedCategories = new Set<string>();

        // 1. Check Metadata Category
        if (page.metadata?.category && TAG_MAPPING[page.metadata.category]) {
            matchedCategories.add(TAG_MAPPING[page.metadata.category]);
        } else if (page.metadata?.category && CATEGORIES.includes(page.metadata.category)) {
            matchedCategories.add(page.metadata.category);
        }

        // 2. Check All Tags (Allow Multi-Stack)
        if (page.tags && page.tags.length > 0) {
            page.tags.forEach(tag => {
                // Direct match?
                if (CATEGORIES.includes(tag)) {
                    matchedCategories.add(tag);
                }
                // Mapped match?
                else if (TAG_MAPPING[tag]) {
                    matchedCategories.add(TAG_MAPPING[tag]);
                }
            });
        }

        // If no matches, should we put it in Random? or just ignore?
        // Usually Magazine Rack strict mode ignores "Random" stuff unless we have a specific "Random" stack.
        // We do have "Random" in the list below, but not in CATEGORIES array above.
        // Let's assume strict vertical filtering for the main rack.

        // Increment counts for all matched categories
        matchedCategories.forEach(cat => {
            if (collectionsMap.has(cat)) {
                const current = collectionsMap.get(cat)!;
                current.count++;

                // Check New
                const isNew = (new Date().getTime() - new Date(page.created_at).getTime()) < 86400000;
                if (isNew) current.hasNew = true;

                // Latest Image - Logic: Since pages are sorted DESC, 
                // the first page encountered for a category IS the latest one.
                // So if we don't have an image yet, this is the one!
                if (!current.latestImage && page.metadata?.image_url) {
                    current.latestImage = page.metadata.image_url;
                }
            }
        });
    });

    // Archive Count (Optional: Fetch real count if needed, for now placeholder or use Ghost logic)
    // We aren't fetching archived pages, so count is 0.

    const getCoverImage = (category: string) => {
        const strictCovers: Record<string, string> = {
            Food: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1000&auto=format&fit=crop',
            Skincare: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=1000',
            Aesthetics: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae',
            Intel: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b',
            Wellness: 'https://images.unsplash.com/photo-1544367563-12123d8965cd',
            Random: 'https://images.unsplash.com/photo-1485846234645-a62644f84728',
        };
        return strictCovers[category] || strictCovers['Random'];
    };

    const collections: Collection[] = CATEGORIES.map((title, index) => {
        const data = collectionsMap.get(title) || { count: 0, latestImage: null, hasNew: false };
        return {
            id: String(index),
            title,
            count: data.count,
            image: data.latestImage || getCoverImage(title), // Dynamic Cover OR Fallback
            isNew: data.hasNew
        };
    });

    // Add Archive at the end
    collections.push({
        id: '99',
        title: 'Archive',
        count: 0, // Always 0 to show dashed state for now
        image: '',
        isNew: false
    });

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: '#F7F7F5' }}>
            {/* Header with Search (Notion Style) */}
            <View className="px-5 pt-16 pb-4 bg-[#F7F7F5]">
                <Text style={{ fontFamily: 'System', fontWeight: '700', fontSize: 34, color: '#37352F', letterSpacing: -0.5, marginBottom: 16 }}>
                    Library
                </Text>

                <View
                    style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        backgroundColor: '#E3E3E8', // Apple Standard Fill
                        height: 48, // Taller touch target
                        borderRadius: 12, // Softer corners
                        paddingHorizontal: 16
                    }}
                >
                    <Search size={20} color="#8E8E93" />
                    <TextInput
                        className="flex-1 text-[17px] ml-2 text-[#1C1C1E] h-full"
                        placeholder="Search your mind..."
                        placeholderTextColor="#8E8E93"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        autoCapitalize="none"
                        clearButtonMode="while-editing"
                        selectionColor={Theme.colors.primary} // Brand color cursor
                    />
                </View>
            </View>

            {/* Content Switcher */}
            {searchQuery.trim() !== "" ? (
                <ScrollView
                    className="flex-1"
                    contentContainerClassName="pt-4 pb-32"
                    keyboardDismissMode="on-drag"
                >
                    <SiftFeed
                        pages={filteredPages}
                        // Loading here is tricky because we might search client-side
                        // But SiftFeed handles "pages=[]" gracefully.
                        // Let's pass parent loading state just in case we are initial fetching.
                        loading={loading && filteredPages.length === 0}
                        onArchive={() => { }}
                        onPin={() => { }}
                        onDeleteForever={() => { }}
                    />
                    {filteredPages.length === 0 && (
                        <View className="mt-12 items-center justify-center opacity-60">
                            <Text className="text-[#37352F] font-medium">No results found</Text>
                        </View>
                    )}
                </ScrollView>
            ) : (
                <LibraryGrid collections={collections} />
            )}

            <Toast
                message={toastMessage}
                visible={toastVisible}
                onHide={() => setToastVisible(false)}
            />
        </View>
    );
}
