import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getEnvVar } from './config';

describe('Config Service', () => {
    const originalEnv = process.env;

    beforeEach(() => {
        vi.resetModules();
        process.env = { ...originalEnv };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    describe('getEnvVar', () => {
        it('should return value from process.env', () => {
            process.env.TEST_VAR = 'test-value';
            expect(getEnvVar('TEST_VAR')).toBe('test-value');
        });

        it('should return default value if env var is missing', () => {
            expect(getEnvVar('NON_EXISTENT', 'default')).toBe('default');
        });

        it('should return empty string if env var missing and no default provided', () => {
            expect(getEnvVar('NON_EXISTENT')).toBe('');
        });

        it('should prioritize process.env over defaults', () => {
            process.env.TEST_VAR = 'env-value';
            expect(getEnvVar('TEST_VAR', 'default')).toBe('env-value');
        });
    });
});
