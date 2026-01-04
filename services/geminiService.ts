
import { GoogleGenAI, Type, Modality } from "@google/genai";

// Guideline: Create a new GoogleGenAI instance right before making an API call 
// to ensure it always uses the most up-to-date API key from the dialog.

export interface GeneratedAd {
  hook: string;
  script: string;
  avatarName: string;
  visualPrompt: string;
  memoryNote?: string; // Why this was suggested based on history
}

export interface SocialCaptions {
  tiktok: string[];
  instagram: string[];
  youtube: string[];
  hashtags: string[];
}

export interface SuccessInsight {
  headline: string;
  reasons: {
    label: string;
    value: string;
    description: string;
  }[];
  replicationStrategy: string;
}

export const generateAdScripts = async (
  product: string, 
  description: string, 
  tone: string, 
  pastHeroScripts: string[] = []
): Promise<GeneratedAd[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const memoryContext = pastHeroScripts.length > 0 
    ? `\n\n[PERFORMANCE MEMORY]: The following scripts previously drove high conversion for this user. Analyze their structure, hook style, and CTAs to inform the new suggestions:
       ${pastHeroScripts.map(s => `- "${s}"`).join('\n')}`
    : "";

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 3 high-converting UGC ad scripts for: ${product}. 
    Details: ${description}. 
    Tone: ${tone}. ${memoryContext}
    
    For each, provide:
    1. 'hook' (max 40 chars)
    2. 'script' (max 200 chars)
    3. 'avatarName' (creative name)
    4. 'visualPrompt' for an image generator
    5. 'memoryNote' (A very short explanation of which successful pattern from the past this script mimics, e.g., "Uses the high-CTR 'OMG' hook style")`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            hook: { type: Type.STRING },
            script: { type: Type.STRING },
            avatarName: { type: Type.STRING },
            visualPrompt: { type: Type.STRING },
            memoryNote: { type: Type.STRING }
          },
          required: ["hook", "script", "avatarName", "visualPrompt", "memoryNote"]
        }
      }
    }
  });
  
  return JSON.parse(response.text || "[]");
};

export const generateSuccessInsight = async (
  script: string,
  topSource: string,
  retentionMultiplier: number
): Promise<SuccessInsight> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze why this UGC ad worked. 
    Script: "${script}"
    Top Platform: ${topSource}
    Retention Multiplier: ${retentionMultiplier}x higher than average.
    
    Provide a data-driven breakdown of success.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING, description: "Punchy headline like 'Platform-First Mastery'" },
          reasons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                label: { type: Type.STRING, description: "Short label like 'TikTok Native'" },
                value: { type: Type.STRING, description: "The specific stat like '78% Traffic'" },
                description: { type: Type.STRING, description: "Brief explanation of the causality." }
              },
              required: ["label", "value", "description"]
            }
          },
          replicationStrategy: { type: Type.STRING, description: "One-sentence advice for the next ad." }
        },
        required: ["headline", "reasons", "replicationStrategy"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const refineAdScript = async (currentScript: string, nudge: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Take this UGC script: "${currentScript}". 
    Refine it based on this user nudge: "${nudge}". 
    Keep it high-converting, under 200 characters, and maintain a natural creator tone. 
    Return only the updated script text.`,
  });
  return response.text || currentScript;
};

export const analyzeProductUrl = async (url: string): Promise<{ productName: string, description: string, links: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this product URL and extract details for a UGC ad brief: ${url}`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          description: { type: Type.STRING, description: "A punchy 2-sentence ad brief about target audience and pain points." }
        },
        required: ["productName", "description"]
      }
    }
  });
  const data = JSON.parse(response.text || '{"productName": "", "description": ""}');
  return {
    ...data,
    links: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const generateSocialCaptions = async (script: string): Promise<SocialCaptions> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Based on this UGC script: "${script}", generate platform-specific viral captions.
    - TikTok: Short, punchy, high energy, uses emojis and clear CTAs like "Link in bio".
    - Instagram: Engaging, community-focused, includes promo code placeholders and "🔗 in bio" CTAs.
    - YouTube Shorts/Long: Descriptive, SEO-friendly, hooks for retention.
    Also provide 5 trending hashtags.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          tiktok: { type: Type.ARRAY, items: { type: Type.STRING } },
          instagram: { type: Type.ARRAY, items: { type: Type.STRING } },
          youtube: { type: Type.ARRAY, items: { type: Type.STRING } },
          hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["tiktok", "instagram", "youtube", "hashtags"]
      }
    }
  });
  return JSON.parse(response.text || '{"tiktok": [], "instagram": [], "youtube": [], "hashtags": []}');
};

export const generateThumbnail = async (product: string, hook: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: `A high-converting YouTube/TikTok video thumbnail. Features a happy creator holding ${product}. Large, bold, legible yellow text overlay that says "${hook}". High contrast, cinematic lighting, 4K.` }] },
    config: { 
      imageConfig: { 
        aspectRatio: "16:9",
        imageSize: "1K"
      } 
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return '';
};

export const generateAdVisual = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: `A high-quality 4K UGC creator style photo, cinematic lighting, portrait: ${prompt}` }] },
    config: { 
      imageConfig: { 
        aspectRatio: "9:16",
        imageSize: "4K"
      } 
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return '';
};

export const generateSpeech = async (text: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say with a natural, energetic UGC creator voice: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
};

export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        // FIX: Changed mimeType to audio/wav to match Dashboard.tsx recording output
        { inlineData: { mimeType: 'audio/wav', data: base64Audio } },
        { text: "Transcribe this audio exactly. It is a UGC creator speaking." }
      ]
    }
  });
  return response.text || '';
};

export const analyzeImage = async (base64Image: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
        { text: "Analyze this product photo. What is the product, its key features, and what kind of aesthetic does it have? Summarize in 2 sentences for an ad brief." }
      ]
    }
  });
  return response.text || '';
};

export const analyzeVideoContent = async (base64Thumbnail: string, script: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'image/jpeg', data: base64Thumbnail } },
        { text: `Based on this frame and this script: "${script}", predict the retention potential. What is the strongest hook element?` }
      ]
    }
  });
  return response.text || '';
};

export const analyzeBaseVideo = async (base64Video: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'video/mp4', data: base64Video } },
        { text: "Analyze this base video for an ad. What are the key visual elements, lighting, and style? How can we enhance this with AI creators? Provide 3 specific suggestions for a high-converting ad based on this specific footage." }
      ]
    }
  });
  return response.text || "Base video analysis failed.";
};

export const findLocalCreatorEvents = async (lat: number, lng: number): Promise<{ text: string, links: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Find 3 interesting creator-focused venues, co-working spaces, or event locations near my coordinates for a UGC meet-up.",
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: {
        retrievalConfig: {
          latLng: { latitude: lat, longitude: lng }
        }
      }
    },
  });
  return {
    text: response.text || '',
    links: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};
