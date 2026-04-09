import Redis from "ioredis";
import logger from "./logger.js";

const redis = new Redis({
  host: "redis-13282.c321.us-east-1-2.ec2.cloud.redislabs.com",
  port: 13282,
  password: "IypX3EAu6XT1UjcT18MekPlJRXyH8baY",
});

redis.on("connect", () => {
  logger.info("✅ Redis connected");
});

redis.on("error", (err) => {
  logger.error(`❌ Redis error: ${err?.message || JSON.stringify(err)}`);
});

export default redis;
