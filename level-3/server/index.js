import express from "express";
import dotenv from "dotenv";
import connectDB from "./lib/db.js";
import User from "./models/User_model.js";
import Redis from "ioredis";
import rateLimitter from "./middlewares/ratelimit.js";
import sendEmail from "./lib/sendEmail.js";
import emailQueue from "./queue.js";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
// Connect to the database
connectDB();

// Connect to Redis
export const redis = new Redis(process.env.REDIS_URL);

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json("Hello from redis kaise hai aaplog");
});

/* ----------------------------------------------
    Crating user with redis cache
    -----------------------------------------------*/

app.post("/create", async (req, res) => {
  const { name, email, password } = req.body;

  redis.del("user:all"); // Invalidate the cache when new data is added

  const user = await User.create({
    name,
    email,
    password,
  });

  // Add a job to the email queue to send an email
  await emailQueue.add("send-email", {email})

  return res.json({
    message: "user created Successfully",
    user,
  });
});

/* ----------------------------------------------
    Fetching all users without redis cache with rate limit middleware
    -----------------------------------------------*/
app.get("/get", rateLimitter, async (req, res) => {
  const users = await User.find({});

  return res.json({
    message: "All users fetched Successfully",
    users,
  });
});

/* ----------------------------------------------
    Fetching data from redis cache if available
    -----------------------------------------------*/

app.get("/get-with-redis", async (req, res) => {
  const cached = await redis.get("user:all");

  if (cached) {
    return res.json({
      message: "All users fetched Successfully from cache",
      users: JSON.parse(cached),
    });
  }

  const users = await User.find({});

  await redis.set("user:all", JSON.stringify(users));

  return res.json({
    message: "All users fetched Successfully",
    users,
  });
});

/* ----------------------------------------------
 otp generation,storing and verification in redis
 -----------------------------------------------*/

app.post("/send-otp", async (req, res) => {
    const {email} = req.body;

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

    await redis.set(`otp:${email}`, otp, "EX", 300); // Store OTP in Redis and will expire in 5 minutes (300 seconds)

    return res.status(200).json({
        message: "OTP sent successfully",
        otp // In a real application, you would send this OTP via email or SMS
    });
})

app.get("/verify-otp", async (req, res) => {
    const {email,otp} = req.body;

    const cachedOtp = await redis.get(`otp:${email}`);

    if(!cachedOtp || cachedOtp !== otp){
        return res.status(404).json({
            message: "OTP not found or expired"
        });
    }
    // OTP is valid, delete it from Redis
    await redis.del(`otp:${email}`);
    return res.status(200).json({
        message: "OTP verified successfully",
        otp
    });

})

/* ----------------------------------------------
    Start the server
    -----------------------------------------------*/

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
