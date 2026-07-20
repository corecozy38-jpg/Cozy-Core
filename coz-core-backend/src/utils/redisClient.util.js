import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.REDIS_URL, 
});

export default redis;