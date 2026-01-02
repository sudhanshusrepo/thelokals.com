const fs = require('fs');
const path = require('path');

const FORBIDDEN_PATTERNS = [
    'DUMMY',
    'MOCK_DATA',
    'lorem ipsum',
    'John Doe',
    'Test User',
    '1234567890' // Generic fake phone
];

const IGNORE_DIRS = ['node_modules', '.next', '.git', 'dist', 'build', 'public'];
const IGNORE_FILES = ['check-dummy-data.js', 'package-lock.json', 'yarn.lock', 'README.md', 'task.md', 'implementation_plan.md'];

function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const errors = [];

    FORBIDDEN_PATTERNS.forEach(pattern => {
        if (content.includes(pattern)) {
            // Allow if it's in a comment explicitly marked as SAFE or TODO
            // Simple check: finding the line
            const lines = content.split('\n');
            lines.forEach((line, index) => {
                if (line.includes(pattern)) {
                    if (!line.includes('SAFE_IGNORE') && !line.includes('check-dummy-data')) {
                        errors.push({ pattern, line: index + 1, content: line.trim() });
                    }
                }
            });
        }
    });

    return errors;
}

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        const dirPath = path.join(dir, f);
        const isDirectory = fs.statSync(dirPath).isDirectory();

        if (isDirectory) {
            if (!IGNORE_DIRS.includes(f)) {
                walkDir(dirPath, callback);
            }
        } else {
            if (!IGNORE_FILES.includes(f) && !f.endsWith('.map') && !f.endsWith('.ico') && !f.endsWith('.png') && !f.endsWith('.jpg')) {
                callback(dirPath);
            }
        }
    });
}

console.log('🔍 Scanning for dummy data...');
let hasErrors = false;

walkDir('./src', (filePath) => {
    const errors = scanFile(filePath);
    if (errors.length > 0) {
        console.error(`\n❌ Found dummy data in ${filePath}:`);
        errors.forEach(e => {
            console.error(`   Line ${e.line}: Found "${e.pattern}" -> ${e.content}`);
        });
        hasErrors = true;
    }
});

if (hasErrors) {
    console.error('\n🚫 Scan failed! Please remove dummy data or mark with SAFE_IGNORE.');
    process.exit(1);
} else {
    console.log('✅ No dummy data found.');
    process.exit(0);
}
