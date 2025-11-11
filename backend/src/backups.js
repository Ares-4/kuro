import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CONFIG } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const s3Configured = CONFIG.aws.accessKeyId && CONFIG.aws.secretAccessKey && CONFIG.aws.backupBucket;

let s3ModulePromise = null;

const loadS3Module = () => {
  if (!s3ModulePromise) {
    s3ModulePromise = import('@aws-sdk/client-s3').catch((error) => {
      console.warn('Failed to load AWS SDK; skipping automated backup.', error.message);
      return null;
    });
  }

  return s3ModulePromise;
};

export const backupDatabase = async () => {
  if (!s3Configured) {
    console.warn('S3 credentials missing; skipping automated backup.');
    return { status: 'skipped' };
  }

  const s3Module = await loadS3Module();
  if (!s3Module) {
    return { status: 'skipped' };
  }

  const { S3Client, PutObjectCommand } = s3Module;
  if (!S3Client || !PutObjectCommand) {
    console.warn('AWS SDK module is unavailable; skipping automated backup.');
    return { status: 'skipped' };
  }

  const s3Client = new S3Client({
    region: CONFIG.aws.region,
    credentials: {
      accessKeyId: CONFIG.aws.accessKeyId,
      secretAccessKey: CONFIG.aws.secretAccessKey
    }
  });

  const dbPath = path.join(__dirname, '..', 'data', 'clients.sqlite');
  const stream = fs.createReadStream(dbPath);
  const key = `clients-backups/clients-${new Date().toISOString()}.sqlite`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: CONFIG.aws.backupBucket,
      Key: key,
      Body: stream
    })
  );

  return { status: 'success', key };
};
