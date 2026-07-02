import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req: any, res: any) {
  // Handle CORS options preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: "Method Not Allowed. Only POST requests are supported." });
  }

  const { oldImage, newImage, url, content } = req.body;

  if (!oldImage || !newImage) {
    return res.status(400).json({ error: "Both Old Design and New Design images are required for comparison." });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ 
      error: "GEMINI_API_KEY environment variable is not defined on Vercel.", 
      details: "Please configure GEMINI_API_KEY in your Vercel Dashboard -> Project Settings -> Environment Variables." 
    });
  }

  const ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });

  try {
    // Extract base64 clean data (strip data:image/png;base64, etc.)
    const parseBase64 = (base64Str: string) => {
      const parts = base64Str.split(";base64,");
      return {
        mimeType: parts[0].split(":")[1] || "image/png",
        data: parts[1] || parts[0]
      };
    };

    const oldParsed = parseBase64(oldImage);
    const newParsed = parseBase64(newImage);

    const oldImagePart = {
      inlineData: {
        mimeType: oldParsed.mimeType,
        data: oldParsed.data
      }
    };

    const newImagePart = {
      inlineData: {
        mimeType: newParsed.mimeType,
        data: newParsed.data
      }
    };

    const systemPrompt = `
You are WebAudit Pro, a premium digital design review agent and visual strategist.
Your task is to analyze two screenshots of a website:
- First image: The "OLD" design.
- Second image: The "NEW" design.

Compare them meticulously across dimensions such as visual layout, visual hierarchy, typography, call-to-actions, spacing, CRO, conversion architecture, and mobile accessibility.

IMPORTANT INSTRUCTIONS:
- Generate a highly informative, client-ready summary and comparison list.
- Highlight the improvements using a professional, clear, and high-impact English language. Do not use Roman Urdu, Urdu, Hindi, or any other bilingual mixing.
- For each item in the comparison, structure it strictly around:
  - Element: The part of the page being compared (e.g. Hero banner, Footer, CTA button, Header).
  - Old State: Short sentence in English describing the old state.
  - New State: Short sentence in English describing the new state.
  - Benefit: Short sentence in English explaining the business or user benefit.
- Estimate an overall "improvementScore" (integer 0 to 100) representing how much of an upgrade the new design is.
- Estimate a realistic "conversionLift" (string, e.g. "+15% to +25% expected increase in leads").
- Write a professional Executive Summary in the "clientSummary" field in English explaining why the new layout beats the old one.
    `;

    const userPrompt = `
Website URL/Context: ${url || "Not specified"}
User Notes: ${content || "None provided"}

Please analyze these two uploaded design images (Image 1 is the OLD website, Image 2 is the NEW redesigned website).
Give me a complete comparison report matching the specified schema.
    `;

    console.log("Sending comparison request to Gemini with images...");
    const geminiResponse = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        { text: systemPrompt },
        oldImagePart,
        newImagePart,
        { text: userPrompt }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            clientSummary: {
              type: Type.STRING,
              description: "Executive Summary explaining why the new layout is superior and the key benefits of this redesign in professional English."
            },
            improvementScore: {
              type: Type.INTEGER,
              description: "Overall design improvement score from 0 (no change) to 100 (spectacular overhaul)."
            },
            conversionLift: {
              type: Type.STRING,
              description: "Estimated percentage range of conversion rate lift, e.g. '+20% to +35%'"
            },
            items: {
              type: Type.ARRAY,
              description: "Specific elements compared side by side.",
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING, description: "Unique short ID, e.g. 'comp-1'" },
                  element: { type: Type.STRING, description: "Element analyzed, e.g. 'Hero Banner', 'Call to Action', 'Navigation Menu'" },
                  oldState: { type: Type.STRING, description: "What was the previous state? (Before) in English" },
                  newState: { type: Type.STRING, description: "What is the new state? (After) in English" },
                  benefit: { type: Type.STRING, description: "What is the benefit? (Benefit) in English" }
                },
                required: ["id", "element", "oldState", "newState", "benefit"]
              }
            }
          },
          required: ["clientSummary", "improvementScore", "conversionLift", "items"]
        }
      }
    });

    const reportText = geminiResponse.text;
    if (!reportText) {
      throw new Error("No response received from Gemini.");
    }

    const reportData = JSON.parse(reportText);
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json(reportData);
  } catch (error: any) {
    console.error("Comparison Generation Failed:", error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ error: "Failed to compare designs. Please make sure the uploaded files are valid images.", details: error?.message });
  }
}
