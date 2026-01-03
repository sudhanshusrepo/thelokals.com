import { defineCloudflareConfig } from '@opennextjs/cloudflare';

export default defineCloudflareConfig({
    incremental: {
        disk: true,
        memory: true,
    },
});
