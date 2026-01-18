const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

const excludeDirs = ['node_modules', '.next', 'dist', '.git', 'scripts'];
const extensions = ['.ts', '.tsx', '.js', '.jsx'];

function removeComments(code, filePath) {
    let result = code;

    const isJSX = filePath.endsWith('.tsx') || filePath.endsWith('.jsx');

    result = result.replace(/\/\*[\s\S]*?\*\//g, '');

    const lines = result.split('\n');
    const newLines = [];

    for (let line of lines) {
        let inString = false;
        let stringChar = '';
        let commentStart = -1;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            const prevChar = i > 0 ? line[i - 1] : '';

            if (!inString && (char === '"' || char === "'" || char === '`')) {
                inString = true;
                stringChar = char;
            } else if (inString && char === stringChar && prevChar !== '\\') {
                inString = false;
                stringChar = '';
            } else if (!inString && char === '/' && line[i + 1] === '/') {
                const beforeComment = line.substring(0, i).trim();
                if (beforeComment.length === 0 || !beforeComment.match(/https?:$/)) {
                    commentStart = i;
                    break;
                }
            }
        }

        if (commentStart !== -1) {
            const trimmedBefore = line.substring(0, commentStart).trimEnd();
            if (trimmedBefore.length > 0) {
                newLines.push(trimmedBefore);
            }
        } else {
            newLines.push(line);
        }
    }

    result = newLines.join('\n');

    result = result.replace(/^\s*[\r\n]/gm, '');
    result = result.replace(/\n{3,}/g, '\n\n');

    return result;
}

function walkDir(dir) {
    let files = [];

    try {
        const items = fs.readdirSync(dir);

        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                if (!excludeDirs.includes(item)) {
                    files = files.concat(walkDir(fullPath));
                }
            } else if (stat.isFile()) {
                const ext = path.extname(item);
                if (extensions.includes(ext)) {
                    files.push(fullPath);
                }
            }
        }
    } catch (err) {
        console.error(`Error reading directory ${dir}:`, err.message);
    }

    return files;
}

console.log('🔍 Recherche des fichiers...');
const files = walkDir(projectRoot);
console.log(`📁 ${files.length} fichiers trouvés\n`);

let totalCommentsRemoved = 0;

for (const file of files) {
    try {
        const content = fs.readFileSync(file, 'utf-8');
        const cleaned = removeComments(content, file);

        if (content !== cleaned) {
            fs.writeFileSync(file, cleaned, 'utf-8');
            const relativePath = path.relative(projectRoot, file);
            console.log(`✅ ${relativePath}`);
            totalCommentsRemoved++;
        }
    } catch (err) {
        console.error(`❌ Erreur avec ${file}:`, err.message);
    }
}

console.log(`\n🎉 Terminé! ${totalCommentsRemoved} fichiers modifiés.`);
