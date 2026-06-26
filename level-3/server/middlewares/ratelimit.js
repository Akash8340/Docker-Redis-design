import { redis } from "../index.js";

const rateLimitter = async(req, res, next) => {
    const ip = req.ip;

    const key = `rate_limit:${ip}`;

    const currentCount = await redis.incr(key);

    if(currentCount === 1){
        await redis.expire(key, 60); // Set expiration time of 60 seconds
    }
    if(currentCount > 5){
        return res.status(429).json({
            message: "Too many requests. Please try again later."
        });
    }

    next();
}

export default rateLimitter;
