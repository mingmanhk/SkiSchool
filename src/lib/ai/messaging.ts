
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function rewriteMessageTone(text: string, tone: 'professional' | 'friendly' | 'concise') {
  if (!process.env.OPENAI_API_KEY) return text;

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "system", content: `Rewrite the following text to be more ${tone}. Keep the meaning exactly the same.` },
      { role: "user", content: text }
    ],
  });

  return response.choices[0].message.content || text;
}
