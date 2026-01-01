/**
 * Client-side Rate Limiter
 * 
 * Implements token bucket algorithm for rate limiting client-side requests.
 */

interface RateLimiterConfig {
    maxTokens: number;
    refillRate: number; // tokens per second
    refillInterval: number; // milliseconds
}

class RateLimiter {
    private tokens: number;
    private lastRefill: number;
    private config: RateLimiterConfig;

    constructor(config: RateLimiterConfig) {
        this.config = config;
        this.tokens = config.maxTokens;
        this.lastRefill = Date.now();
    }

    private refill() {
        const now = Date.now();
        const timePassed = now - this.lastRefill;
        const tokensToAdd = (timePassed / this.config.refillInterval) * this.config.refillRate;

        this.tokens = Math.min(this.config.maxTokens, this.tokens + tokensToAdd);
        this.lastRefill = now;
    }

    tryConsume(tokens: number = 1): boolean {
        this.refill();

        if (this.tokens >= tokens) {
            this.tokens -= tokens;
            return true;
        }

        return false;
    }

    getAvailableTokens(): number {
        this.refill();
        return Math.floor(this.tokens);
    }
}

// Pre-configured rate limiters for different use cases
export const searchRateLimiter = new RateLimiter({
    maxTokens: 10,
    refillRate: 2,
    refillInterval: 1000,
});

export const apiRateLimiter = new RateLimiter({
    maxTokens: 30,
    refillRate: 5,
    refillInterval: 1000,
});

export const authRateLimiter = new RateLimiter({
    maxTokens: 5,
    refillRate: 1,
    refillInterval: 60000, // 1 minute
});

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait) as unknown as NodeJS.Timeout;
    };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle: boolean = false;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}
