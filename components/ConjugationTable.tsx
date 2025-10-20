import React, { useState } from 'react';
import type { VerbData, MoodData } from '../types';
import { ChevronDownIcon } from './icons/Icons';
import { VerbIcon } from './icons/VerbIcon';

interface AccordionProps {
    mood: MoodData;
    isOpen: boolean;
    onToggle: () => void;
}

const Accordion: React.FC<AccordionProps> = ({ mood, isOpen, onToggle }) => {
    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden mb-4 bg-white">
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
                <h3 className="text-xl font-semibold text-green-700">{mood.mood}</h3>
                <ChevronDownIcon className={`w-6 h-6 transition-transform duration-300 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mood.tenses.map(tense => (
                        <div key={tense.tense} className="border border-gray-200 rounded-md p-4">
                            <h4 className="font-bold text-gray-800 mb-3 text-center border-b pb-2">{tense.tense}</h4>
                            <ul className="space-y-1 text-gray-600">
                                {tense.conjugations.map(c => (
                                    <li key={c.person} className="flex justify-between">
                                        <span className="font-medium">{c.person}</span>
                                        <span>{c.verb}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

interface ConjugationTableProps {
    data: VerbData;
}

export const ConjugationTable: React.FC<ConjugationTableProps> = ({ data }) => {
    const [openMood, setOpenMood] = useState<string | null>(data.conjugations[0]?.mood || null);

    const toggleMood = (moodName: string) => {
        setOpenMood(prev => (prev === moodName ? null : moodName));
    };

    return (
        <div className="w-full">
            <div className="text-center mb-8">
                <div className="flex justify-center items-center h-20 w-20 mx-auto mb-4 bg-green-100 rounded-full text-green-600">
                    <VerbIcon iconSuggestion={data.icon_suggestion} className="w-12 h-12" />
                </div>
                <h2 className="text-4xl font-bold text-gray-800 capitalize">{data.verb}</h2>
                <p className="text-lg italic text-gray-500 mt-1">({data.translation})</p>
            </div>
            {data.conjugations.map(mood => (
                <Accordion
                    key={mood.mood}
                    mood={mood}
                    isOpen={openMood === mood.mood}
                    onToggle={() => toggleMood(mood.mood)}
                />
            ))}
        </div>
    );
};