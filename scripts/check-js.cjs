const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const jsRoot = path.join(root, 'src', 'js');

function getJsFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getJsFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

let hasFailure = false;
const files = getJsFiles(jsRoot);

for (const file of files) {
  const code = fs.readFileSync(file, 'utf8');
  try {
    new vm.Script(code, { filename: file });
    console.log('OK', path.relative(root, file));
  } catch (error) {
    hasFailure = true;
    console.error('FAIL', path.relative(root, file));
    console.error(' ', error.message);
  }
}

if (hasFailure) {
  process.exit(1);
}
