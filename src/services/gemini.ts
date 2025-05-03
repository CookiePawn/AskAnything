import { GEMINI_API_KEY } from '@env';

export async function fetchGeminiAnalysis(base64Image: string) {
  const apiKey = GEMINI_API_KEY;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          {
            text:
              `Please analyze this image and respond ONLY in the following strict JSON format (do not include markdown or any extra text):\n` +
              `{"description": "A concise description of the image.", "keyFeatures": ["Feature 1", "Feature 2", ...]}`
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

  // Try to parse as JSON first
  try {
    const json = JSON.parse(text);
    return {
      description: json.description,
      keyFeatures: json.keyFeatures,
    };
  } catch {
    // fallback: 기존 파싱 방식
    const [description, ...features] = text.split('\n').filter(Boolean);
    return {
      description,
      keyFeatures: features,
    };
  }
} 