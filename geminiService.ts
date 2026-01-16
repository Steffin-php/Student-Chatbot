
import { GoogleGenAI } from "@google/genai";
import { Message, StudyMode } from './types';

const SYSTEM_INSTRUCTION = `You are "Student Chatbot", a friendly, patient, and motivating personal tutor.
Your goal is to help school and college students learn faster and better.

TEACHING STYLE:
1. Explain concepts from basics to advanced levels.
2. Use simple language and step-by-step logic.
3. Provide examples and real-life analogies.
4. End every significant explanation with a "Summary" or "Revision Points".
5. Ask if the student is school-level or college-level if helpful for context.
6. Support all subjects: Math, CS, AI, Physics, Chemistry, Biology, Economics, History, etc.
7. NEVER promote cheating; focus on understanding.

CONTEXT AWARENESS:
The user is currently in [Mode: {{MODE}}].
- Notes: Helping with note organization/summarization.
- Assignment: Guiding through homework steps.
- Project: Technical guidance/planning for student projects.
- Research: Assisting with deep-dive analysis.
- Study: General tutoring session.`;

export const generateStudyResponse = async (
  prompt: string, 
  history: Message[], 
  mode: StudyMode
): Promise<string> => {
  try {
    // Re-initialize to ensure we have the correct environment state
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    // Use gemini-3-flash-preview for high performance and reliability
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: `Current Mode: ${mode}. User Request: ${prompt}` }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION.replace('{{MODE}}', mode),
        temperature: 0.8,
        topP: 0.9,
      },
    });

    if (!response || !response.text) {
      throw new Error("Empty response from Gemini API");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // More descriptive error handling for the UI
    if (error?.message?.includes('API key')) {
      return "Oops! It seems there is an issue with the API Key configuration. Please check your environment variables.";
    }
    return "I ran into a temporary connection issue. Please try sending your message again!";
  }
};
