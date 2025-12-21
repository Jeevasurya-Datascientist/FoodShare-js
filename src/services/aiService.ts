const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const APP_URL = 'https://foodshare-jscorp.firebaseapp.com';
const APP_TITLE = 'FoodShare';

export interface AIAnalysisResult {
    freshnessScore: number;
    isEdible: boolean;
    tags: string[];
    safetyNotes: string;
    estimatedShelfLife: string;
}

// Helper for OpenRouter calls
const callOpenRouter = async (model: string, messages: any[], responseFormat: any = null) => {
    if (!OPENROUTER_API_KEY) throw new Error("OpenRouter Key Missing");

    const body: any = {
        model,
        messages,
        temperature: 0.2,
    };
    if (responseFormat) body.response_format = responseFormat;

    const response = await fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': APP_URL,
            'X-Title': APP_TITLE,
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter (${model}) failed: ${response.statusText} - ${errText}`);
    }
    return response.json();
};

// Helper for Groq calls
const callGroq = async (model: string, messages: any[], responseFormat: any = null) => {
    if (!GROQ_API_KEY) throw new Error("Groq Key Missing");

    const body: any = {
        model,
        messages,
        temperature: 0.2,
        max_tokens: 500,
    };
    if (responseFormat) body.response_format = responseFormat;

    const response = await fetch(GROQ_API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq (${model}) failed: ${response.statusText} - ${errText}`);
    }
    return response.json();
};

export const analyzeFoodImage = async (imageBase64: string): Promise<AIAnalysisResult> => {
    const prompt = `
    Analyze this food image for donation safety. 
    Provide a JSON response with:
    {
      "freshnessScore": number (0-100),
      "isEdible": boolean,
      "tags": string[] (e.g., "cooked", "raw", "fruits", "packaged"),
      "safetyNotes": string (short observation),
      "estimatedShelfLife": string (e.g., "24 hours")
    }
    Be conservative. If unsafe, isEdible=false.
  `;

    const messages = [
        {
            role: "user",
            content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: imageBase64 } }
            ]
        }
    ];

    // 1. Try OpenRouter (Free Gemini)
    try {
        console.log("Attempting OpenRouter (Flash Exp Free)...");
        const data = await callOpenRouter('google/gemini-2.0-flash-exp:free', messages, { type: "json_object" });
        return JSON.parse(data.choices[0].message.content);
    } catch (orError) {
        console.warn("OpenRouter failed, switching to Groq...", orError);
    }

    // 2. Try Groq (Llama 3.2 Vision)
    try {
        console.log("Attempting Groq (Llama 3.2 Vision)...");
        // Check if user has Groq key
        if (GROQ_API_KEY) {
            const data = await callGroq('llama-3.2-11b-vision-preview', messages, { type: "json_object" });
            return JSON.parse(data.choices[0].message.content);
        } else {
            console.warn("Skipping Groq: No API Key found.");
        }
    } catch (groqError) {
        console.error("Groq failed:", groqError);
    }

    // 3. Fallback
    return {
        freshnessScore: 85,
        isEdible: true,
        tags: ["AI_FALLBACK", "Manual Verify"],
        safetyNotes: "AI Service unavailable. Please verify manually.",
        estimatedShelfLife: "Unknown"
    };
};

export const generateSmartRecipes = async (ingredients: string[]): Promise<any[]> => {
    const prompt = `
      Suggest 3 creative "Zero Waste" recipes using: ${ingredients.join(', ')}.
      Return JSON array of objects: 
      { 
        "title": string, 
        "description": string, 
        "difficulty": string, 
        "time": string,
        "ingredients": string[],
        "instructions": string[]
      }
    `;
    const messages = [{ role: "user", content: prompt }];

    // 1. Try OpenRouter
    try {
        console.log("Recipes: Attempting OpenRouter...");
        const data = await callOpenRouter('google/gemini-2.0-flash-exp:free', messages, { type: "json_object" });
        let content = data.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(content);
        return Array.isArray(result) ? result : result.recipes || [];
    } catch (orError) {
        console.warn("OpenRouter recipes failed, switching to Groq...", orError);
    }

    // 2. Try Groq
    try {
        console.log("Recipes: Attempting Groq...");
        if (GROQ_API_KEY) {
            const data = await callGroq('llama-3.3-70b-versatile', messages, { type: "json_object" });
            let content = data.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
            const result = JSON.parse(content);
            return Array.isArray(result) ? result : result.recipes || [];
        }
    } catch (groqError) {
        console.error("Groq recipes failed:", groqError);
    }

    return [];
};
