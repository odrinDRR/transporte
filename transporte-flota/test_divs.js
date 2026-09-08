const fs = require('fs');
const html = fs.readFileSync('src/app/modules/flota/flota.component.html', 'utf8');
const lines = html.split('\n');
let depth = 0;
for(let i=0; i<lines.length; i++) {
  const line = lines[i];
  const openCount = (line.match(/<div[^>]*>/g) || []).length;
  const closeCount = (line.match(/<\/div>/g) || []).length;
  depth += openCount - closeCount;
  if (i === 360) console.log(`Depth at 360: ${depth}`);
  if (i === 389) console.log(`Depth at 389: ${depth}`);
  if (i === 474) console.log(`Depth at 474: ${depth}`);
}
console.log(`Final depth: ${depth}`);
