
import { GoogleGenAI } from "@google/genai";
import { Transaction, BudgetSummary } from "../types";

export const getBudgetInsights = async (
  transactions: Transaction[],
  summary: BudgetSummary
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const context = `
    This is a budget for a Thai "Pha Pa" (ผ้าป่า) merit ceremony.
    Organization: โรงเรียนประจักษ์ศิลปาคม (Prachak Silapakom School)
    Event Date: 12 เมษายน 2569 (April 12, 2026)
    Specific Goal: จัดหาคอมพิวเตอร์เพื่อการศึกษา (To provide computers for education)
    
    Current Stats:
    - Total Income: ${summary.totalIncome.toLocaleString()} THB
    - Total Expense: ${summary.totalExpense.toLocaleString()} THB
    - Net Balance: ${summary.balance.toLocaleString()} THB
    
    Recent Transactions:
    ${transactions.slice(-10).map(t => `- [${t.type}] ${t.title}: ${t.amount.toLocaleString()} THB (${t.date})`).join('\n')}
    
    Task: Provide a short, encouraging summary in Thai.
    - Mention that the funds are for "จัดหาคอมพิวเตอร์เพื่อการศึกษา" at "โรงเรียนประจักษ์ศิลปาคม".
    - Based on the current balance, comment on how many computers they might be able to afford (estimate 15,000 - 20,000 THB per computer) if applicable.
    - Encourage donors to reach the goal.
    - Use a polite, formal, and warm tone ("Krap/Ka"). Keep it under 150 words.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: context,
    });
    return response.text || "ขออภัย ไม่สามารถวิเคราะห์ข้อมูลได้ในขณะนี้";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI";
  }
};
