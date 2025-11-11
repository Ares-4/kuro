import { init } from './db.js';

init()
  .then(() => {
    console.log('Database ready.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed to initialise database', error);
    process.exit(1);
  });
