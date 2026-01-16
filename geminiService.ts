import { GoogleGenAI } from "@google/genai";
import { Message, StudyMode } from './types';

const getSystemInstruction = (mode: StudyMode) => `You are "Student Chatbot", a world-class AI personal tutor.
CURRENT MODE: ${mode}.

YOUR MISSION:
1. Explain concepts from absolute basics to advanced.
2. Use clear, student-friendly language.
3. Provide step-by-step logic for every explanation.
4. Give real-life examples and relatable analogies.
5. End with a "Key Revision Points" or "Summary" section.
6. Support all subjects (Math, CS, AI, Physics, Chemistry, Bio, History, etc.).
7. PERSONALITY: Friendly, patient, and highly motivating.

IMPORTANT:
- Never provide direct answers to test questions without explaining the 'why'.
- If the mode is "Project", focus on architecture, planning, and structure.
- If the mode is "Assignment", focus on the logic behind solving the problems.
- If the mode is "Research", focus on deep-dive facts and sourcing logic.
- NO CHEATING: Guide students to LEARN and UNDERSTAND.`;

export const generateStudyResponse = async (
  prompt: string, 
  history: Message[], 
  mode: StudyMode
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Ensure we send current prompt
    if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
      contents.push({ role: 'user', parts: [{ text: prompt }] });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: getSystemInstruction(mode),
        temperature: 0.8,
        topK: 40,
        topP: 0.9,
      },
    });

    if (!response || !response.text) {
      return "I couldn't generate a response. Please try rephrasing your question.";
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return "I ran into a connection glitch. Please send your message again, I'm ready to help!";
  }
};
