import { GoogleGenAI, Type } from "@google/genai";
import { HandGestureResponse } from "../types";

// Initialize using process.env.API_KEY directly as per guidelines
const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });
// Using gemini-2.5-flash for speed/latency balance
const model = genAI.models;

export const analyzeGesture = async (base64Image: string): Promise<HandGestureResponse> => {
  const prompt = `
    Analyze this image of a user's hand. 
    Identify the gesture and the approximate position of the hand in the frame.
    
    Rules:
    1. Gesture must be one of: 'OPEN' (fingers spread/palm visible), 'CLOSED' (fist), or 'NONE' (no hand clearly visible).
    2. Position X: -1.0 is far left, 1.0 is far right, 0.0 is center.
    3. Position Y: -1.0 is bottom, 1.0 is top, 0.0 is center.
  `;

  try {
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            gesture: { type: Type.STRING, enum: ["OPEN", "CLOSED", "NONE"] },
            handPosition: {
              type: Type.OBJECT,
              properties: {
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER }
              },
              required: ["x", "y"]
            }
          },
          required: ["gesture", "handPosition"]
        }
      }
    });

    const jsonText = response.text;
    if (!jsonText) return { gesture: 'NONE', handPosition: { x: 0, y: 0 } };
    
    const result = JSON.parse(jsonText) as HandGestureResponse;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return { gesture: 'NONE', handPosition: { x: 0, y: 0 } };
  }
};