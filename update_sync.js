const fs = require('fs');

let sync = fs.readFileSync('sync.js', 'utf8');

const contentBlock = `
const contentDir = path.join(vaultPath, "Content");
let contentItems = [];
if (fs.existsSync(contentDir)) {
    const contentFiles = fs.readdirSync(contentDir).filter(f => f.endsWith(".md") && !f.startsWith("_"));
    const contentRaw = contentFiles.map(f => ({ file: f, data: parseYAML(path.join(contentDir, f)) }));
    contentItems = contentRaw.filter(c => c.data).map(c => c.data);
}
`;

sync = sync.replace('// Read existing HTML and preserve inventory/sales', contentBlock + '\n// Read existing HTML and preserve inventory/sales');
sync = sync.replace('let initialData = { tasks: [], clients: [], inventory: {}, sales: [] };', 'let initialData = { tasks: [], clients: [], content: [], inventory: {}, sales: [] };');
sync = sync.replace('initialData.clients = clientsMapped;', 'initialData.clients = clientsMapped;\ninitialData.content = contentItems;');
sync = sync.replace('console.log(`  Tasks: ${tasks.length} | Clients: ${clientsMapped.length}`);', 'console.log(`  Tasks: ${tasks.length} | Clients: ${clientsMapped.length} | Content: ${contentItems.length}`);');

fs.writeFileSync('sync.js', sync, 'utf8');
