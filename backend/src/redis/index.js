import 'dotenv/config';
import IORedis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const makeClient = (name) => {
  const client = new IORedis(REDIS_URL, {
    maxRetriesPerRequest: null,   // required by BullMQ
    enableReadyCheck: false,
    lazyConnect: false,
  });
  client.on('connect',  () => console.log(`[Redis:${name}] connected`));
  client.on('error',    (e) => console.error(`[Redis:${name}] error:`, e.message));
  client.on('close',    () => console.warn(`[Redis:${name}] connection closed`));
  return client;
};

// Used by BullMQ Queue + Worker
export const bullConnection = makeClient('bull');

// Worker → publishes pipeline events
export const publisher = makeClient('pub');

// WebSocket server → subscribes to pipeline events
export const subscriber = makeClient('sub');

/** Channel name for a given chatId */
export const buildChannel = (chatId) => `build:${chatId}`;






