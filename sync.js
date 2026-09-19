const fs = require("fs");
const path = require("path");

const vaultPath = "C:/Users/Usuario/Documents/Xiembra Vault";
const htmlPath = path.join("C:/Users/Usuario/Documents/xiembra-controlcenter", "control-center.html");

function parseYAML(filePath) {
    // Read as binary buffer first, and handle UTF-8 BOM
    const buf = fs.readFileSync(filePath);
    let content;
    // Check for UTF-8 BOM or valid UTF-8
    if (buf[0] === 0xEF && buf[1] === 0xBB && buf[2] === 0xBF) {
        content = buf.toString("utf-8").substring(1); // skip BOM
    } else {
        content = buf.toString("utf-8");
    }
    content = content.replace(/\r\n/g, "\n");
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;
    const yamlLines = match[1].split("\n");
    const obj = {};
    let lastKey = null;
    for (let line of yamlLines) {
        if (!line.trim() || line.startsWith("#")) continue;
        const colIdx = line.indexOf(":");
        if (colIdx > -1) {
            const key = line.substring(0, colIdx).trim();
            let val = line.substring(colIdx + 1).trim();
            if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
            else if (val === "true") val = true;
            else if (val === "false") val = false;
            else if (val === "null") val = null;
            else if (val === "") val = "";
            else if (val === "[]") val = [];
            else if (!isNaN(Number(val))) val = Number(val);
            obj[key] = val;
            lastKey = key;
        } else if (line.trim().startsWith("- ") && lastKey && Array.isArray(obj[lastKey])) {
            let item = line.trim().substring(2).trim();
            if (item.startsWith('"') && item.endsWith('"')) item = item.slice(1, -1);
            obj[lastKey].push(item);
        }
    }
    // Add arrays if not present but needed
    if (obj.tags === '[]') obj.tags = [];
    if (obj.dependencias === '[]') obj.dependencias = [];
    return obj;
}

const tasksDir = path.join(vaultPath, "Tareas");
const tasksFiles = fs.readdirSync(tasksDir).filter(f => f.endsWith(".md") && !f.startsWith("_"));
const tasksRaw = tasksFiles.map(f => ({ file: f, data: parseYAML(path.join(tasksDir, f)) }));
const tasksFailed = tasksRaw.filter(t => !t.data);
const tasks = tasksRaw.filter(t => t.data).map(t => t.data);
console.log(`Tasks parsed: ${tasks.length} of ${tasksFiles.length} files`);
if (tasksFailed.length > 0) {
    console.warn(`WARNING: ${tasksFailed.length} task files failed to parse:`);
    tasksFailed.forEach(t => console.warn(`  - ${t.file}`));
}

const clientsDir = path.join(vaultPath, "Clientes B2B");
const clientsFiles = fs.readdirSync(clientsDir).filter(f => f.endsWith(".md") && !f.startsWith("_"));
const clientsRaw = clientsFiles.map(f => ({ file: f, data: parseYAML(path.join(clientsDir, f)) }));
const clientsFailed = clientsRaw.filter(c => !c.data);
const clientes = clientsRaw.filter(c => c.data).map(c => c.data);
console.log(`Clients parsed: ${clientes.length} of ${clientsFiles.length} files`);
if (clientsFailed.length > 0) {
    console.warn(`WARNING: ${clientsFailed.length} client files failed to parse:`);
    clientsFailed.forEach(c => console.warn(`  - ${c.file}`));
}

// Read existing HTML and preserve inventory/sales
let html = fs.readFileSync(htmlPath, "utf-8");
const dataMatch = html.match(/const INITIAL_DATA = (\{[\s\S]*?\});/);
let initialData = { tasks: [], clients: [], inventory: {}, sales: [] };
if (dataMatch) {
    try {
        initialData = JSON.parse(dataMatch[1]);
    } catch(e) {}
}

// Map vault etapa_pipeline values to frontend etapa values
// Use accent-stripped keys for robustness against encoding issues
function stripAccents(s) {
    return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}
const etapaMap = {
    "prospeccion": "prospeccion",
    "contactado": "contactado",
    "visita agendada": "visita_agendada",
    "muestra entregada": "muestra_entregada",
    "negociacion": "en_negociacion",
    "cerrado": "cerrado"
};

// Transform clients: rename etapa_pipeline -> etapa with mapped values
const clientsMapped = clientes.map(c => {
    const mapped = { ...c };
    if (mapped.etapa_pipeline) {
        const normalized = stripAccents(mapped.etapa_pipeline);
        mapped.etapa = etapaMap[normalized] || mapped.etapa_pipeline;
        delete mapped.etapa_pipeline;
    }
    return mapped;
});

// Keep existing inventory/sales from the current INITIAL_DATA
initialData.tasks = tasks;
initialData.clients = clientsMapped;  // frontend expects "clients", not "clientes"
delete initialData.clientes;          // remove stale key if present

const newJSON = JSON.stringify(initialData, null, 4);
html = html.replace(/const INITIAL_DATA = \{[\s\S]*?\};/, `const INITIAL_DATA = ${newJSON};`);
fs.writeFileSync(htmlPath, html);
console.log("INITIAL_DATA synced successfully.");
console.log(`  Tasks: ${tasks.length} | Clients: ${clientsMapped.length}`);
