const fs = require('fs');
const path = require('path');
const { RecursiveCharacterTextSplitter } = require("@langchain/textsplitters");

async function loadAndSplitMarkdownFiles(directory = './docs') {
    try {
        // Check if directory exists
        if (!fs.existsSync(directory)) {
            throw new Error(`Directory ${directory} does not exist`);
        }

        const files = fs.readdirSync(directory);
        const markdownFiles = files.filter(file => file.endsWith('.md'));
        
        if (markdownFiles.length === 0) {
            console.warn(`No markdown files found in ${directory}`);
            return [];
        }

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
            separators: ["\n## ", "\n### ", "\n\n", "\n", " "] // Markdown-aware
          });
        const documents = [];

        for (const file of markdownFiles) {
            const filePath = path.join(directory, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // Extract document type from filename (without .md)
            const docType = file.replace('.md', '');
            
            // Split by main headings (##)
            const sections = content.split(/\n##\s+/).filter(s => s.trim());
            
            // First section is the title/content before first heading
            if (sections.length > 0) {
                const firstSection = sections.shift();
                const chunks = await splitter.splitText(firstSection);
                chunks.forEach(chunk => {
                    documents.push({
                        pageContent: chunk,
                        metadata: {
                            source: file,
                            docType: docType,
                            section: 'introduction'
                        }
                    });
                });
            }

            // Process other sections
            for (const section of sections) {
                const sectionTitle = section.split('\n')[0].trim();
                const sectionContent = section.split('\n').slice(1).join('\n');
                
                const chunks = await splitter.splitText(sectionContent);
                chunks.forEach(chunk => {
                    documents.push({
                        pageContent: chunk,
                        metadata: {
                            source: file,
                            docType: docType,
                            section: sectionTitle
                        }
                    });
                });
            }
        }

        console.log(`Loaded ${documents.length} chunks from ${markdownFiles.length} markdown files`);
        return documents;
    } catch (error) {
        console.error('Error loading markdown files:', error);
        throw error;
    }
}

module.exports = { loadAndSplitMarkdownFiles };