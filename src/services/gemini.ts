export async function fetchGeminiAnalysis(base64Image: string) {
  const apiKey = 'AIzaSyDOlY7XH7xX2hflxbdNMYV8gySR8TO0qEU'; // 실제 키로 교체
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          { text: 'Describe this image and list its key features.' },
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

  console.log(response);

  if (!response.ok) {
    throw new Error('Failed to analyze image');
  }

  const data = await response.json();
  // Gemini 응답 구조에 따라 파싱 (아래는 예시)
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  // 예시: 설명과 주요 기능 분리 (실제 응답에 맞게 파싱 필요)
  const [description, ...features] = text.split('\n').filter(Boolean);
  return {
    description,
    keyFeatures: features,
  };
} 