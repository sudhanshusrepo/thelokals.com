import { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for Homepage
 * Encapsulates all interactions with the homepage
 */
export class HomePage {
    readonly page: Page;
    readonly header: Locator;
    readonly searchInput: Locator;
    readonly categoryCards: Locator;
    readonly signInButton: Locator;
    readonly heroSection: Locator;
    readonly featuresSection: Locator;

    constructor(page: Page) {
        this.page = page;
        this.header = page.locator('header');
        this.searchInput = page.locator('input[type="search"]');
        this.categoryCards = page.locator('.category-card, [data-testid="category-card"]');
        this.signInButton = page.getByRole('button', { name: /sign in/i });
        this.heroSection = page.locator('.hero-section, [data-testid="hero"]');
        this.featuresSection = page.locator('.features-section, [data-testid="features"]');
    }

    async goto() {
        await this.page.goto('/');
        await this.page.waitForLoadState('networkidle');
    }

    async selectCategory(category: string) {
        await this.page.click(`text=${category}`);
        await this.page.waitForLoadState('networkidle');
    }

    async searchService(query: string) {
        if (await this.searchInput.count() > 0) {
            await this.searchInput.fill(query);
            await this.searchInput.press('Enter');
        }
    }

    async clickSignIn() {
        if (await this.signInButton.count() > 0) {
            await this.signInButton.first().click();
        }
    }

    async getCategoryCount() {
        return await this.categoryCards.count();
    }

    async isCategoryVisible(category: string) {
        return await this.page.locator(`text=${category}`).isVisible();
    }
}

/**
 * Page Object Model for Authentication
 */
export class AuthPage {
    readonly page: Page;
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly submitButton: Locator;
    readonly errorMessage: Locator;
    readonly successMessage: Locator;
    readonly googleSignInButton: Locator;
    readonly forgotPasswordLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.locator('input[type="email"]');
        this.passwordInput = page.locator('input[type="password"]');
        this.submitButton = page.locator('button[type="submit"]');
        this.errorMessage = page.locator('.error-message, [role="alert"]');
        this.successMessage = page.locator('.success-message');
        this.googleSignInButton = page.locator('button:has-text("Google")');
        this.forgotPasswordLink = page.locator('a:has-text("Forgot")');
    }

    async login(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    async loginWithGoogle() {
        await this.googleSignInButton.click();
    }

    async getErrorMessage() {
        if (await this.errorMessage.isVisible()) {
            return await this.errorMessage.textContent();
        }
        return null;
    }

    async isLoginSuccessful() {
        // Check if redirected to dashboard or home
        const url = this.page.url();
        return url.includes('/dashboard') || url.includes('/');
    }
}

/**
 * Page Object Model for Service Request
 */
export class ServiceRequestPage {
    readonly page: Page;
    readonly categorySelect: Locator;
    readonly descriptionInput: Locator;
    readonly locationInput: Locator;
    readonly submitButton: Locator;
    readonly aiChecklistSection: Locator;
    readonly estimatedCostDisplay: Locator;
    readonly confirmButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.categorySelect = page.locator('select[name="category"]');
        this.descriptionInput = page.locator('textarea[name="description"], textarea[name="requirements"]');
        this.locationInput = page.locator('input[name="location"]');
        this.submitButton = page.locator('button:has-text("Get AI Estimate"), button:has-text("Submit")');
        this.aiChecklistSection = page.locator('.ai-checklist, [data-testid="ai-checklist"]');
        this.estimatedCostDisplay = page.locator('.estimated-cost, [data-testid="estimated-cost"]');
        this.confirmButton = page.locator('button:has-text("Confirm")');
    }

    async goto(category?: string) {
        if (category) {
            await this.page.goto(`/service/${category.toLowerCase()}`);
        } else {
            await this.page.goto('/service');
        }
        await this.page.waitForLoadState('networkidle');
    }

    async fillServiceRequest(data: {
        category?: string;
        description: string;
        location: string;
    }) {
        if (data.category && await this.categorySelect.count() > 0) {
            await this.categorySelect.selectOption(data.category);
        }

        if (await this.descriptionInput.count() > 0) {
            await this.descriptionInput.fill(data.description);
        }

        if (await this.locationInput.count() > 0) {
            await this.locationInput.fill(data.location);
        }
    }

    async submitRequest() {
        await this.submitButton.first().click();
        await this.page.waitForLoadState('networkidle');
    }

    async isAIChecklistVisible() {
        return await this.aiChecklistSection.isVisible();
    }

    async getEstimatedCost() {
        if (await this.estimatedCostDisplay.isVisible()) {
            const text = await this.estimatedCostDisplay.textContent();
            return text?.match(/\d+/)?.[0];
        }
        return null;
    }

    async confirmBooking() {
        await this.confirmButton.click();
        await this.page.waitForLoadState('networkidle');
    }
}

/**
 * Page Object Model for Dashboard
 */
export class DashboardPage {
    readonly page: Page;
    readonly bookingsTab: Locator;
    readonly profileTab: Locator;
    readonly bookingCards: Locator;
    readonly createBookingButton: Locator;
    readonly filterDropdown: Locator;
    readonly searchInput: Locator;

    constructor(page: Page) {
        this.page = page;
        this.bookingsTab = page.locator('a:has-text("Bookings"), button:has-text("Bookings")');
        this.profileTab = page.locator('a:has-text("Profile"), button:has-text("Profile")');
        this.bookingCards = page.locator('.booking-card, [data-testid="booking-card"]');
        this.createBookingButton = page.locator('button:has-text("New Booking"), button:has-text("Create")');
        this.filterDropdown = page.locator('select[name="filter"], select[name="status"]');
        this.searchInput = page.locator('input[type="search"]');
    }

    async goto() {
        await this.page.goto('/dashboard/bookings');
        await this.page.waitForLoadState('networkidle');
    }

    async switchToBookings() {
        await this.bookingsTab.first().click();
        await this.page.waitForLoadState('networkidle');
    }

    async switchToProfile() {
        await this.profileTab.first().click();
        await this.page.waitForLoadState('networkidle');
    }

    async getBookingCount() {
        return await this.bookingCards.count();
    }

    async filterBookings(status: string) {
        if (await this.filterDropdown.count() > 0) {
            await this.filterDropdown.selectOption(status);
            await this.page.waitForLoadState('networkidle');
        }
    }

    async searchBookings(query: string) {
        if (await this.searchInput.count() > 0) {
            await this.searchInput.fill(query);
            await this.page.waitForTimeout(500);
        }
    }

    async clickBooking(index: number = 0) {
        await this.bookingCards.nth(index).click();
        await this.page.waitForLoadState('networkidle');
    }
}

/**
 * Page Object Model for Booking Details
 */
export class BookingDetailsPage {
    readonly page: Page;
    readonly statusBadge: Locator;
    readonly providerInfo: Locator;
    readonly serviceDetails: Locator;
    readonly cancelButton: Locator;
    readonly reviewButton: Locator;
    readonly chatButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.statusBadge = page.locator('.status-badge, [data-testid="status"]');
        this.providerInfo = page.locator('.provider-info, [data-testid="provider"]');
        this.serviceDetails = page.locator('.service-details, [data-testid="details"]');
        this.cancelButton = page.locator('button:has-text("Cancel")');
        this.reviewButton = page.locator('button:has-text("Review"), button:has-text("Rate")');
        this.chatButton = page.locator('button:has-text("Chat"), button:has-text("Message")');
    }

    async getStatus() {
        return await this.statusBadge.textContent();
    }

    async cancelBooking() {
        await this.cancelButton.click();

        // Confirm cancellation if modal appears
        const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Yes")');
        if (await confirmButton.count() > 0) {
            await confirmButton.click();
        }

        await this.page.waitForLoadState('networkidle');
    }

    async leaveReview(rating: number, comment: string) {
        await this.reviewButton.click();

        // Click star rating
        await this.page.locator(`[data-rating="${rating}"]`).click();

        // Fill comment
        await this.page.locator('textarea[name="comment"]').fill(comment);

        // Submit
        await this.page.locator('button[type="submit"]').click();
        await this.page.waitForLoadState('networkidle');
    }
}
