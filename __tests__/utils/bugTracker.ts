import fs from 'fs';
import path from 'path';

export interface Bug {
    severity: 'P0' | 'P1' | 'P2' | 'P3';
    testName: string;
    error: string;
    screenshot?: string;
    timestamp: string;
    app: 'web-client' | 'web-provider' | 'web-admin' | 'mobile-client';
    status: 'open' | 'fixed' | 'wontfix';
}

export const BUGS_LIST: Record<string, Bug[]> = {
    P0: [], // Critical blockers - Production breaking
    P1: [], // Major UX breaks - Affects core flows
    P2: [], // Minor issues - Polish needed
    P3: [], // Nice to have - Future improvements
};

export function logBug(
    severity: Bug['severity'],
    testName: string,
    error: Error | string,
    app: Bug['app'],
    screenshotPath?: string
): void {
    const bug: Bug = {
        severity,
        testName,
        error: typeof error === 'string' ? error : error.message,
        screenshot: screenshotPath,
        timestamp: new Date().toISOString(),
        app,
        status: 'open',
    };

    BUGS_LIST[severity].push(bug);

    // Log to console
    console.error(`\n🐛 [${severity}] Bug logged in ${testName}:`);
    console.error(`   App: ${app}`);
    console.error(`   Error: ${bug.error}`);
    if (screenshotPath) {
        console.error(`   Screenshot: ${screenshotPath}`);
    }

    // Write to file immediately
    saveBugsList();

    // Slack notification for P0 bugs
    if (severity === 'P0') {
        notifySlack(`🚨 CRITICAL BUG: ${testName} in ${app}\n${bug.error}`);
    }
}

export function saveBugsList(): void {
    const bugsDir = path.join(process.cwd(), 'test-results');
    if (!fs.existsSync(bugsDir)) {
        fs.mkdirSync(bugsDir, { recursive: true });
    }

    const bugsFile = path.join(bugsDir, 'BUGS_LIST.md');
    const content = generateBugsMarkdown();

    fs.writeFileSync(bugsFile, content, 'utf-8');
    console.log(`\n📝 Bugs list saved to: ${bugsFile}`);
}

function generateBugsMarkdown(): string {
    const totalBugs = Object.values(BUGS_LIST).reduce((sum, bugs) => sum + bugs.length, 0);

    let markdown = `# Test Bugs Report\n\n`;
    markdown += `**Generated:** ${new Date().toISOString()}\n`;
    markdown += `**Total Bugs:** ${totalBugs}\n\n`;

    markdown += `## Summary\n\n`;
    markdown += `- 🔴 **P0 Critical:** ${BUGS_LIST.P0.length}\n`;
    markdown += `- 🟠 **P1 Major:** ${BUGS_LIST.P1.length}\n`;
    markdown += `- 🟡 **P2 Minor:** ${BUGS_LIST.P2.length}\n`;
    markdown += `- 🟢 **P3 Polish:** ${BUGS_LIST.P3.length}\n\n`;

    markdown += `---\n\n`;

    // P0 Critical Bugs
    if (BUGS_LIST.P0.length > 0) {
        markdown += `## 🔴 P0 Critical Bugs (${BUGS_LIST.P0.length})\n\n`;
        markdown += `**Action Required:** These bugs block production deployment.\n\n`;
        BUGS_LIST.P0.forEach((bug, index) => {
            markdown += formatBug(bug, index + 1);
        });
        markdown += `\n---\n\n`;
    }

    // P1 Major Bugs
    if (BUGS_LIST.P1.length > 0) {
        markdown += `## 🟠 P1 Major Bugs (${BUGS_LIST.P1.length})\n\n`;
        markdown += `**Action Required:** Fix before next release.\n\n`;
        BUGS_LIST.P1.forEach((bug, index) => {
            markdown += formatBug(bug, index + 1);
        });
        markdown += `\n---\n\n`;
    }

    // P2 Minor Bugs
    if (BUGS_LIST.P2.length > 0) {
        markdown += `## 🟡 P2 Minor Bugs (${BUGS_LIST.P2.length})\n\n`;
        BUGS_LIST.P2.forEach((bug, index) => {
            markdown += formatBug(bug, index + 1);
        });
        markdown += `\n---\n\n`;
    }

    // P3 Polish
    if (BUGS_LIST.P3.length > 0) {
        markdown += `## 🟢 P3 Polish (${BUGS_LIST.P3.length})\n\n`;
        BUGS_LIST.P3.forEach((bug, index) => {
            markdown += formatBug(bug, index + 1);
        });
    }

    return markdown;
}

function formatBug(bug: Bug, index: number): string {
    let md = `### ${index}. ${bug.testName}\n\n`;
    md += `- **App:** ${bug.app}\n`;
    md += `- **Status:** ${bug.status}\n`;
    md += `- **Timestamp:** ${new Date(bug.timestamp).toLocaleString()}\n`;
    md += `- **Error:**\n  \`\`\`\n  ${bug.error}\n  \`\`\`\n`;
    if (bug.screenshot) {
        md += `- **Screenshot:** [View](${bug.screenshot})\n`;
    }
    md += `\n`;
    return md;
}

async function notifySlack(message: string): Promise<void> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    if (!webhookUrl) {
        console.warn('⚠️  SLACK_WEBHOOK_URL not configured. Skipping notification.');
        return;
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: message }),
        });

        if (response.ok) {
            console.log('✅ Slack notification sent');
        } else {
            console.error('❌ Failed to send Slack notification');
        }
    } catch (error) {
        console.error('❌ Error sending Slack notification:', error);
    }
}

export function clearBugsList(): void {
    BUGS_LIST.P0 = [];
    BUGS_LIST.P1 = [];
    BUGS_LIST.P2 = [];
    BUGS_LIST.P3 = [];
}

export function getBugCount(): number {
    return Object.values(BUGS_LIST).reduce((sum, bugs) => sum + bugs.length, 0);
}

export function hasCriticalBugs(): boolean {
    return BUGS_LIST.P0.length > 0;
}

export function exportBugsToJSON(): string {
    const bugsDir = path.join(process.cwd(), 'test-results');
    const jsonFile = path.join(bugsDir, 'bugs.json');

    fs.writeFileSync(jsonFile, JSON.stringify(BUGS_LIST, null, 2), 'utf-8');
    return jsonFile;
}
