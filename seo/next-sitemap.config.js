
// seo/next-sitemap.config.js
module.exports = {
    siteUrl: 'https://thelokals.com',
    generateRobotsTxt: true,
    exclude: ['/admin/*'],
    transform: async (config, path) => {
        // Custom transformation for geo paths if needed
        return {
            loc: path,
            changefreq: config.changefreq,
            priority: config.priority,
            lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
            alternateRefs: config.alternateRefs ?? [],
        }
    },
    additionalPaths: async (config) => {
        // Logic to fetch all enabled service+pincode combos would go here
        // Example: const services = await fetch('https://api.thelokals.com/geo/sitemap-paths');
        // return services.map(s => ({ loc: s.url, priority: 0.8 }));
        return [];
    }
}
