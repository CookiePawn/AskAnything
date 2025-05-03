import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '@/navigation/types';
import LinearGradient from 'react-native-linear-gradient';
import { fetchGeminiAnalysis } from '@/services/gemini';
import RNFetchBlob from 'rn-fetch-blob';

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

    useEffect(() => {
        const analyzeImage = async () => {
            try {
                setLoading(true);
                // 1. 이미지 url을 base64로 변환
                const base64 = await getBase64FromUrl(imageUrl);
                // 2. Gemini Vision API 호출
                const result = await fetchGeminiAnalysis(base64);

                // Gemini가 코드블록/이중 JSON으로 응답한 경우 처리
                let description = result.description;
                let keyFeatures = result.keyFeatures;

                // description이 코드블록이면 무시
                if (description && description.startsWith('```')) description = '';

                // keyFeatures의 첫 번째가 JSON 문자열이면 파싱
                if (
                    keyFeatures.length > 0 &&
                    keyFeatures[0].trim().startsWith('{') &&
                    keyFeatures[0].trim().endsWith('}')
                ) {
                    try {
                        const parsed = JSON.parse(keyFeatures[0]);
                        description = parsed.description || description;
                        keyFeatures = parsed.keyFeatures || [];
                    } catch {}
                }

                // keyFeatures에 코드블록이 있으면 제거
                keyFeatures = keyFeatures.filter((f: string) => !f.startsWith('```'));

                setDescription(description);
                setKeyFeatures(keyFeatures);
            } catch (e) {
                setError('Failed to analyze image.');
            } finally {
                setLoading(false);
            }
        };
        analyzeImage();
    }, [imageUrl]);

    if (loading) {
        return (
            <LinearGradient
                colors={['#9A4DD0', '#280061', '#020105']}
                style={styles.container}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={{ color: '#fff', marginTop: 20 }}>Analyzing image...</Text>
                </View>
            </LinearGradient>
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
                    <Text style={{ color: '#fff' }}>{error}</Text>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Back</Text>
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
});

export default Result;

