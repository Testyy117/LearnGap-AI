export async function callAI(prompt: string): Promise<string> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://learn-gap-ai.vercel.app';
  const response = await fetch(`${baseUrl}/api/ai`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  const data = await response.json();
  return data.result;
}
