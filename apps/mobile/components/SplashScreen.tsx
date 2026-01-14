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
    const containerOpacity = useSharedValue(1); // For Fade Out
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

        // 1. Fade in & Focus
        logoOpacity.value = withDelay(200, withTiming(1, { duration: 1200, easing: GENTLE_EASING })); // Faster start
        scale.value = withDelay(200, withTiming(1, { duration: 1200, easing: GENTLE_EASING }));

        // 2. Fade Out Sequence (Total ~2.5s)
        // Start fade out at 2000ms
        const timeout = setTimeout(() => {
            containerOpacity.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.ease) }, (finished) => {
                if (finished && onFinish) {
                    // Clean callback via JS thread if needed, but here we can just wait for timeout or runOnJS
                }
            });
        }, 2200);

        // Finish logic
        const finishTimeout = setTimeout(() => {
            if (onFinish) onFinish();
        }, 2700); // 2.2s + 0.5s fade

        return () => {
            clearTimeout(timeout);
            clearTimeout(finishTimeout);
        };
    }, []);

    const containerStyle = useAnimatedStyle(() => ({
        opacity: containerOpacity.value
    }));

    const animatedBgStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: bgTranslateY.value }],
    }));

    const logoStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={[styles.container, containerStyle]}>
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

            {/* Grain Overlay - Enhanced Opacity */}
            <View style={styles.grainOverlay} pointerEvents="none" />
            <View style={[styles.grainOverlay, { transform: [{ rotate: '90deg' }] }]} pointerEvents="none" />

            {/* Centered Logo */}
            <Animated.View style={[styles.content, logoStyle]}>
                <Typography variant="h1" className="text-6xl font-bold tracking-tight text-ink lowercase">
                    sift
                </Typography>
                <Typography variant="caption" className="text-ink-secondary tracking-[0.2em] mt-4 uppercase text-xs">
                    Find the signal
                </Typography>
            </Animated.View>
        </Animated.View>
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
        backgroundColor: 'rgba(0,0,0,0.04)', // Increased opacity for texture
        zIndex: 1,
    },
    content: {
        zIndex: 2,
        alignItems: 'center',
    },
});
