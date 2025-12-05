Write-Host "Running Unit Tests..."
npm run test
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Running E2E Tests..."
npx playwright test
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
