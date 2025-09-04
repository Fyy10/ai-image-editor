import { GoogleGenAI, Modality } from "@google/genai";
import type { EditedImageResult, GeneratedImageResult } from '../types';

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
        reader.readAsDataURL(file);
    });
    return {
        inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

export const editImageWithNanoBanana = async (imageFile: File, prompt: string, apiKey: string): Promise<EditedImageResult> => {
    if (!apiKey) {
        throw new Error("API_KEY is missing.");
    }
    
    const ai = new GoogleGenAI({ apiKey });

    try {
        const imagePart = await fileToGenerativePart(imageFile);
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: [{
                parts: [imagePart, textPart],
            }],
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const result: EditedImageResult = { imageBase64: null, text: null };

        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    result.text = part.text;
                } else if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType;
                    result.imageBase64 = `data:${mimeType};base64,${base64ImageBytes}`;
                }
            }
        }

        if (!result.imageBase64) {
            const blockReason = response.candidates?.[0]?.finishReason;
            if (blockReason === 'SAFETY') {
                 throw new Error("The request was blocked due to safety settings. Please modify your prompt.");
            }
            throw new Error("The API did not return an edited image.");
        }

        return result;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            // Re-throw specific errors to be displayed to the user
            throw error;
        }
        throw new Error("Failed to communicate with the AI model. Please check your API key and network connection.");
    }
};

export const generateImageWithNanoBanana = async (prompt: string, apiKey: string): Promise<GeneratedImageResult> => {
    if (!apiKey) {
        throw new Error("API_KEY is missing.");
    }
    
    const ai = new GoogleGenAI({ apiKey });

    try {
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image-preview',
            contents: [{
                parts: [textPart],
            }],
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });
        
        const result: GeneratedImageResult = { imageBase64: null, text: null };

        if (response.candidates && response.candidates.length > 0) {
            for (const part of response.candidates[0].content.parts) {
                if (part.text) {
                    result.text = part.text;
                } else if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    const mimeType = part.inlineData.mimeType;
                    result.imageBase64 = `data:${mimeType};base64,${base64ImageBytes}`;
                }
            }
        }

        if (!result.imageBase64) {
            const blockReason = response.candidates?.[0]?.finishReason;
            if (blockReason === 'SAFETY') {
                 throw new Error("The request was blocked due to safety settings. Please modify your prompt.");
            }
            throw new Error("The API did not return an image.");
        }

        return result;

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("Failed to communicate with the AI model. Please check your API key and network connection.");
    }
};
