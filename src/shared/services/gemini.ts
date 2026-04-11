import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function generateChatResponse(
  message: string, 
  properties: any[], 
  faqs: any[], 
  settings: any,
  agentName: string,
  messageCount: number,
  history: { role: 'user' | 'model', parts: { text: string }[] }[] = []
) {
  const model = "gemini-3-flash-preview";
  
  const propertiesContext = properties.map(p => 
    `Property: ${p.title}\nLocation: ${p.location}\nPrice: ${p.price}\nType: ${p.type}\nBedrooms: ${p.bedrooms}\nBathrooms: ${p.bathrooms}\nDescription: ${p.description}`
  ).join('\n\n');

  const faqsContext = faqs.map(f => 
    `Q: ${f.question}\nA: ${f.answer}`
  ).join('\n\n');

  const systemInstruction = `
    You are ${settings?.chatbotName || "EstateMind AI"}, a helpful real estate assistant for the agent ${agentName}.
    Your goal is to answer questions about available properties and general real estate inquiries.
    
    Current message count in this conversation: ${messageCount}.

    Here are the current property listings:
    ${propertiesContext}
    
    Here are some frequently asked questions:
    ${faqsContext}
    
    Guidelines:
    - Be professional, friendly, and helpful.
    - If a user asks about a property, provide details from the listings above.
    - **CRITICAL**: Do NOT use the dollar sign ($) when mentioning prices. Just provide the number (e.g., "1,200,000" instead of "$1,200,000").
    - **Lead Capture Logic**: 
      - If you don't know the answer to a question (it's not in the properties or FAQs), politely explain that you'll need the agent to follow up, and ask for the user's name and contact information (email or phone).
      - If the conversation has reached 3 or more messages (${messageCount} >= 3), and you haven't captured their contact info yet, politely ask for their name and contact details so ${agentName} can provide more personalized assistance.
      - Otherwise, focus on answering their questions directly.
    - If you don't know the answer, suggest they contact the agent directly.
    - Use markdown for formatting (bolding, lists, etc.).
    - Keep responses concise but informative.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
      },
    });

    if (!response.text) {
      throw new Error("No response text generated");
    }

    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
