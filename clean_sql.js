const fs = require('fs');
const filePath = 'database-schema.sql';

try {
    const content = fs.readFileSync(filePath, 'utf8');
    const newContent = content.split('\n')
        .map(line => {
            // Remove text after -- (including --)
            const idx = line.indexOf('--');
            if (idx >= 0) {
                return line.substring(0, idx);
            }
            return line;
        })
        .filter(line => line.trim().length > 0) // Remove empty lines
        .join('\n');

    fs.writeFileSync(filePath, newContent);
    console.log('Successfully removed comments from ' + filePath);
} catch (error) {
    console.error('Error processing file:', error);
    process.exit(1);
}
