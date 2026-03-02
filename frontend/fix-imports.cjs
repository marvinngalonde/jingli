const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    fs.readdirSync(dir).forEach(file => {
        filelist = fs.statSync(path.join(dir, file)).isDirectory()
            ? walkSync(path.join(dir, file), filelist)
            : filelist.concat(path.join(dir, file));
    });
    return filelist;
};

const pagesDir = path.join(__dirname, 'src', 'pages');
const files = walkSync(pagesDir).filter(f => f.endsWith('.tsx') || f.endsWith('.ts'));

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(pagesDir, file);
    const depth = relativePath.split(path.sep).length - 1;

    if (depth > 0) {
        // If file is in a subdirectory like 'admin/' or 'teacher/portal/'
        const extraDots = '../'.repeat(depth);
        let modified = false;

        // Replace imports like '../../services/' with dynamically calculated ones
        // Since we moved from src/pages to src/pages/folder, we add extra '../'
        const regexes = [
            /(from\s+['"])(?:\.\.\/)*components\//g,
            /(from\s+['"])(?:\.\.\/)*services\//g,
            /(from\s+['"])(?:\.\.\/)*context\//g,
            /(from\s+['"])(?:\.\.\/)*utils\//g,
            /(from\s+['"])(?:\.\.\/)*assets\//g,
            /(from\s+['"])(?:\.\.\/)*hooks\//g,
            /(from\s+['"])(?:\.\.\/)*types\//g,
            /(from\s+['"])(?:\.\.\/)*layouts\//g,
        ];

        const replacements = [
            `$1${extraDots}../components/`,
            `$1${extraDots}../services/`,
            `$1${extraDots}../context/`,
            `$1${extraDots}../utils/`,
            `$1${extraDots}../assets/`,
            `$1${extraDots}../hooks/`,
            `$1${extraDots}../types/`,
            `$1${extraDots}../layouts/`,
        ];

        regexes.forEach((regex, i) => {
            if (regex.test(content)) {
                content = content.replace(regex, replacements[i]);
                modified = true;
            }
        });

        if (modified) {
            fs.writeFileSync(file, content);
            console.log(`Updated imports in: ${relativePath}`);
        }
    }
});
