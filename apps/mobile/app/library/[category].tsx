import React, { useEffect, useState, useCallback } from 'react';
import { View, ActivityIndicator, SafeAreaView } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import SiftFeed from '../../components/SiftFeed';
import { Typography } from '../../components/design-system/Typography';
import { Theme } from '../../lib/theme';

// Duplicate TAG_MAPPING or import it if better refactored. 
// For speed and isolation, I'll define the relevant mapping lookup here or using a shared helper.
// Actually, relying on the 'category' metadata is safest, but we want to catch mapped tags too.

const TAG_MAPPING: Record<string, string> = {
    // Food Vertical
    'Gastronomy': 'Food', 'Cooking': 'Food', 'Baking': 'Food', 'Recipes': 'Food',
    'Restaurants': 'Food', 'Food': 'Food',

    // Skincare Vertical
    'Beauty': 'Skincare', 'Makeup': 'Skincare', 'Dermatology': 'Skincare',
    'Routine': 'Skincare', 'Skincare': 'Skincare',

    // Aesthetics Vertical
    'Fashion': 'Aesthetics', 'Style': 'Aesthetics', 'Art': 'Aesthetics',
    'Design': 'Aesthetics', 'Interior': 'Aesthetics', 'Aesthetics': 'Aesthetics',

    // Intel Vertical
    'Tech': 'Intel', 'Coding': 'Intel', 'AI': 'Intel', 'Business': 'Intel',
    'Finance': 'Intel', 'Career': 'Intel', 'News': 'Intel', 'Intel': 'Intel',

    // Wellness Vertical
    'Health': 'Wellness', 'Fitness': 'Wellness', 'Gym': 'Wellness',
    'Mental Health': 'Wellness', 'Biology': 'Wellness', 'Lifestyle': 'Wellness', 'Wellness': 'Wellness'
};

export default function CategoryScreen() {
    const { category } = useLocalSearchParams<{ category: string }>();
    const [pages, setPages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const fetchCategoryPages = useCallback(async () => {
        if (!category) return;
        setLoading(true);
        try {
            // Fetch ALL non-archived pages (safest to filter client side for complex tag logic)
            // Or we could try to filter in SQL but Tags are an array. 
            // Client side filter is fine for personal library scale.
            const { data, error } = await supabase
                .from('pages')
                .select('*')
                .eq('is_archived', false)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const targetCategory = category; // already string

            const filtered = (data || []).filter(page => {
                // 1. Check Metadata
                if (page.metadata?.category === targetCategory) return true;
                if (page.metadata?.category && TAG_MAPPING[page.metadata.category] === targetCategory) return true;

                // 2. Check Tags
                if (page.tags && page.tags.length > 0) {
                    for (const tag of page.tags) {
                        if (tag === targetCategory) return true;
                        if (TAG_MAPPING[tag] === targetCategory) return true;
                    }
                }
                return false;
            });

            setPages(filtered);
        } catch (error) {
            console.error('Error fetching category:', error);
        } finally {
            setLoading(false);
        }
    }, [category]);

    useEffect(() => {
        fetchCategoryPages();
    }, [fetchCategoryPages]);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAFA' }}>
            <Stack.Screen
                options={{
                    headerTitle: category?.toUpperCase() || 'COLLECTION',
                    headerTintColor: '#000',
                    headerStyle: { backgroundColor: '#FAFAFA' },
                    headerShadowVisible: false,
                    headerTitleStyle: {
                        fontFamily: 'System', // Or your custom font
                        fontWeight: '700',
                        fontSize: 16
                    }
                }}
            />

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator color="#000" />
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    {pages.length === 0 ? (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', opacity: 0.5 }}>
                            <Typography variant="h3">Empty Stack</Typography>
                            <Typography variant="body">No sifts found in {category}</Typography>
                        </View>
                    ) : (
                        <SiftFeed pages={pages} />
                    )}
                </View>
            )}
        </SafeAreaView>
    );
}
