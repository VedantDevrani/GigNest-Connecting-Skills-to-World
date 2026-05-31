const fs = require('fs');
const path = require('path');

const filesToUpdate = [
    'app/freelancer/proposals/page.tsx',
    'app/freelancer/settings/page.tsx',
    'app/freelancer/earnings/page.tsx',
    'app/freelancer/jobs/[id]/page.tsx',
    'app/freelancer/jobs/page.tsx',
    'app/freelancer/dashboard/page.tsx',
    'app/client/dashboard/page.tsx',
    'app/client/jobs/create/page.tsx',
    'app/client/jobs/[id]/page.tsx',
    'app/client/freelancers/page.tsx',
    'app/client/settings/page.tsx',
];

const basePath = path.join(__dirname);

filesToUpdate.forEach(relativePath => {
    const fullPath = path.join(basePath, relativePath);
    if (!fs.existsSync(fullPath)) return;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if PageLoader is already imported
    if (!content.includes('PageLoader')) {
        // Find last import statement
        const importRegex = /^import\s+.*?;?\s*$/gm;
        let lastMatch;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            lastMatch = match;
        }
        
        if (lastMatch) {
            const insertPos = lastMatch.index + lastMatch[0].length;
            content = content.slice(0, insertPos) + '\nimport { PageLoader } from \'@/components/ui/PageLoader\';' + content.slice(insertPos);
        } else {
            content = 'import { PageLoader } from \'@/components/ui/PageLoader\';\n' + content;
        }
    }

    // Replace various "if (loading) return <div ..." with PageLoader
    content = content.replace(
        /if\s*\(\s*loading\s*\)\s*return\s*<div[^>]*>Loading([^<]*)<\/div>\s*;/g,
        (match, text) => {
            let cleanText = text.trim();
            if (cleanText.startsWith('...')) cleanText = cleanText.substring(3).trim();
            return `if (loading) return <PageLoader text="Loading ${cleanText}" />;`;
        }
    );
    
    // Also catch any exact matches for typical freelancer/client texts if regex misses
    content = content.replace(/<div className="p-8 text-center text-gray-500">Loading.*?<\/div>/g, '<PageLoader text="Loading..." />');
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${relativePath}`);
});
