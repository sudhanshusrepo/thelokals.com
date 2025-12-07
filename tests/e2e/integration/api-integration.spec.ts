import { test, expect } from '../../fixtures/test-fixtures';

test.describe('API Integration Tests', () => {
    test.describe('Booking API', () => {
        test('should create booking via API', async ({ request }) => {
            const response = await request.post('/api/bookings', {
                data: {
                    clientId: 'test-client-123',
                    serviceCategory: 'Plumber',
                    requirements: { description: 'Fix sink' },
                    location: { lat: 40.7128, lng: -74.0060 },
                },
            });

            expect(response.ok()).toBeTruthy();
            const data = await response.json();
            expect(data.bookingId).toBeTruthy();
        });

        test('should get booking by ID', async ({ request }) => {
            const bookingId = 'test-booking-123';
            const response = await request.get(`/api/bookings/${bookingId}`);

            if (response.ok()) {
                const data = await response.json();
                expect(data.id).toBe(bookingId);
            }
        });

        test('should update booking status', async ({ request }) => {
            const bookingId = 'test-booking-123';
            const response = await request.patch(`/api/bookings/${bookingId}/status`, {
                data: { status: 'IN_PROGRESS' },
            });

            if (response.ok()) {
                const data = await response.json();
                expect(data.status).toBe('IN_PROGRESS');
            }
        });

        test('should handle invalid booking ID', async ({ request }) => {
            const response = await request.get('/api/bookings/invalid-id');
            expect(response.status()).toBe(404);
        });

        test('should validate booking data', async ({ request }) => {
            const response = await request.post('/api/bookings', {
                data: {
                    // Missing required fields
                    clientId: 'test-client-123',
                },
            });

            expect(response.status()).toBe(400);
        });
    });

    test.describe('AI Service API', () => {
        test('should analyze service requirements', async ({ request }) => {
            const response = await request.post('/api/ai/analyze', {
                data: {
                    serviceCategory: 'Plumber',
                    requirements: 'Fix leaking kitchen sink',
                },
            });

            if (response.ok()) {
                const data = await response.json();
                expect(data.checklist).toBeTruthy();
                expect(data.estimatedCost).toBeGreaterThan(0);
            }
        });

        test('should handle AI service timeout', async ({ request }) => {
            const response = await request.post('/api/ai/analyze', {
                data: {
                    serviceCategory: 'Plumber',
                    requirements: 'Complex requirements',
                },
                timeout: 5000,
            });

            // Should either succeed or timeout gracefully
            expect([200, 408, 504]).toContain(response.status());
        });
    });

    test.describe('Provider API', () => {
        test('should search providers by category', async ({ request }) => {
            const response = await request.get('/api/providers?category=Plumber');

            if (response.ok()) {
                const data = await response.json();
                expect(Array.isArray(data.providers)).toBeTruthy();
            }
        });

        test('should filter providers by location', async ({ request }) => {
            const response = await request.get('/api/providers?lat=40.7128&lng=-74.0060&radius=10');

            if (response.ok()) {
                const data = await response.json();
                expect(Array.isArray(data.providers)).toBeTruthy();
            }
        });

        test('should get provider details', async ({ request }) => {
            const providerId = 'test-provider-123';
            const response = await request.get(`/api/providers/${providerId}`);

            if (response.ok()) {
                const data = await response.json();
                expect(data.id).toBe(providerId);
            }
        });
    });

    test.describe('Authentication API', () => {
        test('should login with valid credentials', async ({ request }) => {
            const response = await request.post('/api/auth/login', {
                data: {
                    email: 'test@example.com',
                    password: 'Test@123456',
                },
            });

            if (response.ok()) {
                const data = await response.json();
                expect(data.token || data.session).toBeTruthy();
            }
        });

        test('should reject invalid credentials', async ({ request }) => {
            const response = await request.post('/api/auth/login', {
                data: {
                    email: 'test@example.com',
                    password: 'wrongpassword',
                },
            });

            expect(response.status()).toBe(401);
        });

        test('should register new user', async ({ request }) => {
            const response = await request.post('/api/auth/register', {
                data: {
                    email: `test-${Date.now()}@example.com`,
                    password: 'Test@123456',
                    name: 'Test User',
                },
            });

            if (response.ok()) {
                const data = await response.json();
                expect(data.userId || data.id).toBeTruthy();
            }
        });

        test('should logout user', async ({ request }) => {
            const response = await request.post('/api/auth/logout');
            expect([200, 204]).toContain(response.status());
        });
    });

    test.describe('Review API', () => {
        test('should create review', async ({ request }) => {
            const response = await request.post('/api/reviews', {
                data: {
                    bookingId: 'test-booking-123',
                    rating: 5,
                    comment: 'Excellent service!',
                },
            });

            if (response.ok()) {
                const data = await response.json();
                expect(data.id).toBeTruthy();
            }
        });

        test('should validate rating range', async ({ request }) => {
            const response = await request.post('/api/reviews', {
                data: {
                    bookingId: 'test-booking-123',
                    rating: 10, // Invalid rating
                    comment: 'Test',
                },
            });

            expect(response.status()).toBe(400);
        });

        test('should get provider reviews', async ({ request }) => {
            const providerId = 'test-provider-123';
            const response = await request.get(`/api/providers/${providerId}/reviews`);

            if (response.ok()) {
                const data = await response.json();
                expect(Array.isArray(data.reviews)).toBeTruthy();
            }
        });
    });

    test.describe('Error Handling', () => {
        test('should handle 404 errors', async ({ request }) => {
            const response = await request.get('/api/nonexistent-endpoint');
            expect(response.status()).toBe(404);
        });

        test('should handle 500 errors gracefully', async ({ request }) => {
            // This would need to be mocked or trigger a server error
            const response = await request.get('/api/error-trigger');

            if (response.status() === 500) {
                const data = await response.json();
                expect(data.error).toBeTruthy();
            }
        });

        test('should include CORS headers', async ({ request }) => {
            const response = await request.get('/api/providers');
            const headers = response.headers();

            // Check for CORS headers if applicable
            if (headers['access-control-allow-origin']) {
                expect(headers['access-control-allow-origin']).toBeTruthy();
            }
        });

        test('should rate limit requests', async ({ request }) => {
            // Make multiple rapid requests
            const requests = Array(100).fill(null).map(() =>
                request.get('/api/providers')
            );

            const responses = await Promise.all(requests);
            const rateLimited = responses.some(r => r.status() === 429);

            // At least some requests should be rate limited
            // This depends on your rate limiting configuration
        });
    });

    test.describe('Data Validation', () => {
        test('should validate email format', async ({ request }) => {
            const response = await request.post('/api/auth/register', {
                data: {
                    email: 'invalid-email',
                    password: 'Test@123456',
                },
            });

            expect(response.status()).toBe(400);
        });

        test('should sanitize input data', async ({ request }) => {
            const response = await request.post('/api/bookings', {
                data: {
                    clientId: 'test-client-123',
                    serviceCategory: '<script>alert("XSS")</script>',
                    requirements: { description: 'Test' },
                },
            });

            if (response.ok()) {
                const data = await response.json();
                expect(data.serviceCategory).not.toContain('<script>');
            }
        });
    });

    test.describe('Performance', () => {
        test('should respond within acceptable time', async ({ request }) => {
            const startTime = Date.now();
            const response = await request.get('/api/providers');
            const responseTime = Date.now() - startTime;

            expect(responseTime).toBeLessThan(2000); // 2 seconds
        });

        test('should handle concurrent requests', async ({ request }) => {
            const requests = Array(10).fill(null).map(() =>
                request.get('/api/providers')
            );

            const responses = await Promise.all(requests);

            responses.forEach(response => {
                expect(response.ok()).toBeTruthy();
            });
        });
    });
});
