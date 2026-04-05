import chokidar from 'chokidar';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import kleur from 'kleur';

// Obtener la ruta del directorio actual (ESM)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar configuración
const configPath = path.join(__dirname, 'sync-config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const { oneDriveRoot, syncRules, settings } = config;

console.log(kleur.bold().cyan('\n🚀 BioMed Sync Watcher iniciado'));
console.log(kleur.gray(`📂 Vigilando: ${oneDriveRoot}\n`));

// Mapa para el debounce de archivos
const pendingChanges = new Map();

const watcher = chokidar.watch(oneDriveRoot, {
  ignored: /(^|[\/\\])\../, // ignorar archivos ocultos
  persistent: true,
  ignoreInitial: settings.ignoreInitial,
  awaitWriteFinish: {
    stabilityThreshold: settings.debounceMs,
    pollInterval: 100
  }
});

watcher.on('change', (filePath) => {
  const fileName = path.basename(filePath);
  if (fileName.startsWith('~$')) return; // Ignorar archivos temporales de Excel

  console.log(kleur.yellow(`\n🔔 Cambio detectado: ${kleur.white(fileName)}`));
  
  // Encontrar la regla que coincide
  const relativePath = path.relative(oneDriveRoot, filePath).replace(/\\/g, '/');
  const rule = syncRules.find(r => {
    if (r.isRegex) {
      const regex = new RegExp(r.pattern);
      return regex.test(relativePath);
    }
    return relativePath === r.pattern;
  });

  if (rule) {
    console.log(kleur.blue(`📦 Aplicando regla: ${kleur.bold(rule.name)}`));
    executeSync(rule, filePath);
  } else {
    console.log(kleur.gray(`ℹ️ El archivo ${relativePath} no coincide con ninguna regla activa.`));
  }
});

function executeSync(rule, filePath) {
  const fullCommand = `${rule.command} "${filePath}"`;
  console.log(kleur.magenta(`⚙️ Ejecutando: ${kleur.italic(fullCommand)}`));

  exec(fullCommand, (error, stdout, stderr) => {
    if (error) {
      console.log(kleur.red(`\n❌ Error en ${rule.name}:`));
      console.error(error.message);
      return;
    }
    if (stderr && !stderr.includes('Warning')) {
      console.log(kleur.red(`\n⚠️ Alerta en ${rule.name}:`));
      console.error(stderr);
    }
    
    console.log(kleur.gray('--- Salida del script ---'));
    console.log(stdout.trim());
    console.log(kleur.green(`\n✅ Sincronización de ${rule.name} finalizada.`));
  });
}

watcher.on('error', error => console.log(kleur.red(`Watcher error: ${error}`)));
