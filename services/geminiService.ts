import { GoogleGenAI, Type } from "@google/genai";
import { VerbData, QuizQuestion } from '../types';
import { VERB_CATEGORIES } from '../constants';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

/**
 * Nettoie une chaîne JSON en supprimant les blocs de démarque potentiels.
 * @param rawText La chaîne de caractères brute provenant de l'API.
 * @returns Une chaîne JSON nettoyée.
 */
const cleanJsonString = (rawText: string): string => {
    let cleanedText = rawText.trim();
    if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.slice(7);
        if (cleanedText.endsWith('```')) {
            cleanedText = cleanedText.slice(0, -3);
        }
    }
    return cleanedText.trim();
};

const CONJUGATION_SCHEMA: any = {
  type: Type.OBJECT,
  properties: {
    verb: { type: Type.STRING, description: "The infinitive form of the verb." },
    translation: { type: Type.STRING, description: "The French translation of the infinitive verb." },
    icon_suggestion: { type: Type.STRING, description: "A single, simple, lowercase English keyword representing the verb's action for icon mapping (e.g., 'eat', 'speak', 'go', 'see', 'sleep')." },
    conjugations: {
      type: Type.ARRAY,
      description: "An array of moods and their conjugations.",
      items: {
        type: Type.OBJECT,
        properties: {
          mood: { type: Type.STRING, description: "The name of the mood (e.g., Indicativo)." },
          tenses: {
            type: Type.ARRAY,
            description: "An array of tenses within the mood.",
            items: {
              type: Type.OBJECT,
              properties: {
                tense: { type: Type.STRING, description: "The name of the tense (e.g., Presente)." },
                conjugations: {
                  type: Type.ARRAY,
                  description: "An array of person/conjugation pairs.",
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      person: { type: Type.STRING, description: "The pronoun or person (e.g., io, tu, lui/lei)." },
                      verb: { type: Type.STRING, description: "The conjugated verb form." }
                    },
                    required: ["person", "verb"]
                  }
                }
              },
              required: ["tense", "conjugations"]
            }
          }
        },
        required: ["mood", "tenses"]
      }
    }
  },
  required: ["verb", "translation", "icon_suggestion", "conjugations"]
};

const QUIZ_QUESTION_SCHEMA: any = {
    type: Type.OBJECT,
    properties: {
        verb: { type: Type.STRING, description: "The infinitive verb for the question." },
        mood: { type: Type.STRING, description: "The mood for the question." },
        tense: { type: Type.STRING, description: "The tense for the question." },
        conjugations: {
            type: Type.ARRAY,
            description: "An array of all person/conjugation pairs for the given tense, typically for io, tu, lui/lei, noi, voi, loro.",
            items: {
                type: Type.OBJECT,
                properties: {
                    person: { type: Type.STRING, description: "The pronoun or person (e.g., io, tu, lui/lei)." },
                    verb: { type: Type.STRING, description: "The conjugated verb form." }
                },
                required: ["person", "verb"]
            }
        },
        translation: { type: Type.STRING, description: "The French translation of the infinitive verb." },
        icon_suggestion: { type: Type.STRING, description: "A single, simple, lowercase English keyword representing the verb's action for icon mapping (e.g., 'eat', 'speak', 'go', 'see', 'sleep')." }
    },
    required: ["verb", "mood", "tense", "conjugations", "translation", "icon_suggestion"]
};


export const fetchConjugation = async (verb: string): Promise<VerbData> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Fournis la conjugaison complète pour le verbe italien '${verb}'. Inclus tous les modes et temps. Fournis également la traduction française du verbe à l'infinitif et un mot-clé simple en anglais pour une icône (par exemple, 'eat', 'speak', 'go'). Formatte la réponse en JSON en suivant le schéma.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: CONJUGATION_SCHEMA,
            },
        });
        const jsonText = cleanJsonString(response.text);
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error fetching conjugation:", error);
        throw new Error("Échec de la récupération des données de conjugaison depuis l'API.");
    }
};

interface QuizOptions {
    mode?: string;
    tense?: string;
    verbCategory?: string;
    exclude?: string[];
    verb?: string;
}

export const generateQuizQuestion = async (options: QuizOptions = {}): Promise<QuizQuestion> => {
    const { mode, tense, verbCategory, exclude, verb } = options;

    let prompt = "";

    if (verb) {
        prompt = `Génère une question de quiz pour le verbe italien '${verb}'. `;
    } else {
        prompt = "Génère une question de quiz sur la conjugaison d'un verbe italien. ";
        if (verbCategory && verbCategory !== 'All' && VERB_CATEGORIES[verbCategory as keyof typeof VERB_CATEGORIES]) {
            const verbs = VERB_CATEGORIES[verbCategory as keyof typeof VERB_CATEGORIES];
            prompt += `Choisis un verbe dans la liste suivante de verbes '${verbCategory}' : ${verbs.join(', ')}. `;
        } else {
            prompt += "Choisis un verbe italien courant (tu peux utiliser des auxiliaires, des réguliers ou des irréguliers courants). ";
        }
    }


    if (mode && mode !== 'All') {
        prompt += `Le mode doit être '${mode}'. `;
    } else {
        prompt += "Choisis un mode au hasard parmi Indicativo, Congiuntivo, Condizionale ou Imperativo. ";
    }

    if (tense && tense !== 'All') {
        prompt += `Le temps doit être '${tense}'. `;
    } else {
        prompt += "Choisis un temps au hasard approprié pour le mode choisi. ";
    }

    if (exclude && exclude.length > 0) {
        prompt += `N'utilise aucun des verbes suivants déjà demandés : ${exclude.join(', ')}. `;
    }

    prompt += "Fournis la conjugaison complète pour toutes les personnes (io, tu, lui/lei, noi, voi, loro) pour le temps et le mode choisis. Fournis également la traduction française du verbe à l'infinitif et un mot-clé simple en anglais pour une icône (par exemple, 'eat', 'speak', 'go'). Formatte la réponse dans le schéma JSON requis.";

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: QUIZ_QUESTION_SCHEMA,
            },
        });
        const jsonText = cleanJsonString(response.text);
        return JSON.parse(jsonText);
    } catch (error) {
        console.error("Error generating quiz question:", error);
        console.error("Prompt that caused error:", prompt);
        throw new Error("Échec de la génération d'une question de quiz depuis l'API.");
    }
};