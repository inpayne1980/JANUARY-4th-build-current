
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
  reasons: {
    label: string;
    value: string;
    description: string;
  }[];
  replicationStrategy: string;
}

// VIDEO GENERATION LOGIC
export const generateVideo = async (prompt: string, imageBase64?: string): Promise<string> => {
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
    // Poll every 10 seconds as per guidelines
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({ operation: operation });
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed to return a URI");
  
  // Append API key when fetching from the download link
  return `${downloadLink}&key=${process.env.API_KEY}`;
};

export const generateAdScripts = async (
  product: string, 
  description: string, 
  tone: string, 
  pastHeroScripts: string[] = []
): Promise<GeneratedAd[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const memoryContext = pastHeroScripts.length > 0 
    ? `\n\n[PERFORMANCE MEMORY]: Referencing past high-performers: ${pastHeroScripts.join(' | ')}`
    : "";

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate 3 UGC ad scripts for: ${product}. Details: ${description}. Tone: ${tone}. ${memoryContext}`,
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
    contents: `Analyze why this script worked: "${script}" on ${topSource}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headline: { type: Type.STRING },
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
};

export const analyzeProductUrl = async (url: string): Promise<{ productName: string, description: string, links: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this product URL: ${url}`,
    config: {
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          productName: { type: Type.STRING },
          description: { type: Type.STRING }
        }
      }
    }
  });
  return {
    ...JSON.parse(response.text || '{}'),
    links: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};

export const generateSocialCaptions = async (script: string): Promise<SocialCaptions> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate viral captions for: "${script}"`,
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
};

export const generateThumbnail = async (product: string, hook: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: `YouTube thumbnail for ${product}: "${hook}"` }] },
    config: { imageConfig: { aspectRatio: "16:9" } }
  });
  return `data:image/png;base64,${response.candidates?.[0]?.content?.parts.find(p => p.inlineData)?.inlineData?.data || ''}`;
};

export const generateAdVisual = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-image-preview',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "9:16", imageSize: "4K" } }
  });
  return `data:image/png;base64,${response.candidates?.[0]?.content?.parts.find(p => p.inlineData)?.inlineData?.data || ''}`;
};

export const generateSpeech = async (text: string): Promise<string> => {
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
};

export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { mimeType: 'audio/wav', data: base64Audio } },
        { text: "Transcribe this audio exactly." }
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
        { text: "Analyze this product photo for an ad brief." }
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
        { text: `Predict retention for: "${script}"` }
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
        { text: "Analyze this footage." }
      ]
    }
  });
  return response.text || "";
};

export const findLocalCreatorEvents = async (lat: number, lng: number): Promise<{ text: string, links: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Find 3 creator venues near me.",
    config: {
      tools: [{ googleMaps: {} }],
      toolConfig: { retrievalConfig: { latLng: { latitude: lat, longitude: lng } } }
    },
  });
  return {
    text: response.text || '',
    links: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
};
