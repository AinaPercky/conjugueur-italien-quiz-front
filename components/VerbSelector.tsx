import React from 'react';
import { VERB_CATEGORIES } from '../constants';

interface VerbSelectorProps {
    selectedVerb: string;
    onVerbChange: (verb: string) => void;
}

export const VerbSelector: React.FC<VerbSelectorProps> = ({ selectedVerb, onVerbChange }) => {
    return (
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
            <label htmlFor="verb-selector" className="text-lg font-semibold text-gray-700">Sélectionnez un verbe :</label>
            <select
                id="verb-selector"
                value={selectedVerb}
                onChange={(e) => onVerbChange(e.target.value)}
                className="w-full md:w-auto flex-grow bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
            >
                {Object.entries(VERB_CATEGORIES).map(([category, verbs]) => (
                    <optgroup label={category} key={category}>
                        {verbs.map(verb => (
                            <option key={verb} value={verb}>
                                {verb.charAt(0).toUpperCase() + verb.slice(1)}
                            </option>
                        ))}
                    </optgroup>
                ))}
            </select>
        </div>
    );
};