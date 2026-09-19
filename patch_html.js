const fs = require('fs');
let html = fs.readFileSync('control-center.html', 'utf8');

// 1. initialData schema
html = html.replace('let appData = { tasks: [], clients: [], inventory: {}, sales: [] };', 'let appData = { tasks: [], clients: [], content: [], inventory: {}, sales: [] };');

// 2. Insert renderCalendario() into renderAll
if (!html.includes('renderCalendario()')) {
  html = html.replace('renderVentas();\n      }', 'renderVentas();\n      renderCalendario();\n      }');
}

// 3. Replace the entire section id="view-calendario"
const startStr = '<section id="view-calendario"';
const endStr = '</section>';
let startIdx = html.indexOf(startStr);
let endIdx = html.indexOf(endStr, startIdx) + endStr.length;

const newSection = `
      <section id="view-calendario" class="view-pane space-y-6 hidden">
        <div class="bg-brand-surface p-6 rounded-2xl border border-brand-border shadow-card">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h4 class="font-display font-bold text-lg text-brand-textMain">📅 Calendario de Contenido (Instagram)</h4>
              <p class="text-sm text-brand-textMuted mt-1">Gestión simplificada para Roger — Desde Ideas hasta Publicado</p>
            </div>
          </div>
        </div>
        <div id="content-kanban-view" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-brand-surface rounded-2xl border border-brand-border flex flex-col h-[600px]">
            <div class="p-4 border-b border-brand-borderLight flex items-center justify-between bg-amber-50 rounded-t-2xl">
              <h5 class="font-bold text-amber-800 flex items-center gap-2">💡 IDEA</h5>
              <span id="count-content-idea" class="text-xs font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded-full">0</span>
            </div>
            <div id="col-content-idea" class="p-3 flex-1 overflow-y-auto space-y-3 bg-brand-arena/20"></div>
          </div>
          <div class="bg-brand-surface rounded-2xl border border-brand-border flex flex-col h-[600px]">
            <div class="p-4 border-b border-brand-borderLight flex items-center justify-between bg-blue-50 rounded-t-2xl">
              <h5 class="font-bold text-blue-800 flex items-center gap-2">📝 LISTO</h5>
              <span id="count-content-listo" class="text-xs font-bold text-blue-900 bg-blue-200 px-2 py-0.5 rounded-full">0</span>
            </div>
            <div id="col-content-listo" class="p-3 flex-1 overflow-y-auto space-y-3 bg-brand-arena/20"></div>
          </div>
          <div class="bg-brand-surface rounded-2xl border border-brand-border flex flex-col h-[600px]">
            <div class="p-4 border-b border-brand-borderLight flex items-center justify-between bg-emerald-50 rounded-t-2xl">
              <h5 class="font-bold text-emerald-800 flex items-center gap-2">✅ PUBLICADO</h5>
              <span id="count-content-publicado" class="text-xs font-bold text-emerald-900 bg-emerald-200 px-2 py-0.5 rounded-full">0</span>
            </div>
            <div id="col-content-publicado" class="p-3 flex-1 overflow-y-auto space-y-3 bg-brand-arena/20"></div>
          </div>
        </div>
      </section>
`;

html = html.substring(0, startIdx) + newSection.trim() + html.substring(endIdx);

// 4. Update titles map in switchView
html = html.replace("calendario: ['Calendario Operativo', 'Cronograma de visitas comerciales y fechas límites']", "calendario: ['Calendario de Contenido', 'Gestión de posts para Instagram y redes']");

// 5. Append renderCalendario() function before closing script
const renderFn = `
      function renderCalendario() {
        const posts = (appData.content || []).filter(p => p.tipo === 'contenido');
        const states = ['idea', 'listo', 'publicado'];
        states.forEach(st => {
          const list = posts.filter(p => p.estado === st);
          const countEl = document.getElementById('count-content-' + st);
          if (countEl) countEl.textContent = list.length;
          
          const col = document.getElementById('col-content-' + st);
          if (!col) return;
          col.innerHTML = '';
          
          list.forEach(p => {
            const card = document.createElement('div');
            card.className = "bg-brand-surface p-4 rounded-xl border border-brand-borderLight shadow-sm hover:shadow-md transition";
            card.innerHTML = \`
              <div class="flex items-start justify-between">
                <div class="flex items-center gap-1.5 text-[10px] font-bold text-brand-textMuted uppercase">
                  \${p.formato || 'post'}
                  <span class="mx-1">•</span>
                  \${p.pilar || 'general'}
                </div>
                \${p.fecha_publicacion ? \`<span class="text-[10px] font-bold bg-brand-crema/60 text-brand-campo px-2 py-0.5 rounded-full border border-brand-lemon/30">\${p.fecha_publicacion}</span>\` : ''}
              </div>
              <h5 class="font-display font-bold text-sm text-brand-textMain mt-2 leading-tight">\${p.titulo || 'Sin Título'}</h5>
              \${p.copy_corto ? \`<p class="text-xs text-brand-textMuted mt-2 italic line-clamp-2">"\${p.copy_corto}"</p>\` : ''}
            \`;
            col.appendChild(card);
          });
        });
      }
`;

if (!html.includes('function renderCalendario()')) {
  html = html.replace('// INIT AND GLOBAL LISTENERS', renderFn + '\n\n      // INIT AND GLOBAL LISTENERS');
}

fs.writeFileSync('control-center.html', html, 'utf8');
