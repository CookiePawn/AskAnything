import { GEMINI_API_KEY } from '@env';

export async function fetchGeminiAnalysis(base64Image: string, language: 'ko' | 'en' = 'en') {
  const apiKey = GEMINI_API_KEY;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

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
              `  "objectType": "제품/식물/동물/장소/인물 등 이미지의 주요 대상",\n` +
              `  "objectName": "구체적인 제품명/식물명/동물명/장소명/인물명 (확실한 경우에만)",\n` +
              `  "keyFeatures": ["주요 특징 1", "주요 특징 2", "주요 특징 3", "주요 특징 4", "주요 특징 5"],\n` +
              `  "details": "제품의 경우 용도와 특징, 식물의 경우 종류와 특징, 장소의 경우 위치와 특징 등 상세 설명",\n` +
              `  "productInfo": {\n` +
              `    "brand": "브랜드명 (확실한 경우에만)",\n` +
              `    "model": "모델명 (확실한 경우에만)",\n` +
              `    "category": "제품 카테고리",\n` +
              `    "specifications": ["제품 사양 1", "제품 사양 2", "제품 사양 3"],\n` +
              `    "usage": "주요 용도와 사용 방법",\n` +
              `    "uniqueFeatures": ["특별한 기능 1", "특별한 기능 2"]\n` +
              `  }\n` +
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
              `   - Product names (ONLY if you are 100% certain)\n` +
              `7. For objectType and objectName:\n` +
              `   - If it's a product, specify the product category and name\n` +
              `   - If it's a plant, specify the plant type and species\n` +
              `   - If it's an animal, specify the animal type and species\n` +
              `   - If it's a place, specify the location type and name\n` +
              `8. For details:\n` +
              `   - Provide specific information about the main subject\n` +
              `   - Include relevant characteristics and features\n` +
              `   - Mention any notable aspects that would be important to know\n` +
              `9. For productInfo (if the image shows a product):\n` +
              `   - Identify the brand and model if clearly visible\n` +
              `   - Specify the product category\n` +
              `   - List all visible specifications and features\n` +
              `   - Describe the main usage and purpose\n` +
              `   - Highlight any unique or special features\n` +
              `   - Include any visible technical specifications\n` +
              `   - Note any safety features or certifications if visible`
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
      objectType: '',
      objectName: '',
      keyFeatures: [] as string[],
      details: '',
      productInfo: {
        brand: '',
        model: '',
        category: '',
        specifications: [],
        usage: '',
        uniqueFeatures: []
      }
    };

    // description 처리
    if (typeof json.description === 'string') {
      normalizedResponse.description = json.description.trim();
    }

    // objectType 처리
    if (typeof json.objectType === 'string') {
      normalizedResponse.objectType = json.objectType.trim();
    }

    // objectName 처리
    if (typeof json.objectName === 'string') {
      normalizedResponse.objectName = json.objectName.trim();
    }

    // details 처리
    if (typeof json.details === 'string') {
      normalizedResponse.details = json.details.trim();
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

    // productInfo 처리
    if (typeof json.productInfo === 'object') {
      if (typeof json.productInfo.brand === 'string') {
        normalizedResponse.productInfo.brand = json.productInfo.brand.trim();
      }
      if (typeof json.productInfo.model === 'string') {
        normalizedResponse.productInfo.model = json.productInfo.model.trim();
      }
      if (typeof json.productInfo.category === 'string') {
        normalizedResponse.productInfo.category = json.productInfo.category.trim();
      }
      if (Array.isArray(json.productInfo.specifications)) {
        normalizedResponse.productInfo.specifications = json.productInfo.specifications
          .filter((spec: any): spec is string => typeof spec === 'string')
          .map((spec: string) => spec.trim())
          .filter((spec: string) => spec.length > 0);
      }
      if (typeof json.productInfo.usage === 'string') {
        normalizedResponse.productInfo.usage = json.productInfo.usage.trim();
      }
      if (Array.isArray(json.productInfo.uniqueFeatures)) {
        normalizedResponse.productInfo.uniqueFeatures = json.productInfo.uniqueFeatures
          .filter((feature: any): feature is string => typeof feature === 'string')
          .map((feature: string) => feature.trim())
          .filter((feature: string) => feature.length > 0);
      }
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