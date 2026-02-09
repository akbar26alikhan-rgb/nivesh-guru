
import { GoogleGenAI, Type } from "@google/genai";
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
      1. Why this diversification mix is chosen.
      2. Specific advice on expense ratios.
      3. A "Market Crash Survival" tip.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Unable to fetch personalized advice.";
  } catch (error) {
    console.error("Gemini Advice Error:", error);
    return "AI financial guidance is currently offline.";
  }
};

export const getDeepFundAnalysis = async (fundName: string, category: string) => {
  try {
    const prompt = `
      Analyze the Indian Mutual Fund: "${fundName}" in category "${category}".
      Provide estimated but realistic financial metadata for this fund based on current market knowledge.
      
      Include:
      - Risk Ratios: Sharpe, Sortino, Beta, Alpha, Standard Deviation.
      - Fund Manager details (name, experience).
      - Expense Ratio and Exit Load.
      - Benchmark name and category average return (5Y).
      - Red flags (if any, e.g., high churn, low AUM).
      - Tax implications (Equity vs Debt based on category).
      
      Return the data strictly in JSON format matching this schema:
      {
        "riskRatios": {"sharpe": number, "sortino": number, "beta": number, "alpha": number, "sd": number},
        "manager": {"name": string, "exp": number},
        "expenseRatio": number,
        "exitLoad": string,
        "benchmark": string,
        "catAvg5y": number,
        "redFlags": string[],
        "taxSummary": string,
        "aiStrategy": string
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Fund Analysis Error:", error);
    return null;
  }
};
