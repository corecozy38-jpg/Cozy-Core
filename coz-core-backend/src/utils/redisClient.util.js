import { createClient } from 'redis';
import { configDotenv } from "dotenv";
configDotenv();

const redisClient = createClient({
  url: process.env.REDIS_URL
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log(' Connected to Redis'));

await redisClient.connect();
export default redisClient;