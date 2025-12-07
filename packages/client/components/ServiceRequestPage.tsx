import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '../contexts/AuthContext';
import { estimateService, AIAnalysisResult } from '@thelocals/core/services/geminiService';
import { bookingService } from '@thelocals/core/services/bookingService';
import { liveBookingService } from '@thelocals/core/services/liveBookingService';
import { LiveSearch } from './LiveSearch';
import { CATEGORY_DISPLAY_NAMES, LOWERCASE_TO_WORKER_CATEGORY, SERVICE_TYPES_BY_CATEGORY, ONLINE_CATEGORIES } from '../constants';
import { useGeolocation } from '../hooks/useGeolocation';
import { StickyChatCta } from './StickyChatCta';
import { mediaUploadService } from '../services/mediaUploadService';
import { AuthModal } from './AuthModal';
import { useToast } from '../contexts/ToastContext';
import { ProcessingAnimation } from './ProcessingAnimation';
import { pricingService, DynamicPriceResponse } from '../services/pricingService';

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

    // Dynamic Pricing State
    const [dynamicPrice, setDynamicPrice] = useState<DynamicPriceResponse | null>(null);
    const [loadingPrice, setLoadingPrice] = useState(false);
    const [showPriceBreakdown, setShowPriceBreakdown] = useState(false);

    // Fetch dynamic price when analysis is ready
    useEffect(() => {
        if (analysis && selectedCategory && location) {
            fetchDynamicPrice();
        }
    }, [analysis, selectedCategory, location]);

    const fetchDynamicPrice = async () => {
        if (!selectedCategory || !analysis) return;

        setLoadingPrice(true);
        try {
            const priceData = await pricingService.getDynamicPrice({
                serviceCategory: selectedCategory,
                serviceType: serviceTypeId || 'general',
                location: location || { lat: 0, lng: 0 },
                requestedTime: new Date().toISOString(),
            });
            setDynamicPrice(priceData);
        } catch (error) {
            console.error('Failed to fetch dynamic price:', error);
        } finally {
            setLoadingPrice(false);
        }
    };

    // Calculate dynamic price based on checked items
    const currentPrice = useMemo(() => {
        if (!analysis) return 0;

        // If dynamic price is available, use it as base
        if (dynamicPrice?.success) {
            const base = dynamicPrice.price;
            // Adjust based on checklist items (simple logic: 100% price for all items, proportional for fewer)
            const totalItems = analysis.checklist.length;
            const checkedCount = Object.values(checkedItems).filter(Boolean).length;

            if (totalItems === 0) return base;

            // Minimum 70% of price even with few items
            const ratio = 0.7 + (0.3 * (checkedCount / totalItems));
            return Math.round(base * ratio);
        }

        // Base price is 50% of estimated cost
        const basePrice = Math.round(analysis.estimatedCost * 0.5);

        // Each item contributes to the remaining 50%
        const itemValue = Math.round((analysis.estimatedCost * 0.5) / analysis.checklist.length);

        const checkedCount = Object.values(checkedItems).filter(Boolean).length;
        return basePrice + (checkedCount * itemValue);
    }, [analysis, checkedItems, dynamicPrice]);

    const { showToast } = useToast();
    interface LocationState {
        userInput?: string;
        intent?: unknown;
    }
    const locationState = useLocation().state as LocationState | null;

    useEffect(() => {
        if (locationState?.userInput && !userInput && !analysis && !isLoading && selectedCategory) {
            // Auto-trigger analysis from home page input
            handleInput({ type: 'text', data: locationState.userInput });
        }
    }, [locationState, selectedCategory]);

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

        } catch (error: unknown) {
            console.error('Analysis failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            // Provide specific error messages based on error type
            if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
                showToast('Network error. Please check your connection and try again.', 'error');
            } else if (errorMessage.includes('timeout')) {
                showToast('Request timed out. Please try again.', 'error');
            } else if (errorMessage.includes('API key')) {
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

        // Check if location is available, if not, try to get it (only for offline services)
        let bookingLocation = location;
        const isOnlineService = selectedCategory && ONLINE_CATEGORIES.has(selectedCategory);

        if (!isOnlineService && !bookingLocation) {
            try {
                bookingLocation = await getLocationPromise();
            } catch (error) {
                console.error("Failed to get location:", error);
                showToast("We need your location to find nearby providers. Please allow location access.", "warning");
                return;
            }
        }

        // Use dummy location for online services if actual location is missing
        if (isOnlineService && !bookingLocation) {
            bookingLocation = { lat: 0, lng: 0 };
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
                    serviceType: serviceTypeId,
                    isOnline: isOnlineService // Tag as online
                },
                aiChecklist: finalChecklist,
                estimatedCost: currentPrice,
                location: bookingLocation!, // Assert non-null as we handled it above
                address: {},
                notes: `AI Analysis Reasoning: ${analysis.reasoning}${isOnlineService ? ' [ONLINE SERVICE]' : ''}`
            });
            setCreatedBookingId(bookingId);
            showToast('Booking created! Searching for providers...', 'success');
        } catch (error: unknown) {
            console.error('Booking creation failed:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            // Provide specific error messages
            if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
                showToast('Network error. Please check your connection and try again.', 'error');
            } else if (errorMessage.includes('auth') || errorMessage.includes('unauthorized')) {
                showToast('Authentication error. Please sign in again.', 'error');
                setShowAuthModal(true);
            } else if (errorMessage.includes('validation')) {
                showToast('Invalid booking data. Please review your selections.', 'error');
            } else {
                showToast('Failed to create booking. Please try again or contact support.', 'error');
            }
            setIsBooking(false);
        }
    };

    const handleCancelSearch = async () => {
        if (createdBookingId) {
            try {
                // Call the service to update status
                await liveBookingService.cancelBooking(createdBookingId);
                showToast('Booking request cancelled.', 'info');
            } catch (error) {
                console.error('Error cancelling:', error);
                // Even if backend fails, we should probably let user exit the screen
                showToast('Search stopped.', 'info');
            }
        }
        setIsBooking(false);
        setCreatedBookingId(null);
    };

    if (isBooking) {
        return <LiveSearch onCancel={handleCancelSearch} bookingId={createdBookingId || undefined} />;
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
                                    {loadingPrice ? (
                                        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 animate-pulse rounded"></div>
                                    ) : (
                                        <div>
                                            <span className="text-3xl font-bold text-teal-600 dark:text-teal-400">₹{currentPrice}</span>
                                            {dynamicPrice?.success && (
                                                <button
                                                    onClick={() => setShowPriceBreakdown(!showPriceBreakdown)}
                                                    className="block text-xs text-teal-600 hover:underline ml-auto mt-1"
                                                >
                                                    {showPriceBreakdown ? 'Hide breakdown' : 'View breakdown'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            {showPriceBreakdown && dynamicPrice?.breakdown && (
                                <div className="mb-4 p-3 bg-white/60 dark:bg-black/20 rounded-lg text-sm space-y-1 animate-fade-in">
                                    <div className="flex justify-between">
                                        <span>Base Price:</span>
                                        <span>₹{dynamicPrice.breakdown.base}</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                        <span>Time Adjustment:</span>
                                        <span>{dynamicPrice.breakdown.timingMultiplier}x</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                        <span>Location Zone:</span>
                                        <span>{dynamicPrice.breakdown.locationMultiplier}x</span>
                                    </div>
                                    <div className="flex justify-between text-slate-500">
                                        <span>Demand Factor:</span>
                                        <span>{dynamicPrice.breakdown.demandMultiplier}x</span>
                                    </div>
                                    {dynamicPrice.reasoning && (
                                        <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-500 italic">
                                            "{dynamicPrice.reasoning}"
                                        </div>
                                    )}
                                </div>
                            )}

                            <p className="text-sm text-slate-600 dark:text-slate-300 bg-white/50 dark:bg-black/20 p-3 rounded-lg">
                                💡 {analysis.reasoning}
                            </p>
                        </div>

                        <div className="p-6">
                            {/* ... checklist items ... */}
                        </div>

                        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t dark:border-slate-700 sticky bottom-0">
                            <button
                                onClick={handleBook}
                                data-testid="book-now-button"
                                disabled={loadingPrice}
                                className={`w-full py-4 font-bold rounded-xl transition-all shadow-lg transform 
                                    ${loadingPrice
                                        ? 'bg-slate-300 cursor-not-allowed'
                                        : 'bg-teal-600 hover:bg-teal-700 text-white hover:shadow-xl hover:-translate-y-0.5'
                                    }`}
                            >
                                {loadingPrice ? 'Calculating Price...' : `Book Now • ₹${currentPrice}`}
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
                    <ProcessingAnimation
                        message={statusMessage}
                        subMessage="Connecting with local experts"
                    />
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
