import { GoogleGenAI, Modality } from '@google/genai';
import { stripBase64Prefix } from '../utils/fileUtils';
import { ClothingItems, UploadedImage } from '../App';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const generateTryOnImage = async (personImage: UploadedImage, clothingItems: ClothingItems): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash-image';
    
    const personImagePart = {
      inlineData: {
        data: stripBase64Prefix(personImage.base64),
        mimeType: personImage.mimeType,
      },
    };

    // FIX: Explicitly type `parts` to allow both image and text parts.
    // By initializing the array with only an image part, TypeScript inferred its type
    // too narrowly, causing a type error on line 48 when pushing a text part.
    const parts: ({ inlineData: { data: string; mimeType: string; } } | { text: string })[] = [personImagePart];
    const clothingDescriptions: string[] = [];

    // Order is important for the prompt
    const orderedCategories: (keyof ClothingItems)[] = ['head', 'top', 'bottom', 'shoes'];

    for (const category of orderedCategories) {
        const item = clothingItems[category];
        if (item) {
            parts.push({
                inlineData: {
                    data: stripBase64Prefix(item.base64),
                    mimeType: item.mimeType,
                },
            });
            clothingDescriptions.push(category);
        }
    }

    const promptText = `Generate a realistic image of the person from the first image wearing the provided clothing items. The subsequent images are for the ${clothingDescriptions.join(', ')}. The background should be simple and neutral. The final output should only be the image of the person wearing the clothing.`;

    const textPart = {
      text: promptText,
    };
    parts.push(textPart);

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64ImageBytes: string = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        return `data:${mimeType};base64,${base64ImageBytes}`;
      }
    }

    throw new Error('No image was generated in the response.');

  } catch (error) {
    console.error('Error generating image with Gemini:', error);
    throw new Error('Failed to generate image. The model may be unable to process the request. Please try with different images.');
  }
};