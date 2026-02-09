
import { GoogleGenAI } from "@google/genai";
import { UserInputs, MutualFund } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getPortfolioAdvice = async (inputs: UserInputs, recommendedFunds: MutualFund[]) => {
  try {
    const prompt = `
      Act as a world-class Indian Financial Advisor. 
      Analyze this user's investment profile and recommended mutual funds.
      
      User Profile:
      - Monthly SIP: ₹${inputs.sipAmount}
      - Horizon: ${inputs.horizon}
      - Risk: ${inputs.riskProfile}
      - Goal: ${inputs.goalType}
      
      Recommended Funds:
      ${recommendedFunds.map(f => `- ${f.name} (${f.category}, Score: ${f.score.total}/100)`).join('\n')}
      
      Provide a concise 3-paragraph summary including:
      1. Why this diversification mix is chosen for a ${inputs.riskProfile} risk profile over ${inputs.horizon}.
      2. Specific advice on expense ratios and how they affect their ${inputs.goalType} goal.
      3. A "Market Crash Survival" tip specifically for their profile.
      
      Return the output as plain text. Keep it professional yet encouraging.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Unable to fetch personalized advice at this moment.";
  } catch (error) {
    console.error("Gemini Advice Error:", error);
    return "Personalized AI financial guidance is currently offline. Please review the manual recommendations below.";
  }
};
