const fs = require('fs');
const path = require('path');

// Read all test result files
const testResultsDir = path.join(__dirname, '../test-results');
const bugsListPath = path.join(testResultsDir, 'BUGS_LIST.md');

function generateBugsList() {
    const bugs = {
        P0: [],
        P1: [],
        P2: [],
        P3: []
    };

    // Scan test results for failures
    if (fs.existsSync(testResultsDir)) {
        const files = fs.readdirSync(testResultsDir, { recursive: true });

        files.forEach(file => {
            if (file.endsWith('.json')) {
                const filePath = path.join(testResultsDir, file);
                try {
                    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

                    // Parse Playwright results
                    if (data.suites) {
                        data.suites.forEach(suite => {
                            suite.specs.forEach(spec => {
                                spec.tests.forEach(test => {
                                    if (test.results[0]?.status === 'failed') {
                                        const bug = {
                                            testName: `${suite.title} > ${spec.title}`,
                                            error: test.results[0].error?.message || 'Unknown error',
                                            screenshot: test.results[0].attachments?.find(a => a.name === 'screenshot')?.path,
                                            timestamp: new Date().toISOString(),
                                            app: detectApp(suite.file),
                                            status: 'open'
                                        };

                                        // Categorize by severity
                                        const severity = detectSeverity(bug.error);
                                        bugs[severity].push(bug);
                                    }
                                });
                            });
                        });
                    }
                } catch (error) {
                    console.error(`Error parsing ${file}:`, error.message);
                }
            }
        });
    }

    // Generate markdown
    const markdown = generateMarkdown(bugs);

    // Write to file
    fs.writeFileSync(bugsListPath, markdown, 'utf-8');
    console.log(`✅ Bugs list generated: ${bugsListPath}`);

    // Print summary
    const totalBugs = Object.values(bugs).reduce((sum, list) => sum + list.length, 0);
    console.log(`\n📊 Bug Summary:`);
    console.log(`   🔴 P0 Critical: ${bugs.P0.length}`);
    console.log(`   🟠 P1 Major: ${bugs.P1.length}`);
    console.log(`   🟡 P2 Minor: ${bugs.P2.length}`);
    console.log(`   🟢 P3 Polish: ${bugs.P3.length}`);
    console.log(`   📝 Total: ${totalBugs}\n`);

    // Exit with error if P0 bugs exist
    if (bugs.P0.length > 0) {
        console.error(`❌ CRITICAL: ${bugs.P0.length} P0 bugs found. Production deployment blocked.`);
        process.exit(1);
    }
}

function detectApp(filePath) {
    if (filePath.includes('web-client')) return 'web-client';
    if (filePath.includes('web-provider')) return 'web-provider';
    if (filePath.includes('web-admin')) return 'web-admin';
    if (filePath.includes('mobile-client')) return 'mobile-client';
    return 'unknown';
}

function detectSeverity(errorMessage) {
    const critical = ['crash', 'fatal', 'cannot', 'blocked', 'timeout'];
    const major = ['failed', 'error', 'broken', 'invalid'];
    const minor = ['warning', 'deprecated', 'slow'];

    const lowerError = errorMessage.toLowerCase();

    if (critical.some(keyword => lowerError.includes(keyword))) return 'P0';
    if (major.some(keyword => lowerError.includes(keyword))) return 'P1';
    if (minor.some(keyword => lowerError.includes(keyword))) return 'P2';
    return 'P3';
}

function generateMarkdown(bugs) {
    const totalBugs = Object.values(bugs).reduce((sum, list) => sum + list.length, 0);

    let md = `# Test Bugs Report\n\n`;
    md += `**Generated:** ${new Date().toISOString()}\n`;
    md += `**Total Bugs:** ${totalBugs}\n\n`;

    md += `## Summary\n\n`;
    md += `- 🔴 **P0 Critical:** ${bugs.P0.length}\n`;
    md += `- 🟠 **P1 Major:** ${bugs.P1.length}\n`;
    md += `- 🟡 **P2 Minor:** ${bugs.P2.length}\n`;
    md += `- 🟢 **P3 Polish:** ${bugs.P3.length}\n\n`;

    md += `---\n\n`;

    // P0 Critical
    if (bugs.P0.length > 0) {
        md += `## 🔴 P0 Critical Bugs (${bugs.P0.length})\n\n`;
        md += `**Action Required:** These bugs block production deployment.\n\n`;
        bugs.P0.forEach((bug, i) => {
            md += formatBug(bug, i + 1);
        });
        md += `\n---\n\n`;
    }

    // P1 Major
    if (bugs.P1.length > 0) {
        md += `## 🟠 P1 Major Bugs (${bugs.P1.length})\n\n`;
        md += `**Action Required:** Fix before next release.\n\n`;
        bugs.P1.forEach((bug, i) => {
            md += formatBug(bug, i + 1);
        });
        md += `\n---\n\n`;
    }

    // P2 Minor
    if (bugs.P2.length > 0) {
        md += `## 🟡 P2 Minor Bugs (${bugs.P2.length})\n\n`;
        bugs.P2.forEach((bug, i) => {
            md += formatBug(bug, i + 1);
        });
        md += `\n---\n\n`;
    }

    // P3 Polish
    if (bugs.P3.length > 0) {
        md += `## 🟢 P3 Polish (${bugs.P3.length})\n\n`;
        bugs.P3.forEach((bug, i) => {
            md += formatBug(bug, i + 1);
        });
    }

    return md;
}

function formatBug(bug, index) {
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

// Run
generateBugsList();
