
import { GoogleGenAI } from "@google/genai";
import { Transaction, BudgetSummary } from "../types";

export const getBudgetInsights = async (
  transactions: Transaction[],
  summary: BudgetSummary
): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const categorySummary = transactions.reduce((acc: any, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  const context = `
    นี่คือข้อมูลสรุปงบประมาณงานผ้าป่า "จัดหาคอมพิวเตอร์เพื่อการศึกษา" โรงเรียนประจักษ์ศิลปาคม
    
    สรุปยอดรวม:
    - รายรับทั้งหมด: ${summary.totalIncome.toLocaleString()} บาท
    - รายจ่ายทั้งหมด: ${summary.totalExpense.toLocaleString()} บาท
    - คงเหลือสุทธิ: ${summary.balance.toLocaleString()} บาท
    
    แยกตามหมวดหมู่:
    ${Object.entries(categorySummary).map(([cat, amt]) => `- ${cat}: ${Number(amt).toLocaleString()} บาท`).join('\n')}
    
    ภารกิจ:
    1. ให้คำแนะนำสั้นๆ เกี่ยวกับการบริหารงบประมาณใน 4 หมวด (โต๊ะจีน, เครื่องดื่ม, แก้ว, รับบริจาค)
    2. วิเคราะห์ว่าเงินคงเหลือเพียงพอสำหรับคอมพิวเตอร์กี่เครื่อง (ราคาประมาณ 20,000 บาท/เครื่อง)
    3. ให้กำลังใจคณะทำงานและผู้บริจาค
    4. ใช้ภาษาไทยที่เป็นทางการแต่สุภาพ (มีครับ/ค่ะ) ไม่เกิน 150 คำ
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
