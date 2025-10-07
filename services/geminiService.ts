
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Philosopher, Message, Settings, UserPersona, ChatContext } from '../types';

let ai: GoogleGenAI;

const getAI = () => {
  if (!ai) {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY is not set in environment variables.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

const buildHistory = (history: Message[], userInput: string) => {
    return history.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
    })).concat([{ role: 'user', parts: [{ text: userInput }] }]);
};

const buildConfig = (systemInstruction: string, settings: Settings) => {
    const config: any = {
        systemInstruction,
        temperature: settings.temperature,
    };
    if (settings.maxOutputTokens) {
        config.maxOutputTokens = settings.maxOutputTokens;
        config.thinkingConfig = { thinkingBudget: Math.floor(settings.maxOutputTokens / 2) };
    }
    return config;
}

const enrichInputWithPersona = (userInput: string, persona: UserPersona): string => {
    if (persona.name || persona.relationship || persona.backstory) {
        return `(OOC: I am speaking to you as a character. My persona is: Name/Role: "${persona.name}", my relationship to you is: "${persona.relationship}", and my backstory is: "${persona.backstory}". Please address me in character based on this information.)\n\nMy message is: ${userInput}`;
    }
    return userInput;
}

export async function* streamPersonaResponse(
  persona: Philosopher,
  history: Message[],
  userInput: string,
  settings: Settings,
  userPersona: UserPersona
) {
  const aiInstance = getAI();
  const enrichedInput = enrichInputWithPersona(userInput, userPersona);
  const contents = buildHistory(history, enrichedInput);
  const config = buildConfig(persona.systemInstruction, settings);

  const result = await aiInstance.models.generateContentStream({
      model: 'gemini-2.5-flash',
      contents: contents as any,
      config,
  });

  for await (const chunk of result) {
    yield chunk.text;
  }
}

export async function* streamGroupDebate(
  philosophers: Philosopher[],
  history: Message[],
  userInput: string,
  settings: Settings,
  userPersona: UserPersona,
) {
  const aiInstance = getAI();
  let personaContext = '';
  if (userPersona.name || userPersona.relationship || userPersona.backstory) {
    personaContext = `The user is playing a character with this persona: Name/Role: "${userPersona.name}", Relationship to the philosophers: "${userPersona.relationship}", Backstory: "${userPersona.backstory}". The philosophers should address the user according to this persona.`
  }

  let debateContext = `${personaContext} The user has asked: "${userInput}". Previous messages in this conversation are:\n${history.map(m => `${m.sender === 'user' ? 'User' : philosophers.find(p=>p.id===m.sender)?.name || 'Philosopher'}: ${m.text}`).join('\n')}\n\nA debate will now commence.`;

  for (const philosopher of philosophers) {
    const prompt = `${debateContext}\n\nYou are ${philosopher.name}. It is your turn to respond. Provide your perspective based on your philosophical views. Keep your response focused and relevant to the ongoing debate. Do not greet the user or repeat the question. State your argument directly.`;
    
    const config = buildConfig(philosopher.systemInstruction, settings);

    const result = await aiInstance.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config,
    });

    let fullResponse = "";
    for await (const chunk of result) {
      const textChunk = chunk.text;
      if (textChunk) {
        fullResponse += textChunk;
        yield { philosopherId: philosopher.id, chunk: textChunk };
      }
    }
    debateContext += `\n\n${philosopher.name} responded: "${fullResponse}"`;
  }
}


export async function* regenerateResponse(
  philosopher: Philosopher,
  originalMessage: string,
  mode: 'shorten' | 'lengthen',
  settings: Settings
) {
    const aiInstance = getAI();
    const prompt = `Your previous response was: "${originalMessage}". Please provide a ${mode === 'shorten' ? 'more concise' : 'more detailed'} version of that same response. Do not add any conversational filler, just provide the modified response.`;

    const config = buildConfig(philosopher.systemInstruction, {
        ...settings,
        maxOutputTokens: undefined, // Don't limit regeneration
    });

    const result = await aiInstance.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config,
    });

    for await (const chunk of result) {
        yield chunk.text;
    }
}

export async function generateUserPersona(): Promise<UserPersona> {
    const aiInstance = getAI();
    const prompt = "Generate a brief, interesting user persona for a debate with famous philosophers. The persona should be creative and provide a unique angle for conversation. Provide a name/role, a relationship to the philosophers, and a short backstory. Respond in JSON format.";
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "The user's name or role (e.g., 'A time traveler', 'The last human')." },
            relationship: { type: Type.STRING, description: "The user's relationship to the philosophers (e.g., 'A student from the future', 'A skeptic of all philosophy')." },
            backstory: { type: Type.STRING, description: "A brief backstory for the user's character." },
        },
        required: ["name", "relationship", "backstory"],
    };

    const result = await aiInstance.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema,
        }
    });

    try {
        const jsonString = result.text;
        const parsed = JSON.parse(jsonString);
        return {
            name: parsed.name || '',
            relationship: parsed.relationship || '',
            backstory: parsed.backstory || '',
        };
    } catch (e) {
        console.error("Failed to parse persona JSON:", e);
        throw new Error("Failed to generate a valid persona.");
    }
}

export async function generateContext(
  history: Message[],
  philosophers: Philosopher[]
): Promise<ChatContext> {
  const aiInstance = getAI();
  if (history.length < 1) {
    return { summary: [], keyConcepts: [] };
  }
  const conversationText = history
    .map((m) => {
      const senderName =
        m.sender === 'user'
          ? 'User'
          : philosophers.find((p) => p.id === m.sender)?.name || 'Philosopher';
      return `${senderName}: ${m.text.replace('▋', '')}`;
    })
    .join('\n');

  const prompt = `Analyze the following conversation with philosophers and provide a concise summary and a list of key philosophical concepts discussed. If the conversation is too short or lacks substance, return empty arrays.

Conversation:
---
${conversationText}
---

Your response must be in JSON format. Provide the summary as an array of strings (each string is a bullet point). Provide the key concepts as an array of objects, each with a 'term' and a 'definition'.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      summary: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: 'A list of bullet points summarizing the conversation. Should be empty if no summary can be made.',
      },
      keyConcepts: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            term: { type: Type.STRING, description: 'The philosophical term.' },
            definition: {
              type: Type.STRING,
              description: 'A brief definition of the term.',
            },
          },
          required: ['term', 'definition'],
        },
        description: 'A list of key philosophical concepts and their definitions. Should be empty if no concepts are identified.',
      },
    },
    required: ['summary', 'keyConcepts'],
  };

  const result = await aiInstance.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema,
    },
  });

  try {
    const jsonString = result.text;
    const parsed = JSON.parse(jsonString);
    return parsed;
  } catch (e) {
    console.error('Failed to parse context JSON:', e);
    throw new Error('Failed to generate valid context data.');
  }
}
