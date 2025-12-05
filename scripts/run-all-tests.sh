#!/bin/bash
echo "Running Unit Tests..."
npm run test

echo "Running E2E Tests..."
npx playwright test
