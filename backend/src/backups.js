import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.join(__dirname, '..', 'data');
const backupDir = path.join(__dirname, '..', 'backups');

export const backupDatabase = async () => {
  await fs.promises.mkdir(backupDir, { recursive: true });
  const source = path.join(dataDir, 'clients.json');
  const destination = path.join(backupDir, `clients-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);

  try {
    await fs.promises.copyFile(source, destination);
    return { status: 'success', path: destination };
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.warn('No database file to back up yet.');
      return { status: 'skipped' };
    }

    throw error;
  }
};
