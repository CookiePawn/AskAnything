import { useEffect, useRef } from "react";
import { ScrollView, View, Text, StyleSheet, Animated, Dimensions } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

const Loading = () => {
    const shimmerValue = useRef(new Animated.Value(0)).current;

    const translateX = shimmerValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width],
    });

    // 스켈레톤 애니메이션 시작 함수
    const startShimmerAnimation = () => {
        shimmerValue.stopAnimation();
        shimmerValue.setValue(0);
        Animated.loop(
            Animated.timing(shimmerValue, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        ).start();
    };

    useEffect(() => {
        startShimmerAnimation();
        
        // 컴포넌트가 언마운트될 때 애니메이션 정리
        return () => {
            shimmerValue.stopAnimation();
        };
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <Svg height={height} width={width} style={StyleSheet.absoluteFill}>
                <Defs>
                    <RadialGradient
                        id="grad"
                        cx="50%"
                        cy="50%"
                        rx="85%"
                        ry="45%"
                        fx="50%"
                        fy="50%"
                    >
                        <Stop offset="0%" stopColor="#4501A7" stopOpacity="1" />
                        <Stop offset="100%" stopColor="#180139" stopOpacity="1" />
                    </RadialGradient>
                </Defs>
                <Rect x="0" y="0" width="100%" height="100%" fill="url(#grad)" />
            </Svg>
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.skeletonImage}>
                    <Animated.View
                        style={[
                            styles.shimmer,
                            {
                                transform: [{ translateX }],
                            },
                        ]}
                    />
                </View>
                
                <View style={styles.skeletonTextContainer}>
                    <View style={styles.skeletonTitle}>
                        <Animated.View
                            style={[
                                styles.shimmer,
                                {
                                    transform: [{ translateX }],
                                },
                            ]}
                        />
                    </View>
                    {[1, 2, 3].map((_, index) => (
                        <View key={index} style={styles.skeletonText}>
                            <Animated.View
                                style={[
                                    styles.shimmer,
                                    {
                                        transform: [{ translateX }],
                                    },
                                ]}
                            />
                        </View>
                    ))}
                </View>

                <View style={styles.skeletonTextContainer}>
                    <View style={styles.skeletonTitle}>
                        <Animated.View
                            style={[
                                styles.shimmer,
                                {
                                    transform: [{ translateX }],
                                },
                            ]}
                        />
                    </View>
                    {[1, 2, 3].map((_, index) => (
                        <View key={index} style={styles.skeletonText}>
                            <Animated.View
                                style={[
                                    styles.shimmer,
                                    {
                                        transform: [{ translateX }],
                                    },
                                ]}
                            />
                        </View>
                    ))}
                </View>

                <Text style={styles.loadingText}>Analyzing image with AI...</Text>
            </ScrollView>
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    image: {
        width: '100%',
        height: 300,
        borderRadius: 20,
    },
    description: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 15,
        marginTop: 20,
    },
    descriptionText: {
        fontSize: 14,
        color: '#ffffff',
    },
    keyFeatures: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 30,
        marginBottom: 15,
    },
    keyFeaturesText: {
        fontSize: 14,
        color: '#ffffff',
        marginBottom: 10,
    },
    button: {
        backgroundColor: '#ffffff',
        padding: 10,
        borderRadius: 100,
        alignItems: 'center',
        marginTop: 30,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#3B3B3B',
    },
    skeletonImage: {
        width: '100%',
        height: 300,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        overflow: 'hidden',
    },
    skeletonTextContainer: {
        marginTop: 30,
    },
    skeletonTitle: {
        width: 150,
        height: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
        marginBottom: 15,
        overflow: 'hidden',
    },
    skeletonText: {
        width: '100%',
        height: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
        marginBottom: 10,
        overflow: 'hidden',
    },
    shimmer: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        transform: [{ skewX: '-20deg' }],
    },
    loadingText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 30,
        opacity: 0.8,
    },
    languageToggle: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
        gap: 10,
    },
    langButton: {
        paddingHorizontal: 20,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    activeLangButton: {
        backgroundColor: '#ffffff',
    },
    langButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    activeLangButtonText: {
        color: '#3B3B3B',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 30,
        marginBottom: 15,
    },
    productInfoContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    productInfoText: {
        fontSize: 14,
        color: '#ffffff',
        marginBottom: 8,
    },
    boldText: {
        fontWeight: 'bold',
    },
    specText: {
        fontSize: 14,
        color: '#ffffff',
        marginBottom: 8,
        paddingLeft: 10,
    },
});

export default Loading;