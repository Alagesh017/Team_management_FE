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

// Copy .htaccess file to dist directory for server deployment
const htaccessSrc = '.htaccess';
const htaccessDest = path.join('dist', '.htaccess');
if (fs.existsSync(htaccessSrc)) {
  fs.copyFileSync(htaccessSrc, htaccessDest);
  console.log('Copied .htaccess file to dist directory');
} else {
  console.warn('.htaccess file not found in root directory');
}
