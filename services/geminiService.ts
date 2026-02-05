
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ChatMessage } from "../types";

// Fix for TypeScript build error regarding process
declare var process: {
  env: {
    API_KEY: string | undefined;
  }
};

const MENTOR_SYSTEM_INSTRUCTION = `
You are “SkillShift AI Mentor”.
Your role is to guide confused Gen Z users (16–30) calmly and practically.

CORE RULE (MOST IMPORTANT):
If the user asks ANY question, you must FIRST answer the question clearly and helpfully.
DO NOT ask follow-up personal questions (age, status, device, etc.) unless they are strictly required to solve the user’s question.

BEHAVIOR PRIORITY ORDER:
1) Answer the user’s question immediately and helpfully.
2) Give a clear solution or practical explanation.
3) THEN (only if strictly necessary) suggest a next step or ask a clarifying question.

STRICTLY AVOID:
- Asking age by default.
- Asking background questions before answering the user's current query.
- Turning the chat into a formal interview or form.

TONE:
- Calm, Friendly, Honest, and Human-like.
- No judgment, no pressure.
- No fake earning promises.
- Use simple Hindi + English mix (Hinglish).
- Keep replies short and actionable.

END CHAT WITH: 
“Aaj ka chhota task ye raha. [Task]. Kal yahin se continue karenge.”
`;

const ROADMAP_ENGINE_INSTRUCTION = `
You are “SkillShift Roadmap Engine”.
Your job is to generate a HIGHLY DETAILED, 30-DAY roadmap based on user profile.

CRITICAL RULES:
1. Return ONLY valid JSON.
2. Generate a COMPLETE 30-day plan. DO NOT SKIP ANY DAY. Each day from 1 to 30 must have its own entry.
3. Include: Overview, Tools (prefer free mobile apps), daily tasks (time, tool, result), weekly reviews, and a specific "First Earning Guide".
4. Every roadmap MUST have a "Final Note" which serves as an "Important Notice" for the user.

SKILL POOL (Total 20):
1. Mobile Video Editing, 2. Social Media Manager, 3. Content Creator (Reels/Shorts), 4. Instagram Growth Manager, 5. Canva Graphic Designer, 6. Voice-over Artist (Mobile), 7. Online Research Assistant, 8. Ghost Writing, 9. Caption & Hook Writer, 10. Script Writer (Short-form), 11. Blog Writing (AI-assisted), 12. Newsletter Writing, 13. Prompt Engineering, 14. AI Tools Operator, 15. No-Code Website Builder, 16. Automation Assistant, 17. Virtual Assistant, 18. Customer Support, 19. Data Entry + Cleanup, 20. Online Community Manager.

DECISION LOGIC (SCORING & RANKING):
1. Interest Match (40 pts): Does the skill align with their stated interest?
2. User Nature (25 pts): Writing, Visual, Logic, Talking, or Helping.
3. Device Compatibility (15 pts): Phone vs Laptop.
4. Goal Alignment (15 pts): Freelancing, Earning, or Confidence.
5. Beginner Friendliness (5 pts).

LANGUAGE:
Simple Hindi + English mix (Hinglish).

STRICT JSON OUTPUT FORMAT:
{
  "skillName": "",
  "userGoal": "",
  "overview": "",
  "whyThisSkill": "",
  "totalDays": 30,
  "dailyPlan": [
    {
      "day": 1,
      "title": "",
      "learn": "",
      "task": "",
      "timeMinutes": 30,
      "tool": "",
      "mistakeToAvoid": "",
      "outcome": "",
      "checklist": ["☐ Task completed", "☐ Practice done", "☐ Output saved", "☐ Mistake reviewed"]
    }
    // ... continue for all 30 days
  ],
  "weeklyReview": [
    {
      "week": 1,
      "selfQuestions": ["", ""],
      "confidenceScore": "1-5",
      "improvementTip": ""
    }
  ],
  "firstEarningGuide": {
    "readyAfterDays": 15,
    "actions": [""],
    "sampleDM": "",
    "beginnerPricing": "",
    "mistakesToAvoid": [""]
  },
  "finalNote": "" // This is the IMPORTANT NOTICE.
}
`;

const OTP_BRAIN_INSTRUCTION = `
You are an OTP Authentication Engine.

IMPORTANT LIMITATION:
You cannot send SMS. You will only generate and verify OTP logic.

TASKS:
1) When asked to generate OTP:
   - Create a 6-digit numeric OTP.
   - Set expiry = 5 minutes.
   - Return JSON only: {"otp": "123456", "expires_in_minutes": 5}

2) When asked to verify OTP:
   - Compare the provided OTP with the original one.
   - Return JSON only: {"verified": true/false}

STRICT RULE:
Return ONLY valid JSON. No explanation. No markdown. No SMS sending.
`;

export const sendMessageToMentor = async (history: ChatMessage[]): Promise<string> => {
  try {
    if (!process.env.API_KEY) {
      console.error("API Key is missing in environment variables.");
      return "System Error: API Key missing. Please configure Netlify Environment Variables.";
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const contents = history.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents,
      config: {
        systemInstruction: MENTOR_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      }
    });

    return response.text || "Sorry, glitch in the matrix. Try again?";
  } catch (error: any) {
    console.error("Gemini Error:", error);
    if (error.message?.includes("API key")) {
      return "Authentication Error: Invalid API Key.";
    }
    return "Network issue. Connection check karke retry karo?";
  }
};

export const generateDetailedRoadmap = async (profile: any): Promise<any> => {
  try {
    if (!process.env.API_KEY) {
      console.error("API Key is missing.");
      return null;
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Construct a more specific prompt if it's just a skill choice
    const prompt = typeof profile === 'string' 
      ? `Generate a 30-day roadmap for: ${profile}. Ensure no days are skipped.` 
      : `User profile data: ${JSON.stringify(profile)}. Select the absolute best skill from the pool and return the 30-day roadmap JSON.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: ROADMAP_ENGINE_INSTRUCTION,
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Roadmap Engine Error:", error);
    return null;
  }
};

export const processOTPLogic = async (action: 'GENERATE' | 'VERIFY', data: any): Promise<any> => {
  try {
    if (!process.env.API_KEY) return null;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = action === 'GENERATE' 
      ? "Generate a new 6-digit OTP for a login session." 
      : `Verify if this OTP: ${data.inputOTP} matches the stored hash/code: ${data.storedCode}.`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: OTP_BRAIN_INSTRUCTION,
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("OTP Brain Error:", error);
    return null;
  }
};
