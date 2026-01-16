🎓 Student Chatbot: The Personal AI Academic Tutor
 https://student-chatbot-seven.vercel.app/
Master Your Subjects, Don’t Just Finish Them.
Student Chatbot is a next-generation pedagogical AI designed specifically for school and college students. Unlike general-purpose LLMs, this chatbot is engineered to act as a personal tutor, focusing on "first-principles" learning. Whether you are stuck on a complex calculus problem, planning a computer science project, or drafting a history essay, Student Chatbot guides you through the logic rather than just giving away the answers.
🌟 Key Features
🛠 Specialized Study Modes
The application features five distinct "Learning Engines" tailored to specific student needs:
📝 Notes Mode: Summarizes complex lectures into digestible, logical bullet points and hierarchies.
📑 Assignment Mode: Guides you through the methodology of your homework, explaining the "why" behind every step.
💻 Project Mode: Acts as a technical consultant for coding, engineering, and creative projects.
🔍 Research Mode: Helps synthesize information from various sources and aids in citation logic and fact-finding.
🎓 Study Mode: Prepares you for exams with mock questions and conceptual deep-dives.
🧠 Pedagogical Intelligence
The bot is powered by a custom-tuned Gemini 3 Flash engine with system instructions that prioritize:
Analogical Reasoning: Explaining abstract concepts (like Quantum Physics or Macroeconomics) using everyday analogies.
Logical Breakdowns: Step-by-step guidance that builds from basic foundations to complex applications.
Anti-Cheating Safeguards: Designed to foster understanding, it provides the logic and structure but encourages students to reach the final conclusion themselves.
📂 Smart Session Management
Persistent History: All chats are saved to local storage, allowing students to return to their study sessions even after a refresh.
Context Awareness: The AI remembers the context of the conversation, maintaining a coherent "tutoring session" feel.
🎨 Design & UI/UX
The application follows a "Black Glass" (Glassmorphism) aesthetic, designed to be both high-tech and distraction-free:
Vibrant Visuals: A high-contrast blue-to-green liquid gradient background.
Glassmorphic Interface: Semi-transparent panels with 20px Gaussian blurs and subtle white borders.
Animated Interactions: Smooth CSS transitions, "thinking" animations for the AI, and slide-in entry effects for chat bubbles.
Responsive Layout: Fully optimized for desktops, tablets, and mobile devices with a slide-out navigation drawer.
🛠 Tech Stack & Tools
This project is built using modern, industry-standard technologies to ensure high performance and maintainability.
Core Languages & Frameworks
React 19: The latest version of the world's most popular UI library for a reactive, component-based architecture.
TypeScript: Used for strict type safety, ensuring a robust codebase with fewer runtime errors.
Tailwind CSS: For ultra-fast, utility-first styling and a consistent design language.
AI & Logic
Google Gemini API (@google/genai): Leverages the gemini-3-flash-preview model for low-latency, high-intelligence responses.
Vite: A lightning-fast build tool and development server.
Lucide React: A beautiful, consistent icon library for an intuitive user interface.
🏗 System Architecture
Frontend: React Single Page Application (SPA).
State Management: React Hooks (useState, useEffect, useRef) combined with LocalStorage for session persistence.
API Layer: Asynchronous communication with Google’s Generative AI servers via the @google/genai SDK.
Styling: PostCSS and Tailwind CSS for optimized production builds.
🚀 Future Roadmap

PDF Support: Uploading lecture slides for the AI to analyze.

Voice Interaction: Real-time voice tutoring using the Gemini Live API.

Math OCR: Taking pictures of math problems for instant explanation.

Collaboration: Real-time shared study rooms for group projects.
💻 Technical Setup (For Developers)
To run this project locally:
Clone the repository
Install dependencies: npm install
Set up your environment variable:
Create a .env file and add: API_KEY=your_google_gemini_key
Run development server: npm run dev
Developed by AI Studio Student Bot Team.

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
4. View the website:
    https://student-chatbot-seven.vercel.app/
