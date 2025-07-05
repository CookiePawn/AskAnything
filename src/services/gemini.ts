import Config from 'react-native-config';

export async function fetchGeminiAnalysis(base64Image: string, language: 'ko' | 'en' = 'en') {
  const apiKey = Config.GEMINI_API_KEY;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          {
            text:
              `해당 이미지의 자세한 정보(상황에 맞게 주의사항, 브랜드, 사용처등)를 주세요. ${language === 'ko' ? '한국어로 답변해주세요.' : 'Answer in English.'}`
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

  // 간단한 응답 형식으로 반환
  return {
    description: text.trim(),
    keyFeatures: []
  };
} 