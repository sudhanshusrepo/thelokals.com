/**
 * Accessibility Utilities
 * 
 * Helper functions for improving accessibility (WCAG 2.1 AA compliance).
 */

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
    if (typeof window === 'undefined') return;

    const announcement = document.createElement('div');
    announcement.setAttribute('role', 'status');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
        document.body.removeChild(announcement);
    }, 1000);
}

/**
 * Focus trap for modals and overlays
 */
export class FocusTrap {
    private element: HTMLElement;
    private previousFocus: HTMLElement | null = null;
    private focusableElements: HTMLElement[] = [];

    constructor(element: HTMLElement) {
        this.element = element;
    }

    activate() {
        // Store current focus
        this.previousFocus = document.activeElement as HTMLElement;

        // Get all focusable elements
        this.focusableElements = this.getFocusableElements();

        // Focus first element
        if (this.focusableElements.length > 0) {
            this.focusableElements[0].focus();
        }

        // Add event listener for tab key
        this.element.addEventListener('keydown', this.handleKeyDown);
    }

    deactivate() {
        // Remove event listener
        this.element.removeEventListener('keydown', this.handleKeyDown);

        // Restore previous focus
        if (this.previousFocus) {
            this.previousFocus.focus();
        }
    }

    private getFocusableElements(): HTMLElement[] {
        const selector = [
            'a[href]',
            'button:not([disabled])',
            'textarea:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])',
        ].join(', ');

        return Array.from(this.element.querySelectorAll(selector)) as HTMLElement[];
    }

    private handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Tab') return;

        const firstElement = this.focusableElements[0];
        const lastElement = this.focusableElements[this.focusableElements.length - 1];

        if (event.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab
            if (document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        }
    };
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Check if user prefers high contrast
 */
export function prefersHighContrast(): boolean {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-contrast: high)').matches;
}

/**
 * Generate unique ID for accessibility
 */
let idCounter = 0;
export function generateA11yId(prefix: string = 'a11y'): string {
    idCounter++;
    return `${prefix}-${idCounter}`;
}

/**
 * Check if element is visible to screen readers
 */
export function isVisibleToScreenReader(element: HTMLElement): boolean {
    const style = window.getComputedStyle(element);
    return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        element.getAttribute('aria-hidden') !== 'true'
    );
}
