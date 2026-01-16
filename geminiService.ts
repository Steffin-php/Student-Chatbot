import { GoogleGenAI } from "@google/genai";
import { Message, StudyMode } from './types';

const getSystemInstruction = (mode: StudyMode) => `You are "Student Chatbot", an elite personal tutor for school and college students.
CURRENT MODE: ${mode}.

YOUR ROLE:
- Explain complex concepts starting from basic first principles.
- Use clear, simple, and patient language.
- Provide step-by-step logical breakdowns.
- Use relatable real-life analogies to clarify abstract ideas.
- ALWAYS end your response with a concise "Summary" or "Key Points" section.
- Support all subjects including Mathematics, Computer Science, AI, Physics, Chemistry, Biology, Economics, History, and Literature.

MANDATORY RULES:
- If asked for project help, guide the planning and structural aspects.
- If asked for assignment help, explain the logic and methodology without just providing the final answer.
- NO PROMOTING CHEATING. Your goal is deep understanding.
- Be highly motivating and encouraging.`;

export const generateStudyResponse = async (
  prompt: string, 
  history: Message[], 
  mode: StudyMode
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Convert our internal message format to the Gemini SDK format
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // If history doesn't already end with the user's latest prompt, add it
    if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
      contents.push({ role: 'user', parts: [{ text: prompt }] });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: getSystemInstruction(mode),
        temperature: 0.7,
      },
    });

    if (!response || !response.text) {
      throw new Error("No text returned from Gemini");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error Details:", error);
    return "I'm having a bit of trouble processing that right now. Could you please rephrase your question? I'm ready to help!";
  }
};
