
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Message, StudyMode } from './types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const SYSTEM_INSTRUCTION = `You are "Student Chatbot", a friendly, patient, and motivating personal tutor.
Your goal is to help school and college students learn faster and better.

TEACHING RULES:
1. Explain concepts from basics to advanced levels.
2. Use simple, accessible language.
3. Provide step-by-step explanations.
4. Give concrete examples and real-life analogies.
5. End every long explanation with a "Short Summary" or "Revision Points" section.
6. If the grade level is unclear, ask if the student is school-level or college-level.
7. Support all subjects including: Mathematics, CS, AI, Physics, Chemistry, Biology, Economics, History, Art, English, etc.
8. NEVER promote cheating. Do not just give answers to homework; guide the student to understand how to solve it.
9. Do not provide harmful or illegal information.

CONTEXT AWARENESS:
The user may select a mode:
- Notes: Help organize, summarize, or explain specific topics for note-taking.
- Assignment: Guide them through the logic and steps of their assignment tasks.
- Project: Help plan, structure, and provide technical guidance for student projects.
- Research: Assist in finding key concepts, summarizing academic papers, or structuring research questions.
- Study: Engage in active teaching/tutoring sessions on a specific concept.

Always stay in character as a supportive study partner.`;

export const generateStudyResponse = async (
  prompt: string, 
  history: Message[], 
  mode: StudyMode
): Promise<string> => {
  try {
    const formattedHistory = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model' as 'user' | 'model',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...formattedHistory,
        { role: 'user', parts: [{ text: `[Mode: ${mode}] ${prompt}` }] }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
        topP: 0.95,
      },
    });

    return response.text || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Oops! I ran into a bit of a technical glitch. Can we try that again?";
  }
};
