import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions, Animated } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import LinearGradient from 'react-native-linear-gradient';
import { fetchGeminiAnalysis } from '@/services/gemini';
import RNFetchBlob from 'rn-fetch-blob';
import Svg, { RadialGradient, Defs, Rect, Stop } from 'react-native-svg';
import { AdBanner } from '@/components';

const { width, height } = Dimensions.get('window');

type ResultScreenRouteProp = RouteProp<RootStackParamList, 'Result'>;

async function getBase64FromUrl(url: string): Promise<string> {
    if (url.startsWith('file://')) {
        // 로컬 파일일 경우
        const base64 = await RNFetchBlob.fs.readFile(url.replace('file://', ''), 'base64');
        return base64;
    } else {
        // 원격 URL일 경우
        const res = await RNFetchBlob.fetch('GET', url);
        return res.base64();
    }
}

const Result = () => {
    const route = useRoute<ResultScreenRouteProp>();
    const { imageUrl } = route.params;
    const navigation = useNavigation();
    const shimmerValue = new Animated.Value(0);

    const [loading, setLoading] = useState(true);
    const [description, setDescription] = useState('');
    const [keyFeatures, setKeyFeatures] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 3;

    useEffect(() => {
        Animated.loop(
            Animated.timing(shimmerValue, {
                toValue: 1,
                duration: 1500,
                useNativeDriver: true,
            })
        ).start();
    }, []);

    const translateX = shimmerValue.interpolate({
        inputRange: [0, 1],
        outputRange: [-width, width],
    });

    const handleRetry = () => {
        setRetryCount(prev => prev + 1);
        setError('');
        setLoading(true);
    };

    const showErrorAlert = (errorMessage: string) => {
        Alert.alert(
            '분석 오류',
            errorMessage,
            [
                {
                    text: '다시 시도',
                    onPress: () => {
                        if (retryCount < MAX_RETRIES) {
                            handleRetry();
                        } else {
                            navigation.goBack();
                        }
                    }
                },
                {
                    text: '돌아가기',
                    onPress: () => navigation.goBack(),
                    style: 'cancel'
                }
            ]
        );
    };

    useEffect(() => {
        const analyzeImage = async () => {
            try {
                setLoading(true);
                const base64 = await getBase64FromUrl(imageUrl);
                const result = await fetchGeminiAnalysis(base64);

                if (!result || (!result.description && (!result.keyFeatures || result.keyFeatures.length === 0))) {
                    throw new Error('이미지 분석 결과를 받지 못했습니다.');
                }

                let description = result.description;
                let keyFeatures = result.keyFeatures;

                if (description && description.startsWith('```')) description = '';

                if (
                    keyFeatures.length > 0 &&
                    keyFeatures[0].trim().startsWith('{') &&
                    keyFeatures[0].trim().endsWith('}')
                ) {
                    try {
                        const parsed = JSON.parse(keyFeatures[0]);
                        description = parsed.description || description;
                        keyFeatures = parsed.keyFeatures || [];
                    } catch (e) {
                        console.warn('JSON 파싱 실패:', e);
                    }
                }

                keyFeatures = keyFeatures.filter((f: string) => !f.startsWith('```'));

                if (!description && keyFeatures.length === 0) {
                    throw new Error('유효한 분석 결과를 받지 못했습니다.');
                }

                setDescription(description);
                setKeyFeatures(keyFeatures);
            } catch (e) {
                const errorMessage = e instanceof Error ? e.message : '이미지 분석 중 오류가 발생했습니다.';
                setError(errorMessage);
                showErrorAlert(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        analyzeImage();
    }, [imageUrl, retryCount]);

    if (loading) {
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

    if (error) {
        return (
            <LinearGradient
                colors={['#9A4DD0', '#280061', '#020105']}
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ color: '#fff', marginBottom: 20 }}>{error}</Text>
                    <TouchableOpacity 
                        style={[styles.button, { marginBottom: 10 }]} 
                        onPress={handleRetry}
                    >
                        <Text style={styles.buttonText}>다시 시도</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.button, { backgroundColor: '#666' }]} 
                        onPress={() => navigation.goBack()}
                    >
                        <Text style={[styles.buttonText, { color: '#fff' }]}>돌아가기</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={['#9A4DD0', '#280061', '#020105']}
            style={styles.container}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
        >
            <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={{ uri: imageUrl }} style={styles.image} />
                <Text style={styles.description}>Description</Text>
                <Text style={styles.descriptionText}>{description}</Text>
                <Text style={styles.keyFeatures}>Key Features</Text>
                {keyFeatures.map((feature, idx) => {
                    // 1. '* **Key:** Value' 패턴
                    let match = feature.match(/^\*\s*\*\*(.+?):\*\*\s*(.+)$/);
                    if (match) {
                        const [, key, value] = match;
                        return (
                            <Text key={idx} style={styles.keyFeaturesText}>
                                <Text style={{ fontWeight: 'bold' }}>{key}:</Text> {value}
                            </Text>
                        );
                    }
                    // 2. '**Key:** Value' 패턴
                    match = feature.match(/^\*\*(.+?):\*\*\s*(.+)$/);
                    if (match) {
                        const [, key, value] = match;
                        return (
                            <Text key={idx} style={styles.keyFeaturesText}>
                                <Text style={{ fontWeight: 'bold' }}>{key}:</Text> {value}
                            </Text>
                        );
                    }
                    // fallback: 그냥 출력
                    return (
                        <Text key={idx} style={styles.keyFeaturesText}>
                            - {feature}
                        </Text>
                    );
                })}
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => navigation.navigate('Home')}
                >
                    <Text style={styles.buttonText}>Home</Text>
                </TouchableOpacity>
            </ScrollView>
            <AdBanner />
        </LinearGradient>
    );
};

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
});

export default Result;

