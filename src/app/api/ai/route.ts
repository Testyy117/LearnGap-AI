import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-2.0-flash-001',
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  const data = await response.json();
  return NextResponse.json({ result: data.choices[0].message.content });
}
