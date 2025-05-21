import { GEMINI_API_KEY } from '@env';

export async function fetchGeminiAnalysis(base64Image: string, language: 'ko' | 'en' = 'en') {
  const apiKey = GEMINI_API_KEY;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          {
            text:
              `Analyze this image and respond in ${language === 'ko' ? '한국어' : 'English'}.\n` +
              `You must respond in the following JSON format ONLY:\n` +
              `{\n` +
              `  "description": "이미지에 대한 간단한 설명",\n` +
              `  "keyFeatures": ["주요 특징 1", "주요 특징 2", "주요 특징 3", "주요 특징 4", "주요 특징 5"]\n` +
              `}\n\n` +
              `Rules:\n` +
              `1. Do not include any text outside the JSON\n` +
              `2. List ALL important visual features you can see in the image\n` +
              `3. Each feature should be 2-4 words maximum\n` +
              `4. Include at least 5 key features\n` +
              `5. Do not use markdown formatting\n` +
              `6. Focus on:\n` +
              `   - Colors and visual elements\n` +
              `   - Objects and people\n` +
              `   - Actions and settings\n` +
              `   - Notable details\n` +
              `   - Brand names and logos (ONLY if you are 100% certain)\n` +
              `   - Product names (ONLY if you are 100% certain)`
          },
          { inline_data: { mime_type: 'image/jpeg', data: base64Image } },
        ],
      },
    ],
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error('Failed to analyze image');
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

  // JSON 문자열 추출 시도
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  const jsonText = jsonMatch ? jsonMatch[0] : text;

  try {
    const json = JSON.parse(jsonText);
    
    // 응답 데이터 정규화
    const normalizedResponse = {
      description: '',
      keyFeatures: [] as string[]
    };

    // description 처리
    if (typeof json.description === 'string') {
      normalizedResponse.description = json.description.trim();
    }

    // keyFeatures 처리
    if (Array.isArray(json.keyFeatures)) {
      normalizedResponse.keyFeatures = json.keyFeatures
        .filter((feature: any): feature is string => typeof feature === 'string')
        .map((feature: string) => feature.trim())
        .filter((feature: string) => feature.length > 0);
    } else if (typeof json.keyFeatures === 'string') {
      // 문자열로 온 경우 줄바꿈이나 쉼표로 분리
      normalizedResponse.keyFeatures = json.keyFeatures
        .split(/[\n,]/)
        .map((feature: string) => feature.trim())
        .filter((feature: string) => feature.length > 0);
    }

    // 최소한의 데이터가 있는지 확인
    if (!normalizedResponse.description && normalizedResponse.keyFeatures.length === 0) {
      throw new Error('Invalid response format');
    }

    return normalizedResponse;
  } catch (e) {
    console.warn('JSON 파싱 실패:', e);
    // fallback: 텍스트 파싱
    const lines = text.split('\n').filter((line: string) => line.trim().length > 0);
    const description = lines[0] || '';
    const features = lines.slice(1).filter((line: string) => !line.startsWith('{') && !line.startsWith('}'));
    
    return {
      description: description.trim(),
      keyFeatures: features.map((feature: string) => feature.trim()).filter((feature: string) => feature.length > 0)
    };
  }
} 