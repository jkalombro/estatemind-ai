import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateChatResponse } from './gemini';

// vi.hoisted ensures this runs before vi.mock hoisting so the reference is available
const mockGenerateContent = vi.hoisted(() => vi.fn());

vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(function () {
    return {
      models: { generateContent: mockGenerateContent },
    };
  }),
}));

const sampleProperties = [
  {
    title: 'Ocean View Villa',
    location: 'Malibu, CA',
    price: '2500000',
    type: 'Villa',
    bedrooms: 4,
    bathrooms: 3,
    description: 'Stunning ocean views',
  },
];

const sampleFaqs = [
  { question: 'What are your hours?', answer: 'We are open 9–5 weekdays.' },
];

const sampleSettings = {
  chatbotName: 'HomeFinder AI',
  agencyName: 'Best Realty',
};

describe('generateChatResponse()', () => {
  beforeEach(() => {
    mockGenerateContent.mockClear();
  });

  it('returns AI text on success', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: 'Here are the properties.' });
    const result = await generateChatResponse('Show me villas', sampleProperties, sampleFaqs, sampleSettings);
    expect(result).toBe('Here are the properties.');
  });

  it('calls generateContent with correct model', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: 'OK' });
    await generateChatResponse('hello', [], [], sampleSettings);
    expect(mockGenerateContent).toHaveBeenCalledWith(
      expect.objectContaining({ model: 'gemini-3-flash-preview' })
    );
  });

  it('passes user message as contents', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: 'OK' });
    await generateChatResponse('my message', [], [], sampleSettings, 'Agent', 1);
    const call = mockGenerateContent.mock.calls[0][0];
    expect(call.contents).toEqual([{ role: 'user', parts: [{ text: 'my message' }] }]);
  });

  it('includes chatbotName and agencyName in systemInstruction', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: 'OK' });
    await generateChatResponse('hi', [], [], sampleSettings, 'Best Realty Agent', 0);
    const call = mockGenerateContent.mock.calls[0][0];
    expect(call.config.systemInstruction).toContain('HomeFinder AI');
    expect(call.config.systemInstruction).toContain('Best Realty Agent');
  });

  it('falls back to EstateMind AI when settings is null', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: 'OK' });
    await generateChatResponse('hi', [], [], null, 'Agent', 0);
    const call = mockGenerateContent.mock.calls[0][0];
    expect(call.config.systemInstruction).toContain('EstateMind AI');
  });

  it('includes property data in system instruction', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: 'OK' });
    await generateChatResponse('any', sampleProperties, [], sampleSettings);
    const call = mockGenerateContent.mock.calls[0][0];
    expect(call.config.systemInstruction).toContain('Ocean View Villa');
    expect(call.config.systemInstruction).toContain('Malibu, CA');
  });

  it('includes FAQ data in system instruction', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: 'OK' });
    await generateChatResponse('any', [], sampleFaqs, sampleSettings);
    const call = mockGenerateContent.mock.calls[0][0];
    expect(call.config.systemInstruction).toContain('What are your hours?');
    expect(call.config.systemInstruction).toContain('We are open 9–5 weekdays.');
  });

  it('returns fallback message when response.text is falsy', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: '' });
    const result = await generateChatResponse('hi', [], [], sampleSettings);
    expect(result).toBe("I'm sorry, I couldn't generate a response right now.");
  });

  it('returns error message on API failure', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await generateChatResponse('hi', [], [], sampleSettings);
    expect(result).toBe("I'm having trouble connecting to my brain. Please try again later!");
    consoleSpy.mockRestore();
  });

  it('handles empty properties and faqs arrays', async () => {
    mockGenerateContent.mockResolvedValueOnce({ text: 'No listings yet.' });
    const result = await generateChatResponse('list', [], [], sampleSettings);
    expect(result).toBe('No listings yet.');
  });
});
