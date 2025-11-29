
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { aiService, AIAnalysisResult } from '@core/services/aiService';
import { bookingService } from '@core/services/bookingService';
import { LiveSearch } from './LiveSearch';
import { CATEGORY_DISPLAY_NAMES, LOWERCASE_TO_WORKER_CATEGORY } from '../constants';

export const ServiceRequestPage: React.FC = () => {
    const { category } = useParams<{ category: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [userInput, setUserInput] = useState('');
    const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isBooking, setIsBooking] = useState(false);

    const selectedCategory = category ? LOWERCASE_TO_WORKER_CATEGORY[category.toLowerCase()] : undefined;

    const handleAnalyze = async () => {
        if (!selectedCategory) return;
        setIsLoading(true);
        try {
            const result = await aiService.estimateService(userInput, selectedCategory);
            setAnalysis(result);
        } catch (error) {
            console.error('AI analysis failed:', error);
            alert('Failed to get AI analysis. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBook = async () => {
        if (!user || !analysis || !selectedCategory) {
            // Should show auth modal if not logged in
            return;
        }
        setIsBooking(true);
        try {
            const { bookingId } = await bookingService.createAIBooking({
                clientId: user.id,
                serviceCategory: selectedCategory,
                requirements: { description: userInput },
                aiChecklist: analysis.checklist,
                estimatedCost: analysis.estimatedCost,
                location: { lat: 0, lng: 0 }, // Placeholder
                address: {},
                notes: `AI Analysis Reasoning: ${analysis.reasoning}`
            });
            navigate(`/booking/${bookingId}`);
        } catch (error) {
            console.error('Booking creation failed:', error);
            alert('Failed to create booking. Please try again.');
            setIsBooking(false);
        }
    };

    if (isBooking) {
        return <LiveSearch onCancel={() => setIsBooking(false)} />;
    }

    return (
        <div className="max-w-2xl mx-auto my-8 p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-lg animate-fade-in-up">
            <h1 className="text-3xl font-bold text-center mb-2 dark:text-white">
                {selectedCategory ? CATEGORY_DISPLAY_NAMES[selectedCategory] : 'Service Request'}
            </h1>
            <p className="text-center text-slate-500 dark:text-slate-400 mb-6">
                Describe the issue you're facing, and our AI will generate a preliminary checklist and cost estimate.
            </p>

            <textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="e.g., 'My kitchen sink is leaking from the pipe below'"
                className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 dark:text-white focus:ring-2 focus:ring-teal-500"
                rows={4}
            />

            <button
                onClick={handleAnalyze}
                disabled={isLoading || !userInput.trim()}
                className="mt-4 w-full py-3 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 disabled:bg-slate-400 transition-colors"
            >
                {isLoading ? 'Analyzing...' : 'Analyze Request'}
            </button>

            {analysis && (
                <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-700 rounded-lg animate-fade-in">
                    <h2 className="text-2xl font-bold mb-4 dark:text-white">AI Analysis Result</h2>
                    <div className="mb-4">
                        <p className="font-bold text-lg dark:text-white">Estimated Cost:</p>
                        <p className="text-3xl font-mono text-teal-600 dark:text-teal-400">₹{analysis.estimatedCost}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{analysis.reasoning}</p>
                    </div>
                    <div>
                        <p className="font-bold text-lg dark:text-white">Suggested Checklist:</p>
                        <ul className="list-disc list-inside mt-2 space-y-1">
                            {analysis.checklist.map((item, index) => (
                                <li key={index} className="text-slate-700 dark:text-slate-300">{item}</li>
                            ))}
                        </ul>
                    </div>
                    <button
                        onClick={handleBook}
                        className="mt-6 w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Book Now
                    </button>
                </div>
            )}
        </div>
    );
};
