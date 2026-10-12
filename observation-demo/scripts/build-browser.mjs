import fs from 'node:fs';
import path from 'node:path';

const dist = 'dist';
const out = 'browser-dist';
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);
let html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
const nIcons = html.split('/icons/').length - 1;
const nDesign = html.split('/design/').length - 1;
html = html.replaceAll('/icons/', 'icons/').replaceAll('/design/', 'design/');
fs.writeFileSync(path.join(out, 'index.html'), html);
fs.cpSync(path.join(dist, 'icons'), path.join(out, 'icons'), { recursive: true });
fs.cpSync(path.join(dist, 'design'), path.join(out, 'design'), { recursive: true });
const leftover = (html.match(/"(\/(icons|design))\//g) || []).length;
console.log(`refs rewritten: /icons/ x${nIcons}, /design/ x${nDesign}; leftover absolute: ${leftover}`);
