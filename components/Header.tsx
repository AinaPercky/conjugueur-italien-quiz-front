import React from 'react';
import type { View } from '../App';
import { BookOpenIcon, QuestionMarkCircleIcon } from './icons/Icons';

interface HeaderProps {
    currentView: View;
    setCurrentView: (view: View) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, setCurrentView }) => {
    const navItemClasses = "flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200";
    const activeClasses = "bg-green-600 text-white shadow-md";
    const inactiveClasses = "text-gray-600 hover:bg-green-100 hover:text-green-800";

    return (
        <header className="bg-white shadow-sm sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                            C
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Conjugueur Italien</h1>
                    </div>
                    <nav className="flex space-x-2 p-1 bg-gray-100 rounded-lg">
                        <button
                            onClick={() => setCurrentView('learn')}
                            className={`${navItemClasses} ${currentView === 'learn' ? activeClasses : inactiveClasses}`}
                        >
                            <BookOpenIcon className="w-5 h-5" />
                            <span>Apprendre</span>
                        </button>
                        <button
                            onClick={() => setCurrentView('quiz')}
                            className={`${navItemClasses} ${currentView === 'quiz' ? activeClasses : inactiveClasses}`}
                        >
                           <QuestionMarkCircleIcon className="w-5 h-5" />
                            <span>Quiz</span>
                        </button>
                    </nav>
                </div>
            </div>
        </header>
    );
};