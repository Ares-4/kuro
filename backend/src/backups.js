import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { fileURLToPath } from 'url';
import { CONFIG } from './config.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const s3Configured = CONFIG.aws.accessKeyId && CONFIG.aws.secretAccessKey && CONFIG.aws.backupBucket;

let s3Client = null;
if (s3Configured) {
  s3Client = new S3Client({
    region: CONFIG.aws.region,
    credentials: {
      accessKeyId: CONFIG.aws.accessKeyId,
      secretAccessKey: CONFIG.aws.secretAccessKey
    }
  });
}

export const backupDatabase = async () => {
  if (!s3Configured) {
    console.warn('S3 credentials missing; skipping automated backup.');
    return { status: 'skipped' };
  }

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
