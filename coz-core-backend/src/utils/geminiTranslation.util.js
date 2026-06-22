import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const MODELS = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.5-pro"];

async function generateWithFallback(prompt, maxRetries = 2) {
    let lastError;

    for (const modelName of MODELS) {
        let attempts = 0;
        while (attempts < maxRetries) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent(prompt);
                const responseText = await result.response.text();
                return responseText;
            } catch (error) {
                lastError = error;
                attempts++;
                const is503 = error.message?.includes("503") || error.status === 503;
                if (is503 && attempts < maxRetries) {
                    const delay = 1000 * Math.pow(2, attempts - 1);
                    console.warn(
                        `Model ${modelName} attempt ${attempts} failed with 503, retrying in ${delay}ms...`,
                    );
                    await new Promise((resolve) => setTimeout(resolve, delay));
                } else {
                    console.warn(
                        `Model ${modelName} failed with error: ${error.message}. Trying next model...`,
                    );
                    break;
                }
            }
        }
        console.warn(`Model ${modelName} exhausted, moving to next...`);
    }

    throw new Error(
        `All translation models failed. Last error: ${lastError?.message || "Unknown"}`,
    );
}

export async function translateEnToAr(text) {
    if (!text || typeof text !== 'string') return text;
    try {
        const prompt = `Translate the following English text to Arabic. Output only the translation, no extra text:\n\n${text}`;
        const responseText = await generateWithFallback(prompt);
        let translation = responseText.trim();
        translation = translation.replace(/\?/g, '؟');  
        return translation;
    } catch (error) {
        console.error('Translation error:', error.message);
        return text;
    }
}

export async function translateArrayEnToAr(texts) {
    if (!Array.isArray(texts)) return texts;
    return await Promise.all(texts.map((t) => translateEnToAr(t)));
}

export async function translateProductToArabic(texts) {
    if (!texts || Object.keys(texts).length === 0) return texts;

    const prompt = `
You are a translator. Translate the following English texts to Arabic.
Output only the translations as a JSON object with the same keys.

Texts to translate:
${JSON.stringify(texts, null, 2)}

Output format:
{ 
  "name": "...", 
  "features": ["...", "..."], 
  "fitType": "...", 
  "sizeGuideDesc": "...", 
  "colorNames": ["...", "..."] 
}`;

    try {
        const responseText = await generateWithFallback(prompt);
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error("No JSON found in response");
        }
        const translated = JSON.parse(jsonMatch[0]);

        return {
            name_ar: translated.name || texts.name || "",
            features_ar: Array.isArray(translated.features)
                ? translated.features
                : texts.features || [],
            fitType_ar: translated.fitType || texts.fitType || "",
            sizeGuideDesc_ar: translated.sizeGuideDesc || texts.sizeGuideDesc || "",
            colorNames_ar: Array.isArray(translated.colorNames)
                ? translated.colorNames
                : texts.colorNames || [],
        };
    } catch (error) {
        console.error("Product translation error:", error.message);
        return {
            name_ar: texts.name || "",
            features_ar: texts.features || [],
            fitType_ar: texts.fitType || "",
            sizeGuideDesc_ar: texts.sizeGuideDesc || "",
            colorNames_ar: texts.colorNames || [],
        };
    }
}
