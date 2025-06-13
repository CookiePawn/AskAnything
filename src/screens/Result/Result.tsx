import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import LinearGradient from 'react-native-linear-gradient';
import { fetchGeminiAnalysis } from '@/services/gemini';
import RNFetchBlob from 'rn-fetch-blob';
import { AdBanner } from '@/components';
import { Loading } from './components';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageKey } from '@/constants/storage-key';

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
    const [error, setError] = useState('');
    const [retryCount, setRetryCount] = useState(0);
    const [isKorean, setIsKorean] = useState(false);

    useEffect(() => {
        const getLanguage = async () => {
            const language = await AsyncStorage.getItem(StorageKey.LANGUAGE_KEY);
            setIsKorean(language === 'ko');
        };
        getLanguage();
    }, []);
    
    const MAX_RETRIES = 3;

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

                if (!result || !result.description) {
                    throw new Error(isKorean ? '이미지 분석 결과를 받지 못했습니다.' : 'Failed to get image analysis results.');
                }

                setDescription(result.description);
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
                <Image source={{ uri: imageUrl }} style={styles.image} />
                <Text style={styles.description}>{isKorean ? '설명' : 'Description'}</Text>
                <Text style={styles.descriptionText}>
                    {description.split('\n').map((line, index) => {
                        // 마크다운 강조 표시 처리
                        const parts = line.split(/(\*\*.*?\*\*)/g);
                        return (
                            <Text key={index}>
                                {parts.map((part, partIndex) => {
                                    if (part.startsWith('**') && part.endsWith('**')) {
                                        return (
                                            <Text key={partIndex} style={{ fontWeight: 'bold' }}>
                                                {part.slice(2, -2)}
                                            </Text>
                                        );
                                    }
                                    return <Text key={partIndex}>{part}</Text>;
                                })}
                                {'\n'}
                            </Text>
                        );
                    })}
                </Text>
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

