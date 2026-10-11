const fs = require('node:fs');
const crypto = require('node:crypto');
const assets = ['index.html','style.css','app.js','data.js','view.js','manifest.json','icon.svg','180.png','192.png','512.png','vendor/chart.umd.min.js','fonts/dm-sans-400.woff2','fonts/dm-sans-600.woff2','fonts/dm-serif-display-400.woff2'];
const hash = crypto.createHash('sha256'); assets.forEach(file => hash.update(fs.readFileSync(file)));
const template = fs.readFileSync('scripts/sw.template.js','utf8');
fs.writeFileSync('sw.js',template.replace('__VERSION__',hash.digest('hex').slice(0,12)).replace('__ASSETS__',JSON.stringify(['./',...assets])));
console.log(`Prepared offline cache for ${assets.length + 1} app resources.`);
