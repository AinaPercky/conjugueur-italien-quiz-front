import React, { useState } from 'react';
import { Header } from './components/Header';
import { LearnView } from './components/LearnView';
import { QuizView } from './components/QuizView';

export type View = 'learn' | 'quiz';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<View>('learn');

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header currentView={currentView} setCurrentView={setCurrentView} />
            <main className="flex-grow container mx-auto p-4 md:p-8">
                {currentView === 'learn' && <LearnView />}
                {currentView === 'quiz' && <QuizView />}
            </main>
            <footer className="text-center p-4 text-sm text-gray-500 border-t border-gray-200">
                <p>&copy; {new Date().getFullYear()} Conjugueur Italien. Apprenez et amusez-vous !</p>
            </footer>
        </div>
    );
};

export default App;