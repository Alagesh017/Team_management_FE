import fs from 'fs';
import path from 'path';

const indexPath = path.join('dist', 'index.html');
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf8');
  // Remove crossorigin attributes that cause issues with file:// protocol in Electron
  html = html.replace(/ crossorigin/g, '');
  fs.writeFileSync(indexPath, html, 'utf8');
  console.log('Fixed index.html for Electron - removed crossorigin attributes');
} else {
  console.error('dist/index.html not found!');
}
