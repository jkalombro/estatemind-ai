import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateChatResponse(
  message: string, 
  properties: any[], 
  faqs: any[], 
  settings: any
) {
  const model = "gemini-3-flash-preview";
  
  const propertiesContext = properties.map(p => 
    `Property: ${p.title}\nLocation: ${p.location}\nPrice: $${p.price}\nType: ${p.type}\nBedrooms: ${p.bedrooms}\nBathrooms: ${p.bathrooms}\nDescription: ${p.description}`
  ).join('\n\n');

  const faqsContext = faqs.map(f => 
    `Q: ${f.question}\nA: ${f.answer}`
  ).join('\n\n');

  const systemInstruction = `
    You are ${settings?.chatbotName || "EstateMind AI"}, a helpful real estate assistant for ${settings?.agencyName || "our agency"}.
    Your goal is to answer questions about available properties and general real estate inquiries.
    
    Here are the current property listings:
    ${propertiesContext}
    
    Here are some frequently asked questions:
    ${faqsContext}
    
    Guidelines:
    - Be professional, friendly, and helpful.
    - If a user asks about a property, provide details from the listings above.
    - **CRITICAL**: After providing property details or answering a specific inquiry about a listing, you MUST politely ask for the user's name and contact information (email or phone) so the agent can follow up with them.
    - If you don't know the answer, suggest they contact the agent directly.
    - Use markdown for formatting (bolding, lists, etc.).
    - Keep responses concise but informative.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: message,
      config: {
        systemInstruction,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to my brain. Please try again later!";
  }
}
