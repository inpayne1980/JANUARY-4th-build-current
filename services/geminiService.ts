
import { GoogleGenAI, Type, Modality } from "@google/genai";

export interface GeneratedAd {
  hook: string;
  script: string;
  avatarName: string;
  visualPrompt: string;
  memoryNote?: string;
}

export interface SocialCaptions {
  tiktok: string[];
  instagram: string[];
  youtube: string[];
  hashtags: string[];
}

export interface SuccessInsight {
  headline: string;
  summaryText: string;
  reasons: {
    label: string;
    value: string;
    description: string;
  }[];
  replicationStrategy: string;
}

// Global helper to trigger API key re-selection
const triggerResetKey = () => {
  window.dispatchEvent(new CustomEvent('vendo:reset-api-key'));
};

const handleApiError = (e: any) => {
  const msg = e.message?.toLowerCase() || "";
  if (msg.includes("requested entity was not found") || 
      msg.includes("permission") || 
      msg.includes("unauthorized") || 
      msg.includes("403")) {
    triggerResetKey();
  }
};

// CONTENT SAFETY LOGIC
export const checkContentSafety = async (url: string, title: string): Promise<boolean> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following link and title for NSFW (Not Safe For Work), adult, or sensitive content.
      URL: ${url}
      Title: ${title}
      
      Return a JSON boolean: true if it is potentially NSFW/sensitive, false if it is safe.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.BOOLEAN,
        }
      }
    });
    return JSON.parse(response.text || "false");
  } catch (e: any) {
    handleApiError(e);
    return false;
  }
};

// VIDEO GENERATION LOGIC
export const generateVideo = async (prompt: string, imageBase64?: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: `UGC style creator video: ${prompt}`,
      image: imageBase64 ? {
        imageBytes: imageBase64,
        mimeType: 'image/png'
      } : undefined,
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16'
      }
    });

    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) throw new Error("Video generation failed to return a URI");
    
    return `${downloadLink}&key=${process.env.API_KEY}`;
  } catch (e: any) {
    handleApiError(e);
    throw e;
  }
};

export const generateAdScripts = async (
  product: string, 
  description: string, 
  tone: string, 
  pastHeroScripts: string[] = []
): Promise<GeneratedAd[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const memoryContext = pastHeroScripts.length > 0 
      ? `\n\n[PERFORMANCE MEMORY - CRITICAL]: The following hooks have previously driven high conversions for this user. 
         Analyze their structure, vocabulary, and 'vibe', and inject these successful patterns into at least 2 of the new suggestions.
         Successful Patterns: ${pastHeroScripts.join(' | ')}`
      : "";

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are a world-class UGC ad director. Generate 3 unique and highly viral UGC ad scripts for: ${product}. 
      Details: ${description}. 
      Tone: ${tone}. ${memoryContext}
      
      For each ad, provide:
      1. A short, punchy hook (the first 3 seconds).
      2. The full script (max 30 seconds).
      3. The persona name of the AI avatar.
      4. A detailed visual prompt for the scene rendering.
      5. A 'memoryNote' explaining how you used Performance Memory to optimize this script (if applicable).`,
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
  } catch (e: any) {
    handleApiError(e);
    throw e;
  }
};

export const generateSuccessInsight = async (
  script: string,
  topSource: string,
  totalClicks: number
): Promise<SuccessInsight> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze why this ad worked: "${script}". 
      Context: It drove ${totalClicks} clicks, with the top traffic source being ${topSource}.
      
      Generate a data-driven "Why This Worked" report. 
      Headline: A punchy analysis like "The 'Problem/Solution' Blueprint Success".
      SummaryText: A sentence explaining the core win (e.g., "Your ad drove 42 clicks because:").
      
      Include exactly 3 specific reasons formatted with data points:
      Reason 1: MUST be about traffic source distribution (e.g., "78% came from TikTok where you post daily").
      Reason 2: MUST be about hook performance/retention (e.g., "The hook 'OMG you NEED this' had 2.1x higher retention").
      Reason 3: MUST be about the offer/CTA context (e.g., "You linked to a limited-time offer which increased urgency").
      
      ReplicationStrategy: A clear 1-sentence tactical directive for the user's next campaign.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            summaryText: { type: Type.STRING },
            reasons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  value: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            },
            replicationStrategy: { type: Type.STRING }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e: any) {
    handleApiError(e);
    throw e;
  }
};

// Search grounding is stable on gemini-3-flash-preview. 
// Using it as primary to avoid 403 errors on project-restricted keys.
export const analyzeProductUrl = async (url: string): Promise<{ productName: string, description: string, links: any[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this commerce URL and extract details for a Vendo Traffic Hub block. 
      URL: ${url}
      
      Tasks:
      1. Extract the specific "Product Name" or "Design Title".
      2. Provide a short, viral description (under 15 words) highlighting its main selling point.
      3. If it is a Shopify store, Print-on-Demand (Redbubble, Spring, etc.), or standard Marketplace (Amazon, Etsy), note its distinctive vibe.
      
      Format your response strictly as:
      Product Name: [Name]
      Description: [Description]`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const text = response.text || "";
    const lines = text.split('\n');
    const productNameLine = lines.find(l => l.toLowerCase().includes('product name')) || lines[0];
    const productName = productNameLine.split(':').pop()?.trim() || "Analyzed Product";
    
    const descriptionLine = lines.find(l => l.toLowerCase().includes('description')) || text;
    const description = descriptionLine.split(':').pop()?.trim() || text;

    return {
      productName,
      description,
      links: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (e: any) {
    handleApiError(e);
    throw e;
  }
};

export const generateSocialCaptions = async (script: string): Promise<SocialCaptions> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate viral social media captions for a video with this script: "${script}".
      Provide 2 variations for TikTok, 2 for Instagram Reels, and 2 for YouTube Shorts. Include 5 trending hashtags.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tiktok: { type: Type.ARRAY, items: { type: Type.STRING } },
            instagram: { type: Type.ARRAY, items: { type: Type.STRING } },
            youtube: { type: Type.ARRAY, items: { type: Type.STRING } },
            hashtags: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (e: any) {
    handleApiError(e);
    throw e;
  }
};

export const generateThumbnail = async (product: string, hook: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: `YouTube thumbnail for ${product} UGC ad. The text overlay should read: "${hook}" in a viral, bold font. Style: High contrast, creator-led.` }] },
      config: { imageConfig: { aspectRatio: "16:9" } }
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return '';
  } catch (e: any) {
    handleApiError(e);
    throw e;
  }
};

export const generateAdVisual = async (prompt: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: { parts: [{ text: prompt }] },
      config: { imageConfig: { aspectRatio: "9:16", imageSize: "4K" } }
    });
    
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    return '';
  } catch (e: any) {
    handleApiError(e);
    throw e;
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
  } catch (e: any) {
    handleApiError(e);
    throw e;
  }
};

export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'audio/wav', data: base64Audio } },
          { text: "Transcribe this audio exactly into text for a script brief." }
        ]
      }
    });
    return response.text || '';
  } catch (e: any) {
    handleApiError(e);
    throw e;
  }
};

export const analyzeImage = async (base64Image: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Analyze this product photo and extract key visual features, brand aesthetic, and selling points for a UGC ad brief." }
        ]
      }
    });
    return response.text || '';
  } catch (e: any) {
    handleApiError(e);
    throw e;
  }
};

export const analyzeVideoContent = async (base64Thumbnail: string, script: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Thumbnail } },
          { text: `Predict retention and click-through potential for an ad with this visual style and this script: "${script}"` }
        ]
      }
    });
    return response.text || '';
  } catch (e: any) {
    handleApiError(e);
    throw e;
  }
};

export const analyzeBaseVideo = async (base64Video: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'video/mp4', data: base64Video } },
          { text: "Analyze this video footage. Extract the main action, environment, and creator energy to inform an AI-generated UGC ad." }
        ]
      }
    });
    return response.text || "";
  } catch (e: any) {
    handleApiError(e);
    throw e;
  }
};

export const findLocalCreatorEvents = async (lat: number, lng: number): Promise<{ text: string, links: any[] }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Find 3 popular content creator venues or coworking spaces near this location.",
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } }
      },
    });
    return {
      text: response.text || '',
      links: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  } catch (e: any) {
    handleApiError(e);
    throw e;
  }
};

export const refineAdScript = async (currentScript: string, prompt: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Refine this UGC ad script: "${currentScript}". User request: "${prompt}". Keep it under 30 seconds and maintain a viral, relatable tone.`,
    });
    return response.text || currentScript;
  } catch (e: any) {
    handleApiError(e);
    throw e;
  }
};
