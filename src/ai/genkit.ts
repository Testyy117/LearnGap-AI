export async function callAI(prompt: string): Promise<string> {
  try {
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
        model: 'google/gemini-flash-1.5',
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await response.json();
    if (data.choices && data.choices[0]) {
      return data.choices[0].message.content;
    }
    console.error('OpenRouter response:', JSON.stringify(data));
    return 'Sorry, I could not process your request. Please try again.';
  } catch (error) {
    console.error('AI Error:', error);
    return 'Sorry, there was an error. Please try again.';
  }
}
