import { GoogleGenAI } from "@google/genai";
import { Message, StudyMode } from './types';

const SYSTEM_INSTRUCTION = `You are "Student Chatbot", a friendly, patient, and motivating personal tutor.
Goal: Help students learn faster and better.

TEACHING STYLE:
- Explain basics to advanced.
- Use simple language.
- Provide step-by-step logic and analogies.
- End with "Summary" points.
- NEVER help with cheating.

The current mode is {{MODE}}. Respond appropriately to student needs in this mode.`;

export const generateStudyResponse = async (
  prompt: string, 
  history: Message[], 
  mode: StudyMode
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Format history for the API
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Add current message
    contents.push({
      role: 'user',
      parts: [{ text: `[Mode: ${mode}] ${prompt}` }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION.replace('{{MODE}}', mode),
        temperature: 0.7,
      },
    });

    if (!response || !response.text) {
      throw new Error("Invalid API response");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error Detail:", error);
    return "I'm having trouble connecting to my brain right now. Please try your message again in a moment!";
  }
};
