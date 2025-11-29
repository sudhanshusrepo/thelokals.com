import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { estimateService, AIAnalysisResult } from '@core/services/geminiService';
import { bookingService } from '@core/services/bookingService';
import { LiveSearch } from './LiveSearch';
import { CATEGORY_DISPLAY_NAMES, LOWERCASE_TO_WORKER_CATEGORY, SERVICE_TYPES_BY_CATEGORY } from '../constants';
import { useGeolocation } from '../hooks/useGeolocation';
import { ChatInput } from './ChatInput';
import { mediaUploadService } from '../services/mediaUploadService';
import { AuthModal } from './AuthModal';

export const ServiceRequestPage: React.FC = () => {
    const { category } = useParams<{ category: string }>();
    const [searchParams] = useSearchParams();
    const serviceTypeId = searchParams.get('serviceType');
    const navigate = useNavigate();
    const { user } = useAuth();
    const { location, getLocation } = useGeolocation();

    const [userInput, setUserInput] = useState('');
    const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [isBooking, setIsBooking] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Checklist state
    const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

    const selectedCategory = category ? LOWERCASE_TO_WORKER_CATEGORY[category.toLowerCase()] : undefined;

    // Get service type details
    const serviceType = useMemo(() => {
        if (!selectedCategory || !serviceTypeId) return null;
        return SERVICE_TYPES_BY_CATEGORY[selectedCategory]?.find(s => s.id === serviceTypeId);
    }, [selectedCategory, serviceTypeId]);

    // Calculate dynamic price based on checked items
    const currentPrice = useMemo(() => {
        if (!analysis) return 0;

        // Base price is 50% of estimated cost
        const basePrice = Math.round(analysis.estimatedCost * 0.5);

        // Each item contributes to the remaining 50%
        const itemValue = Math.round((analysis.estimatedCost * 0.5) / analysis.checklist.length);

        const checkedCount = Object.values(checkedItems).filter(Boolean).length;
        return basePrice + (checkedCount * itemValue);
    }, [analysis, checkedItems]);

    const handleInput = async (content: { type: 'text' | 'audio' | 'video', data: string | Blob }) => {
        if (!selectedCategory) return;

        setIsLoading(true);
        setStatusMessage('Processing your request...');

        try {
            let textToAnalyze = '';

            if (content.type === 'text') {
                textToAnalyze = content.data as string;
            } else {
                setStatusMessage('Uploading media...');
                const uploadResult = await mediaUploadService.uploadMedia(content.data as Blob, content.type);

                setStatusMessage('Transcribing...');
                textToAnalyze = await mediaUploadService.transcribeMedia(uploadResult.url, content.type);
            }

            setUserInput(textToAnalyze);
            setStatusMessage('Analyzing requirements...');

            // Start fetching location
            getLocation();

            const result = await estimateService(textToAnalyze, selectedCategory);
            setAnalysis(result);

            // Initialize all items as checked
            const initialChecked: Record<number, boolean> = {};
            result.checklist.forEach((_, idx) => {
                initialChecked[idx] = true;
            });
            setCheckedItems(initialChecked);

        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Failed to process request. Please try again.');
        } finally {
            setIsLoading(false);
            setStatusMessage('');
        }
    };

    const handleBook = async () => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        if (!analysis || !selectedCategory) {
            return;
        }

        if (!location) {
            getLocation();
            alert("We need your location to find nearby providers. Please allow location access.");
            return;
        }

        setIsBooking(true);
        try {
            // Filter checklist to only included items
            const finalChecklist = analysis.checklist.filter((_, idx) => checkedItems[idx]);

            const { bookingId } = await bookingService.createAIBooking({
                clientId: user.id,
                serviceCategory: selectedCategory,
                requirements: {
                    description: userInput,
                    serviceType: serviceTypeId
                },
                aiChecklist: finalChecklist,
                estimatedCost: currentPrice,
                location: location,
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
        <div className="min-h-screen pb-32">
            <div className="max-w-2xl mx-auto p-4 sm:p-8 animate-fade-in-up">
                <div className="text-center mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                        {serviceType ? serviceType.name : (selectedCategory ? CATEGORY_DISPLAY_NAMES[selectedCategory] : 'Service Request')}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        {serviceType?.description || "Describe your issue below"}
                    </p>
                </div>

                {/* Analysis Results */}
                {analysis ? (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                        <div className="p-6 bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Estimated Cost</h2>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">Based on selected items</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-3xl font-bold text-teal-600 dark:text-teal-400">₹{currentPrice}</span>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                💡 {analysis.reasoning}
                            </p>
                        </div>

                        <div className="p-6">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm">✓</span>
                                Recommended Services
                            </h3>
                            <div className="space-y-3">
                                {analysis.checklist.map((item, index) => (
                                    <label
                                        key={index}
                                        className={`
                                            flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all
                                            ${checkedItems[index]
                                                ? 'border-teal-500 bg-teal-50 dark:bg-teal-900/20'
                                                : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                                            }
                                        `}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!!checkedItems[index]}
                                            onChange={() => setCheckedItems(prev => ({
                                                ...prev,
                                                [index]: !prev[index]
                                            }))}
                                            className="mt-1 w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                                        />
                                        <span className={`text-sm sm:text-base ${checkedItems[index] ? 'text-slate-900 dark:text-white font-medium' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {item}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 sticky bottom-0">
                            <button
                                onClick={handleBook}
                                className="w-full py-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                            >
                                Book Now • ₹{currentPrice}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <span className="text-4xl">👇</span>
                        </div>
                        <p>Use the chat below to describe your needs</p>
                    </div>
                )}

                {/* Loading Overlay */}
                {isLoading && (
                    <div className="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                        <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-lg font-bold text-slate-800 dark:text-white animate-pulse">{statusMessage}</p>
                    </div>
                )}
            </div>

            {/* Footer Chat Input - Only show if not yet analyzed */}
            {!analysis && (
                <ChatInput
                    onSend={handleInput}
                    isLoading={isLoading}
                    placeholder={`Tell us about your ${serviceType?.name.toLowerCase() || 'issue'}...`}
                />
            )}
        </div>
    );
};
