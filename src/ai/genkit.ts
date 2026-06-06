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
        model: 'openai/gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await response.json();
    console.log('OpenRouter full response:', JSON.stringify(data));
    if (data.choices && data.choices[0]) {
      return data.choices[0].message.content;
    }
    return 'Sorry, I could not process your request.';
  } catch (error) {
    console.error('AI Error:', error);
    return 'Sorry, there was an error.';
  }
}
