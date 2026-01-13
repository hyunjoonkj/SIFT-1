import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSequence,
    Easing,
    withDelay
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Typography } from './design-system/Typography';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
    onFinish?: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
    // Animation Values
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);
    const blur = useSharedValue(10); // Simulated blur via opacity layering
    const logoOpacity = useSharedValue(0);

    // Background "Breathing" Animation
    const bgTranslateY = useSharedValue(0);

    useEffect(() => {
        // Start background breathing
        bgTranslateY.value = withRepeat(
            withSequence(
                withTiming(-50, { duration: 10000, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 10000, easing: Easing.inOut(Easing.ease) })
            ),
            -1,
            true
        );

        // Logo Reveal (Blur-in simulation)
        const GENTLE_EASING = Easing.bezier(0.25, 0.1, 0.25, 1.0);

        // 1. Fade in
        logoOpacity.value = withDelay(500, withTiming(1, { duration: 1500, easing: GENTLE_EASING }));
        // 2. Scale down slightly (focus effect)
        scale.value = withDelay(500, withTiming(1, { duration: 1500, easing: GENTLE_EASING }));

        // Finish after delay
        if (onFinish) {
            const timer = setTimeout(onFinish, 3500); // 3.5s total splash time
            return () => clearTimeout(timer);
        }
    }, []);

    const animatedBgStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: bgTranslateY.value }],
    }));

    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: scale.value }],
    }));

    return (
        <View style={styles.container}>
            {/* Background Gradient Layer */}
            <Animated.View style={[styles.background, animatedBgStyle]}>
                <LinearGradient
                    // "Warm Minimalism" Palette: Off-White, Soft Sage, Muted Charcoal Hint
                    colors={['#FDFBF7', '#E8E8E8', '#D6D6D6']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>

            {/* Grain Overlay (Simulated with translucent textured View or just noise color) */}
            <View style={styles.grainOverlay} pointerEvents="none" />

            {/* Centered Logo */}
            <Animated.View style={[styles.content, logoStyle]}>
                <Typography variant="h1" className="text-6xl font-bold tracking-tight text-ink lowercase">
                    sift
                </Typography>
                <Typography variant="caption" className="text-ink-secondary tracking-[0.2em] mt-4 uppercase text-xs">
                    Find the signal
                </Typography>
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFBF7', // Creame/Warm White base
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    background: {
        ...StyleSheet.absoluteFillObject,
        height: height * 1.5, // Taller for movement
        width: width,
    },
    grainOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.02)', // Subtle noise simulation
        zIndex: 1,
    },
    content: {
        zIndex: 2,
        alignItems: 'center',
    },
});
