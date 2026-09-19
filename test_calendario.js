const fs = require('fs');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const html = fs.readFileSync('control-center.html', 'utf8');

// Use JSDOM to parse and run the HTML
const dom = new JSDOM(html, { runScripts: "dangerously" });
setTimeout(() => {
    try {
        const window = dom.window;
        window.switchView('calendario');
        
        const countEl = window.document.getElementById('count-content-idea');
        console.log('Count IDEA:', countEl ? countEl.textContent : 'Not found');
        
        const col = window.document.getElementById('col-content-idea');
        console.log('Cards in IDEA:', col ? col.children.length : 'Col not found');
        
        if (col && col.children.length > 0) {
            console.log('Card text:', col.children[0].textContent.trim().replace(/\s+/g, ' '));
        }
    } catch (e) {
        console.error(e);
    }
}, 500);
