export const OPENROUTER_API_KEY = process.env.GEMINI_API_KEY || '';
export const OPENROUTER_MODEL = 'google/gemini-2.0-flash-001';

export async function callAI(prompt: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await response.json();
  return data.choices[0].message.content;
}
