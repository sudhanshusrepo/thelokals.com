
// monitoring/cloudflare-analytics.js
// Snippet to be used in Cloudflare Dashboard or GraphQL Analytics API

const query = `
  query GetWorkerAnalytics($zoneTag: string!, $filter: WorkerAnalyticsFilter) {
    viewer {
      zones(filter: { zoneTag: $zoneTag }) {
        workers {
          analytics(filter: $filter, limit: 100) {
            quantiles {
              cpuTimeP99
              durationP99
            }
            totalRequests
            totalErrors
          }
        }
      }
    }
  }
`;

// Example Usage
// POST https://api.cloudflare.com/client/v4/graphql
// Headers: Authorization: Bearer <TOKEN>
