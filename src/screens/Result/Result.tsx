import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import LinearGradient from 'react-native-linear-gradient';
import { fetchGeminiAnalysis } from '@/services/gemini';
import RNFetchBlob from 'rn-fetch-blob';
import { AdBanner } from '@/components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKey } from '@/constants';
import { Loading } from './components';

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

    const [loading, setLoading] = useState(true);
    const [description, setDescription] = useState('');
    const [keyFeatures, setKeyFeatures] = useState<string[]>([]);
    const [error, setError] = useState('');
    const [retryCount, setRetryCount] = useState(0);
    const [isKorean, setIsKorean] = useState(false);
    const [productInfo, setProductInfo] = useState<{
        brand: string;
        model: string;
        category: string;
        specifications: string[];
        usage: string;
        uniqueFeatures: string[];
    }>({
        brand: '',
        model: '',
        category: '',
        specifications: [],
        usage: '',
        uniqueFeatures: []
    });
    const MAX_RETRIES = 3;

    const handleLanguageChange = async (isKorean: boolean) => {
        try {
            await AsyncStorage.setItem(StorageKey.LANGUAGE_KEY, isKorean ? 'ko' : 'en');
            setIsKorean(isKorean);
        } catch (e) {
            console.warn('언어 설정을 저장하는데 실패했습니다:', e);
        }
    };

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
                    text: 'Retry',
                    onPress: () => {
                        if (retryCount < MAX_RETRIES) {
                            handleRetry();
                        } else {
                            navigation.goBack();
                        }
                    }
                },
                {
                    text: 'Go Back',
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
                const result = await fetchGeminiAnalysis(base64, isKorean ? 'ko' : 'en');

                if (!result) {
                    throw new Error(isKorean ? '이미지 분석 결과를 받지 못했습니다.' : 'Failed to get image analysis results.');
                }

                // 기본 필수 데이터 검증
                if (!result.description && (!result.keyFeatures || result.keyFeatures.length === 0)) {
                    throw new Error(isKorean ? '필수 분석 데이터가 없습니다.' : 'Missing required analysis data.');
                }

                let description = result.description || '';
                let keyFeatures = result.keyFeatures || [];

                // description 정제
                if (description.startsWith('```')) {
                    description = '';
                }

                // keyFeatures 정제
                if (keyFeatures.length > 0) {
                    // JSON 형식으로 된 응답 처리
                    if (keyFeatures[0].trim().startsWith('{') && keyFeatures[0].trim().endsWith('}')) {
                        try {
                            const parsed = JSON.parse(keyFeatures[0]);
                            description = parsed.description || description;
                            keyFeatures = parsed.keyFeatures || [];
                        } catch (e) {
                            console.warn('JSON 파싱 실패:', e);
                        }
                    }
                }

                // 마크다운 코드 블록 제거
                keyFeatures = keyFeatures
                    .filter((f: string) => !f.startsWith('```'))
                    .filter((f: string) => f.trim().length > 0);

                // 최소한의 데이터 검증
                if (!description && keyFeatures.length === 0) {
                    throw new Error(isKorean ? '유효한 분석 결과를 받지 못했습니다.' : 'Invalid analysis results received.');
                }

                // 제품 정보 처리
                let productInfoData = {
                    brand: '',
                    model: '',
                    category: '',
                    specifications: [] as string[],
                    usage: '',
                    uniqueFeatures: [] as string[]
                };

                if ('productInfo' in result && result.productInfo) {
                    try {
                        const info = result.productInfo;
                        productInfoData = {
                            brand: typeof info.brand === 'string' ? info.brand.trim() : '',
                            model: typeof info.model === 'string' ? info.model.trim() : '',
                            category: typeof info.category === 'string' ? info.category.trim() : '',
                            specifications: Array.isArray(info.specifications)
                                ? info.specifications
                                    .filter((spec: any): spec is string => typeof spec === 'string')
                                    .map((spec: string) => spec.trim())
                                    .filter((spec: string) => spec.length > 0)
                                : [],
                            usage: typeof info.usage === 'string' ? info.usage.trim() : '',
                            uniqueFeatures: Array.isArray(info.uniqueFeatures)
                                ? info.uniqueFeatures
                                    .filter((feature: any): feature is string => typeof feature === 'string')
                                    .map((feature: string) => feature.trim())
                                    .filter((feature: string) => feature.length > 0)
                                : []
                        };
                    } catch (e) {
                        console.warn('제품 정보 처리 중 오류:', e);
                    }
                }

                setDescription(description);
                setKeyFeatures(keyFeatures);
                setProductInfo(productInfoData);
            } catch (e) {
                const errorMessage = e instanceof Error
                    ? e.message
                    : (isKorean ? '이미지 분석 중 오류가 발생했습니다.' : 'An error occurred while analyzing the image.');
                setError(errorMessage);
                showErrorAlert(errorMessage);
            } finally {
                setLoading(false);
            }
        };
        analyzeImage();
    }, [imageUrl, retryCount, isKorean]);

    if (loading) {
        return (
            <Loading />
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
                <View style={styles.languageToggle}>
                    <TouchableOpacity
                        style={[styles.langButton, isKorean && styles.activeLangButton]}
                        onPress={() => handleLanguageChange(true)}
                    >
                        <Text style={[styles.langButtonText, isKorean && styles.activeLangButtonText]}>한국어</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.langButton, !isKorean && styles.activeLangButton]}
                        onPress={() => handleLanguageChange(false)}
                    >
                        <Text style={[styles.langButtonText, !isKorean && styles.activeLangButtonText]}>English</Text>
                    </TouchableOpacity>
                </View>
                <Image source={{ uri: imageUrl }} style={styles.image} />
                <Text style={styles.description}>{isKorean ? '설명' : 'Description'}</Text>
                <Text style={styles.descriptionText}>{description}</Text>
                {productInfo.brand && (
                    <>
                        <Text style={styles.sectionTitle}>{isKorean ? '제품 정보' : 'Product Information'}</Text>
                        <View style={styles.productInfoContainer}>
                            {productInfo.brand && (
                                <Text style={styles.productInfoText}>
                                    <Text style={styles.boldText}>{isKorean ? '브랜드' : 'Brand'}:</Text> {productInfo.brand}
                                </Text>
                            )}
                            {productInfo.model && (
                                <Text style={styles.productInfoText}>
                                    <Text style={styles.boldText}>{isKorean ? '모델' : 'Model'}:</Text> {productInfo.model}
                                </Text>
                            )}
                            {productInfo.category && (
                                <Text style={styles.productInfoText}>
                                    <Text style={styles.boldText}>{isKorean ? '카테고리' : 'Category'}:</Text> {productInfo.category}
                                </Text>
                            )}
                            {productInfo.usage && (
                                <Text style={styles.productInfoText}>
                                    <Text style={styles.boldText}>{isKorean ? '용도' : 'Usage'}:</Text> {productInfo.usage}
                                </Text>
                            )}
                        </View>

                        {productInfo.specifications.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>{isKorean ? '제품 사양' : 'Specifications'}</Text>
                                {productInfo.specifications.map((spec, idx) => (
                                    <Text key={idx} style={styles.specText}>• {spec}</Text>
                                ))}
                            </>
                        )}

                        {productInfo.uniqueFeatures.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>{isKorean ? '특별한 기능' : 'Unique Features'}</Text>
                                {productInfo.uniqueFeatures.map((feature, idx) => (
                                    <Text key={idx} style={styles.specText}>• {feature}</Text>
                                ))}
                            </>
                        )}
                    </>
                )}
                <Text style={styles.keyFeatures}>{isKorean ? '주요 특징' : 'Key Features'}</Text>
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
                    <Text style={styles.buttonText}>{isKorean ? '홈으로' : 'Home'}</Text>
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

export default Result;

