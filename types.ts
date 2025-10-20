// FIX: Removed circular import of 'ConjugationPair'.
export interface ConjugationPair {
    person: string;
    verb: string;
}

export interface TenseData {
    tense: string;
    conjugations: ConjugationPair[];
}

export interface MoodData {
    mood: string;
    tenses: TenseData[];
}

export interface VerbData {
    verb: string;
    translation: string; // French translation of the verb
    icon_suggestion: string; // A keyword for a representative icon
    conjugations: MoodData[];
}

export interface QuizQuestion {
    verb: string;
    mood: string;
    tense: string;
    conjugations: ConjugationPair[];
    translation: string; // French translation of the verb
    icon_suggestion: string; // A keyword for a representative icon (e.g., 'eat', 'speak')
}