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
    `Property: ${p.title}\nLocation: ${p.location}\nPrice: ${p.price}\nType: ${p.type}\nImages: ${p.images?.join(', ') || 'No photos available'}\nDescription: ${p.description}`
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
    - **Ambiguous Queries**: If a user asks about properties but doesn't specify a location or other details (e.g., "What houses do you have?"), do NOT list all properties. Instead, list the unique locations available from the listings and ask which location or what kind of house they are looking for.
    - **Property Details**: If a user asks about a specific property or a specific location, provide details from the listings above.
    - **Images**: 
      - If you are describing **exactly one** property, include its first image using markdown: \`![Property Title](first_image_url)\`.
      - If you are listing **multiple** properties, do NOT include any photos.
      - If a property has more than one photo, add a text indicator right after the image markdown like: \`(Click photo to see +X more)\` where X is the number of additional photos.
    - **CRITICAL**: Do NOT use the dollar sign ($) when mentioning prices. Just provide the number (e.g., "1,200,000" instead of "$1,200,000").
    - **Lead Capture Logic**: 
      - If you don't know the answer to a question (it's not in the properties or FAQs), politely explain that you'll need the agent to follow up, and ask for the user's name and contact information.
      - If the conversation has reached 10 or more messages (${messageCount} >= 10), and you haven't captured their contact info yet, politely ask for their name and contact details so ${agentName} can provide more personalized assistance.
      - **CRITICAL**: Whenever you ask for contact information (either because you don't know an answer or because the message threshold is reached), you MUST include the exact string "[SHOW_CONTACT_FORM]" at the very end of your message. This will trigger a button for the user to provide their details.
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
