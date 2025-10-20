import React, { useState, useEffect, useCallback } from 'react';
import { VerbSelector } from './VerbSelector';
import { ConjugationTable } from './ConjugationTable';
import { Spinner } from './Spinner';
import { fetchConjugation } from '../services/geminiService';
import type { VerbData } from '../types';

export const LearnView: React.FC = () => {
    const [selectedVerb, setSelectedVerb] = useState<string>('essere');
    const [verbData, setVerbData] = useState<VerbData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadConjugation = useCallback(async (verb: string) => {
        setIsLoading(true);
        setError(null);
        setVerbData(null);
        try {
            const data = await fetchConjugation(verb);
            setVerbData(data);
        } catch (err) {
            setError('Impossible de charger les données du verbe. Veuillez réessayer plus tard.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadConjugation(selectedVerb);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedVerb]);

    return (
        <div className="space-y-8">
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-800">Tables de Conjugaison</h2>
                <p className="mt-2 text-lg text-gray-600">Sélectionnez un verbe pour afficher sa conjugaison complète.</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <VerbSelector selectedVerb={selectedVerb} onVerbChange={setSelectedVerb} />
            </div>
            
            <div className="mt-8">
                {isLoading && <Spinner />}
                {error && <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
                {verbData && !isLoading && <ConjugationTable data={verbData} />}
            </div>
        </div>
    );
};