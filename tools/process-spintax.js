const fs = require('fs');
const path = require('path');
const toml = require('toml');
const yaml = require('js-yaml');

// Cari config.toml ATAU hugo.toml (repo ini punya keduanya) naik ke direktori induk.
function findConfigFile(startPath) {
  let currentPath = startPath;
  while (currentPath !== path.parse(currentPath).root) {
    for (const name of ['hugo.toml', 'config.toml']) {
      const p = path.join(currentPath, name);
      if (fs.existsSync(p)) return p;
    }
    currentPath = path.dirname(currentPath);
  }
  return null;
}

function processSpintax(text) {
  if (typeof text !== 'string') return text;
  const regex = /\{([^{}]+)\}/g;
  let result = text;
  let match;
  while ((match = regex.exec(result)) !== null) {
    const options = match[1].split('|');
    const replacement = options[Math.floor(Math.random() * options.length)];
    result = result.substring(0, match.index) + replacement + result.substring(match.index + match[0].length);
    regex.lastIndex = 0;
  }
  return result;
}

try {
  const configPath = findConfigFile(__dirname);
  if (!configPath) throw new Error('config.toml / hugo.toml tidak ditemukan.');
  console.log(`Menggunakan konfigurasi: ${configPath}`);

  const config = toml.parse(fs.readFileSync(configPath, 'utf8'));
  const processed = config.params.testimonials.map(t => ({
    ...t,
    name: processSpintax(t.name),
    message: processSpintax(t.message),
    response: processSpintax(t.response),
  }));

  const dataDir = path.join(path.dirname(configPath), 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'testimonials.yaml'), yaml.dump({ testimonials: processed }));
  console.log('Testimonials diproses dan data/testimonials.yaml berhasil dibuat.');
} catch (error) {
  console.error('Terjadi kesalahan:', error.message);
  process.exit(1);
}
