const fs = require('fs');
const html = fs.readFileSync('src/app/modules/flota/flota.component.html', 'utf8');
const lines = html.split('\n');
let depth = 0;
for(let i=0; i<lines.length; i++) {
  const line = lines[i];
  const openCount = (line.match(/<div[^>]*>/g) || []).length;
  const closeCount = (line.match(/<\/div>/g) || []).length;
  depth += openCount - closeCount;
  if (depth === 2 && closeCount > 0) {
    console.log(`Depth returned to 2 at line ${i+1}`);
  }
}
