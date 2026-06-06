export async function callAI(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://learn-gap-ai.vercel.app',
      'X-Title': 'LearnGap AI',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await response.json();
  return data.choices[0].message.content;
}
