import React, { useState, useEffect, useCallback } from 'react';
import { generateQuizQuestion } from '../services/geminiService';
import type { QuizQuestion } from '../types';
import { Spinner } from './Spinner';
import { CheckCircleIcon, XCircleIcon, SparklesIcon, ArrowPathIcon, TargetIcon } from './icons/Icons';
import { VERB_CATEGORIES, MODES, TENSES, TENSES_BY_MOOD } from '../constants';
import { VerbIcon } from './icons/VerbIcon';

const formControlClasses = "w-full bg-white border-2 border-gray-300 rounded-lg px-4 py-2 text-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition";

type AnswerFeedback = {
    person: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
};

export const QuizView: React.FC = () => {
    const [question, setQuestion] = useState<QuizQuestion | null>(null);
    const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
    const [feedback, setFeedback] = useState<AnswerFeedback[] | null>(null);
    const [score, setScore] = useState(0);
    const [total, setTotal] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State for random quiz filters
    const [selectedCategory, setSelectedCategory] = useState<string>('All');
    const [selectedMode, setSelectedMode] = useState<string>('All');
    const [selectedTense, setSelectedTense] = useState<string>('All');

    // State for specific verb quiz
    const [specificVerb, setSpecificVerb] = useState<string>('');
    const [specificMode, setSpecificMode] = useState<string>('Indicativo');
    const [specificTense, setSpecificTense] = useState<string>('Presente');

    const [retryList, setRetryList] = useState<QuizQuestion[]>([]);
    const [isRetryMode, setIsRetryMode] = useState<boolean>(false);
    const [askedVerbs, setAskedVerbs] = useState<Set<string>>(new Set());

    // Tense options for random filter
    const availableTenses = selectedMode === 'All'
        ? TENSES
        : TENSES_BY_MOOD[selectedMode] || [];

    // Tense options for specific quiz
    const specificAvailableTenses = TENSES_BY_MOOD[specificMode] || [];

    // Reset tense for random filter if it becomes invalid
    useEffect(() => {
        if (selectedMode !== 'All' && !TENSES_BY_MOOD[selectedMode]?.includes(selectedTense)) {
            setSelectedTense('All');
        }
    }, [selectedMode, selectedTense]);

    // Reset tense for specific quiz if it becomes invalid
    useEffect(() => {
        const tensesForMode = TENSES_BY_MOOD[specificMode] || [];
        if (!tensesForMode.includes(specificTense)) {
            setSpecificTense(tensesForMode[0] || '');
        }
    }, [specificMode]);

    const resetUserAnswers = useCallback((q: QuizQuestion | null) => {
        if (!q) {
            setUserAnswers({});
            return;
        }
        const initialAnswers = q.conjugations.reduce((acc, { person }) => {
            acc[person] = '';
            return acc;
        }, {} as Record<string, string>);
        setUserAnswers(initialAnswers);
    }, []);

    const getNewQuestion = useCallback(async () => {
        setIsLoading(true);
        setIsRetryMode(false);
        setError(null);
        setFeedback(null);
        try {
            const newQuestion = await generateQuizQuestion({
                verbCategory: selectedCategory,
                mode: selectedMode,
                tense: selectedTense,
                exclude: Array.from(askedVerbs),
            });
            setQuestion(newQuestion);
            setAskedVerbs(prev => new Set(prev).add(newQuestion.verb));
            resetUserAnswers(newQuestion);
        } catch (err) {
            setError('Échec du chargement d\'une nouvelle question. Veuillez réessayer.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [selectedCategory, selectedMode, selectedTense, resetUserAnswers, askedVerbs]);

    useEffect(() => {
        setIsLoading(true);
        generateQuizQuestion()
            .then(newQuestion => {
                setQuestion(newQuestion);
                setAskedVerbs(new Set([newQuestion.verb]));
                resetUserAnswers(newQuestion);
            })
            .catch(err => {
                setError('Échec du chargement de la question initiale.');
                console.error(err);
            })
            .finally(() => setIsLoading(false));
    }, [resetUserAnswers]);
    
    const handleAnswerChange = (person: string, value: string) => {
        setUserAnswers(prev => ({ ...prev, [person]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!question) return;
        
        const results = question.conjugations.map(correctPair => {
            const userAnswer = userAnswers[correctPair.person]?.trim() ?? '';
            return {
                person: correctPair.person,
                userAnswer: userAnswer,
                correctAnswer: correctPair.verb,
                isCorrect: userAnswer.toLowerCase() === correctPair.verb.toLowerCase(),
            };
        });
        
        setFeedback(results);
        
        const allCorrect = results.every(r => r.isCorrect);

        if (!isRetryMode) {
            setTotal(total + 1);
            if (allCorrect) {
                setScore(score + 1);
            } else {
                 setRetryList(prev => {
                    const isAlreadyInList = prev.some(q => 
                        q.verb === question.verb && 
                        q.tense === question.tense && 
                        q.mood === question.mood
                    );
                    if (!isAlreadyInList) {
                        return [...prev, question];
                    }
                    return prev;
                });
            }
        }
    };

    const handleNextQuestion = () => {
         if (isRetryMode && retryList.length > 0) {
            const [nextRetryQuestion, ...remaining] = retryList;
            setRetryList(remaining);
            setQuestion(nextRetryQuestion);
            resetUserAnswers(nextRetryQuestion);
            setFeedback(null);
        } else {
            setIsRetryMode(false);
            getNewQuestion();
        }
    }

    const handleStartRetry = () => {
        if (retryList.length > 0) {
            setIsRetryMode(true);
            const [firstRetryQuestion, ...remaining] = retryList;
            setRetryList(remaining);
            setQuestion(firstRetryQuestion);
            resetUserAnswers(firstRetryQuestion);
            setFeedback(null);
        }
    };

    const handleSpecificQuizSubmit = useCallback(async () => {
        if (!specificVerb.trim()) {
            setError('Veuillez entrer un verbe.');
            return;
        }
        setIsLoading(true);
        setIsRetryMode(false);
        setError(null);
        setFeedback(null);
        try {
            const newQuestion = await generateQuizQuestion({
                verb: specificVerb.trim(),
                mode: specificMode,
                tense: specificTense,
            });
            setQuestion(newQuestion);
            resetUserAnswers(newQuestion);
        } catch (err) {
            setError("Impossible de générer un quiz pour cette combinaison. Vérifiez que le verbe, le mode et le temps sont valides.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, [specificVerb, specificMode, specificTense, resetUserAnswers]);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Testez-vous ! (Quiz)</h2>
                <p className="mt-2 text-lg text-gray-600">
                    {isRetryMode ? "Mode révision : Réessayez les questions incorrectes." : "Conjuguez le verbe pour toutes les personnes."}
                </p>
                <div className="mt-4 text-2xl font-bold text-green-600 bg-green-100 inline-block px-6 py-2 rounded-full">
                    Score : {score} / {total}
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Quiz Aléatoire</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                        <select id="category-select" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} className={formControlClasses}>
                            <option value="All">Toutes</option>
                            {Object.keys(VERB_CATEGORIES).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="mode-select" className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                        <select id="mode-select" value={selectedMode} onChange={e => setSelectedMode(e.target.value)} className={formControlClasses}>
                            <option value="All">Tous</option>
                            {MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="tense-select" className="block text-sm font-medium text-gray-700 mb-1">Temps</label>
                        <select id="tense-select" value={selectedTense} onChange={e => setSelectedTense(e.target.value)} className={formControlClasses}>
                            <option value="All">Tous</option>
                            {availableTenses.map(tense => <option key={tense} value={tense}>{tense}</option>)}
                        </select>
                    </div>
                </div>
                <button onClick={getNewQuestion} className="mt-6 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 shadow-md flex items-center justify-center space-x-2">
                    <SparklesIcon className="w-5 h-5"/>
                    <span>Générer une nouvelle question</span>
                </button>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mb-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Quiz Ciblé</h3>
                <p className="text-sm text-gray-600 mb-4">Entraînez-vous sur un verbe, un mode et un temps spécifiques.</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label htmlFor="specific-verb-input" className="block text-sm font-medium text-gray-700 mb-1">Verbe</label>
                        <input
                            id="specific-verb-input"
                            type="text"
                            value={specificVerb}
                            onChange={e => setSpecificVerb(e.target.value)}
                            placeholder="Ex: andare"
                            className={formControlClasses}
                        />
                    </div>
                    <div>
                        <label htmlFor="specific-mode-select" className="block text-sm font-medium text-gray-700 mb-1">Mode</label>
                        <select id="specific-mode-select" value={specificMode} onChange={e => setSpecificMode(e.target.value)} className={formControlClasses}>
                            {MODES.map(mode => <option key={mode} value={mode}>{mode}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="specific-tense-select" className="block text-sm font-medium text-gray-700 mb-1">Temps</label>
                        <select id="specific-tense-select" value={specificTense} onChange={e => setSpecificTense(e.target.value)} className={formControlClasses}>
                            {specificAvailableTenses.map(tense => <option key={tense} value={tense}>{tense}</option>)}
                        </select>
                    </div>
                </div>
                <button onClick={handleSpecificQuizSubmit} className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-md flex items-center justify-center space-x-2">
                    <TargetIcon className="w-5 h-5"/>
                    <span>Lancer le quiz ciblé</span>
                </button>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 transition-all duration-300">
                {isLoading && <Spinner />}
                {error && <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}
                {question && !isLoading && (
                    <div className="space-y-6">
                        <div className="text-center">
                             <div className="flex justify-center items-center h-16 w-16 mx-auto mb-4 bg-green-100 rounded-full text-green-600">
                                <VerbIcon iconSuggestion={question.icon_suggestion} className="w-10 h-10" />
                            </div>
                            <p className="text-sm font-medium text-gray-500">Conjuguez le verbe</p>
                            <p className="text-4xl font-bold text-green-700 capitalize">{question.verb}</p>
                            <p className="text-md italic text-gray-500">({question.translation})</p>
                            <p className="text-lg text-gray-600 mt-1">{question.mood} - {question.tense}</p>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                             {question.conjugations.map(({ person }) => (
                                <div key={person} className="flex items-center space-x-4">
                                    <label className="w-20 text-lg font-semibold text-gray-600 text-right">{person}</label>
                                    <input
                                        type="text"
                                        value={userAnswers[person] || ''}
                                        onChange={(e) => handleAnswerChange(person, e.target.value)}
                                        disabled={!!feedback}
                                        className="flex-grow text-lg p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        aria-label={`Conjugaison pour ${person}`}
                                    />
                                </div>
                            ))}
                            {feedback === null && (
                                <button type="submit" className="mt-4 w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-transform transform hover:scale-105 shadow-md">
                                    Vérifier
                                </button>
                            )}
                        </form>

                        {feedback !== null && (
                           <div className="mt-6 space-y-3">
                                <h4 className="text-xl font-bold text-center mb-4 text-gray-800">Résultats</h4>
                                {feedback.map(res => (
                                    <div key={res.person} className={`p-3 rounded-lg flex items-center justify-between text-lg border ${res.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                        <div className="flex items-center space-x-3">
                                            {res.isCorrect ? <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0"/> : <XCircleIcon className="w-6 h-6 text-red-500 flex-shrink-0"/>}
                                            <span className="font-bold w-16 text-gray-700">{res.person}</span>
                                            <span className={`break-all ${res.isCorrect ? 'text-gray-800' : 'text-red-700 line-through'}`}>{res.userAnswer || '...'}</span>
                                        </div>
                                        {!res.isCorrect && (
                                            <div className="text-right ml-4">
                                               <span className="font-bold text-green-700 break-all">{res.correctAnswer}</span>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        {feedback !== null && (
                            <div className="mt-6 space-y-3">
                                {isRetryMode && retryList.length === 0 && !isLoading && (
                                    <div className="text-center p-3 bg-green-100 text-green-800 rounded-lg">
                                        Vous avez terminé la session de révision !
                                    </div>
                                )}
                                <button onClick={handleNextQuestion} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 flex items-center justify-center space-x-2 shadow-md">
                                    <SparklesIcon className="w-5 h-5"/>
                                    <span>
                                        {isRetryMode 
                                            ? (retryList.length > 0 ? `Prochaine question à réessayer (${retryList.length})` : 'Fin de la révision & Nouvelle question') 
                                            : 'Question suivante'
                                        }
                                    </span>
                                </button>
                                 {!isRetryMode && retryList.length > 0 && (
                                    <button 
                                        onClick={handleStartRetry} 
                                        className="w-full bg-orange-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-orange-600 transition-transform transform hover:scale-105 flex items-center justify-center space-x-2 shadow-md"
                                    >
                                        <ArrowPathIcon className="w-5 h-5"/>
                                        <span>Réessayer {retryList.length} questions incorrectes</span>
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};