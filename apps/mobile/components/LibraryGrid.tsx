import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Pressable, FlatList, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// Define Magazine Covers (Strict Visual Identity)
const COVERS: Record<string, string> = {
    Food: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=1000&auto=format&fit=crop',
    Skincare: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?q=80&w=1000', // Clean aesthetic bottles
    Aesthetics: 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae', // Minimalist interior
    Intel: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b', // Abstract tech
    Wellness: 'https://images.unsplash.com/photo-1544367563-12123d8965cd', // Yoga/Nature
    Random: 'https://images.unsplash.com/photo-1485846234645-a62644f84728',
};

const getCoverImage = (category: string) => {
    return COVERS[category] || COVERS['Random'];
};

export interface Collection {
    id: string;
    title: string;
    count: number;
    image: string;
    isNew: boolean;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // 2 columns with padding
const CARD_HEIGHT = CARD_WIDTH * 1.4; // 3:4 Aspect Ratio

const MagazineCard = ({ item }: { item: Collection }) => {
    const router = useRouter();
    const scale = useSharedValue(1);
    const isEmpty = item.count === 0 && item.title !== 'Archive'; // Archive can be 0 but show ghost? Or just standard empty logic.
    // Actually, "Ghost" logic is specifically for ANY empty collection to encourage filling it.

    // BUT user wanted "Ghost" specifically for empty ones. Let's keep the is_empty check simple.
    // If count is 0, it is a ghost card.

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: item.count === 0 ? 0.6 : 1,
    }));

    const onPressIn = () => { scale.value = withSpring(0.96); };
    const onPressOut = () => { scale.value = withSpring(1); };

    const onPress = () => {
        if (item.count > 0 || item.title === 'Archive') {
            router.push(`/library/${item.title}`);
        }
    };

    if (item.count === 0) {
        return (
            <View style={[styles.cardContainer, styles.ghostCard]}>
                <View style={styles.ghostContent}>
                    <Text style={styles.ghostTitle}>{item.title.toUpperCase()}</Text>
                    <Text style={styles.ghostText}>Start Sifting</Text>
                </View>
            </View>
        );
    }

    return (
        <Pressable onPressIn={onPressIn} onPressOut={onPressOut} onPress={onPress}>
            <Animated.View style={[styles.cardContainer, animatedStyle]}>
                <ImageBackground
                    source={{ uri: item.image }}
                    style={styles.image}
                    imageStyle={{ borderRadius: 12 }}
                >
                    {/* The "Vignette" Gradient for text readability */}
                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
                        style={styles.gradient}
                    >
                        <View style={styles.textWrapper}>
                            <Text style={styles.categoryTitle}>{item.title.toUpperCase()}</Text>
                            <Text style={styles.countText}>{item.count} ISSUES</Text>
                        </View>
                    </LinearGradient>

                    {item.isNew && (
                        <View style={styles.newBadge}>
                            <View style={styles.newDot} />
                            <Text style={styles.newText}>NEW</Text>
                        </View>
                    )}
                </ImageBackground>
            </Animated.View>
        </Pressable>
    );
};

export default function LibraryGrid({ collections }: { collections: Collection[] }) {
    return (
        <View style={styles.container}>
            <FlatList
                data={collections}
                renderItem={({ item }) => <MagazineCard item={item} />}
                keyExtractor={item => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 100 }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: 16,
        paddingTop: 60, // Top Safe Area
        backgroundColor: '#F2F2F7', // Apple System Gray 6
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    cardContainer: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
        backgroundColor: '#fff', // fallback
    },
    image: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    gradient: {
        height: '50%',
        justifyContent: 'flex-end',
        borderRadius: 12,
        padding: 12,
    },
    textWrapper: {},
    categoryTitle: {
        color: '#FFF',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1.2, // Wide spacing for luxury feel
        marginBottom: 4,
    },
    countText: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    // Ghost Styling
    ghostCard: {
        borderWidth: 1,
        borderColor: '#C7C7CC', // Apple System Gray 4
        borderStyle: 'dashed',
        backgroundColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ghostContent: {
        alignItems: 'center',
        opacity: 0.5,
    },
    ghostTitle: {
        color: '#000',
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1.2,
        marginBottom: 4,
    },
    ghostText: {
        color: '#8E8E93', // Apple System Gray
        fontSize: 12,
        fontWeight: '500',
    },
    // New Badge Styling
    newBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 12,
        gap: 4,
    },
    newDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#FF3B30', // Apple System Red
    },
    newText: {
        color: '#FFF',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    }
});
