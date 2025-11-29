import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '../contexts/AuthContext';
import { estimateService, AIAnalysisResult } from '@core/services/geminiService';
import { bookingService } from '@core/services/bookingService';
import { LiveSearch } from './LiveSearch';
import { CATEGORY_DISPLAY_NAMES, LOWERCASE_TO_WORKER_CATEGORY, SERVICE_TYPES_BY_CATEGORY } from '../constants';
import { useGeolocation } from '../hooks/useGeolocation';
import { StickyChatCta } from './StickyChatCta';
import { mediaUploadService } from '../services/mediaUploadService';
import { AuthModal } from './AuthModal';
import { useToast } from '../contexts/ToastContext';

export const ServiceRequestPage: React.FC = () => {
    const { category } = useParams<{ category: string }>();
    const [searchParams] = useSearchParams();
    const serviceTypeId = searchParams.get('serviceType');
    const navigate = useNavigate();
    const { user } = useAuth();
    const { location, getLocation, getLocationPromise } = useGeolocation();

    const [userInput, setUserInput] = useState('');
    const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [isBooking, setIsBooking] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [createdBookingId, setCreatedBookingId] = useState<string | null>(null);

    // Checklist state
    const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

    const selectedCategory = category ? LOWERCASE_TO_WORKER_CATEGORY[category.toLowerCase()] : undefined;

    // Get service type details
    const serviceType = useMemo(() => {
        if (!selectedCategory || !serviceTypeId) return null;
        return SERVICE_TYPES_BY_CATEGORY[selectedCategory]?.find(s => s.id === serviceTypeId);
    }, [selectedCategory, serviceTypeId]);

    // SEO Content
    const pageTitle = serviceType
        ? `Book ${serviceType.name} - thelokals.com`
        : selectedCategory
            ? `Book ${CATEGORY_DISPLAY_NAMES[selectedCategory]} - thelokals.com`
            : 'Service Request - thelokals.com';

    const pageDescription = serviceType
        ? `Get instant AI quotes for ${serviceType.name.toLowerCase()}. Book trusted professionals on thelokals.com.`
        : selectedCategory
            ? `Find top-rated ${CATEGORY_DISPLAY_NAMES[selectedCategory].toLowerCase()} professionals near you. AI-powered booking on thelokals.com.`
            : 'Describe your service needs and get matched with local professionals instantly using our AI booking system.';

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

    const { showToast } = useToast();

    const handleInput = async (content: { type: 'text' | 'audio' | 'video', data: string | Blob }) => {
        if (!selectedCategory) return;

        // Validation
        if (content.type === 'text' && (content.data as string).trim().length < 10) {
            showToast("Please provide more details (at least 10 characters).", "warning");
            return;
        }

        setIsLoading(true);
        setStatusMessage('Processing your request...');

        try {
            let textToAnalyze = '';

            if (content.type === 'text') {
                textToAnalyze = content.data as string;
            } else {
                setStatusMessage('Uploading media...');
                try {
                    const uploadResult = await mediaUploadService.uploadMedia(content.data as Blob, content.type);
                    setStatusMessage('Transcribing...');
                    textToAnalyze = await mediaUploadService.transcribeMedia(uploadResult.url, content.type);
                } catch (uploadError) {
                    console.error('Media upload failed:', uploadError);
                    showToast('Failed to upload media. Please try text input instead.', 'error');
                    return;
                }
            }

            setUserInput(textToAnalyze);
            setStatusMessage('Analyzing requirements...');

            // Start fetching location
            getLocation();

            // Add timeout for AI analysis (10 seconds)
            const analysisPromise = estimateService(textToAnalyze, selectedCategory);
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('AI analysis timeout')), 10000)
            );

            try {
                const result = await Promise.race([analysisPromise, timeoutPromise]);
                setAnalysis(result);

                // Initialize all items as checked
                const initialChecked: Record<number, boolean> = {};
                result.checklist.forEach((_, idx) => {
                    initialChecked[idx] = true;
                });
                setCheckedItems(initialChecked);
                showToast('Analysis complete! Review the recommendations below.', 'success');
            } catch (timeoutError) {
                console.error('AI analysis timeout:', timeoutError);
                showToast('AI analysis is taking longer than expected. Please try again or simplify your request.', 'warning');
                // Optionally provide fallback or manual entry option
                return;
            }

        } catch (error: any) {
            console.error('Analysis failed:', error);

            // Provide specific error messages based on error type
            if (error.message?.includes('network') || error.message?.includes('fetch')) {
                showToast('Network error. Please check your connection and try again.', 'error');
            } else if (error.message?.includes('timeout')) {
                showToast('Request timed out. Please try again.', 'error');
            } else if (error.message?.includes('API key')) {
                showToast('Service configuration error. Please contact support.', 'error');
            } else {
                showToast('Failed to process request. Please try again or contact support.', 'error');
            }
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
            showToast('Please complete the AI analysis first.', 'warning');
            return;
        }

        // Check if location is available, if not, try to get it
        let bookingLocation = location;
        if (!bookingLocation) {
            try {
                bookingLocation = await getLocationPromise();
            } catch (error) {
                console.error("Failed to get location:", error);
                showToast("We need your location to find nearby providers. Please allow location access.", "warning");
                return;
            }
        }

        // Check if at least one item is selected
        const hasSelectedItems = Object.values(checkedItems).some(Boolean);
        if (!hasSelectedItems) {
            showToast('Please select at least one service from the checklist.', 'warning');
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
                location: bookingLocation,
                address: {},
                notes: `AI Analysis Reasoning: ${analysis.reasoning}`
            });
            setCreatedBookingId(bookingId);
            showToast('Booking created! Searching for providers...', 'success');
        } catch (error: any) {
            console.error('Booking creation failed:', error);

            // Provide specific error messages
            if (error.message?.includes('network') || error.message?.includes('fetch')) {
                showToast('Network error. Please check your connection and try again.', 'error');
            } else if (error.message?.includes('auth') || error.message?.includes('unauthorized')) {
                showToast('Authentication error. Please sign in again.', 'error');
                setShowAuthModal(true);
            } else if (error.message?.includes('validation')) {
                showToast('Invalid booking data. Please review your selections.', 'error');
            } else {
                showToast('Failed to create booking. Please try again or contact support.', 'error');
            }
            setIsBooking(false);
        }
    };

    if (isBooking) {
        return <LiveSearch onCancel={() => setIsBooking(false)} bookingId={createdBookingId || undefined} />;
    }

    return (
        <div className="min-h-screen pb-32" data-testid="service-request-page">
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="keywords" content={`${selectedCategory ? CATEGORY_DISPLAY_NAMES[selectedCategory].toLowerCase() : 'service'}, book online, AI quote, thelokals`} />
            </Helmet>
            {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
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
                    <div
                        data-testid="ai-checklist-section"
                        className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700"
                    >
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
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm">✓</span>
                                    Recommended Services
                                </h3>
                                <button
                                    onClick={() => {
                                        setAnalysis(null);
                                        setCheckedItems({});
                                    }}
                                    data-testid="edit-requirements-button"
                                    className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit Requirements
                                </button>
                            </div>
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
                                data-testid="book-now-button"
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
                <StickyChatCta
                    serviceCategory={selectedCategory}
                    onSend={handleInput}
                    placeholder={`Tell us about your ${serviceType?.name.toLowerCase() || 'issue'}...`}
                />
            )}
        </div>
    );
};
