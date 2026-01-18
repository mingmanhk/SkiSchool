
import OpenAI from 'openai';

export async function generateCoachingSummary(
  instructorName: string,
  month: string,
  goals: string[],
  feedback: string[]
) {
  if (!process.env.OPENAI_API_KEY) {
      console.warn("OPENAI_API_KEY not set. Returning mock summary.");
      return {
          summary: "This is a mock summary because the OpenAI API key is missing.",
          strengths: ["Communication", "Punctuality"],
          improvements: ["Technical Demos"],
          actions: ["Attend carving clinic"]
      };
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const prompt = `
    You are an expert Ski School Director. 
    Generate a monthly coaching summary for instructor "${instructorName}" for the month of ${month}.
    
    Context:
    - Active Goals: ${goals.join(', ')}
    - Recent Feedback: ${feedback.join(', ')}

    Output valid JSON with the following structure:
    {
      "summary": "A 2-3 sentence professional summary of their performance.",
      "strengths": ["List 2-3 key strengths demonstrated"],
      "improvements": ["List 1-2 areas for improvement"],
      "actions": ["List 2 specific, actionable steps for next month"]
    }
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview", // or gpt-3.5-turbo
      messages: [{ role: "system", content: "You are a helpful assistant." }, { role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No content generated");
    
    return JSON.parse(content);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return null;
  }
}
