import { Redis } from '@upstash/redis';

const redisUrl = process.env.REDIS_URL;
const redisToken = process.env.REDIS_TOKEN;

if (!redisUrl || !redisToken) {
  console.error('Missing Upstash REST URL or Token. Check environment variables.');
}

const redis = new Redis({
  url: redisUrl,
  token: redisToken,
});

export default redis;