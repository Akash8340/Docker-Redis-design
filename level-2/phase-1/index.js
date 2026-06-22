import express from "express";
import dotenv from "dotenv";
import connectDB from "./lib/db.js";
import User from "./models/User_model.js";
import Redis from "ioredis";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();
// Connect to the database
connectDB();

// Connect to Redis
const redis = new Redis(process.env.REDIS_URL);

app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json("Hello from redis kaise hai aaplog");
});

app.post("/create", async (req, res) => {
  const { name, email, password } = req.body;

  redis.del("user:all"); // Invalidate the cache when new data is added

  const user = await User.create({
    name,
    email,
    password,
  });

  return res.json({
    message: "user created Successfully",
    user,
  });
});

app.get("/get", async (req, res) => {
  const users = await User.find({});

  return res.json({
    message: "All users fetched Successfully",
    users,
  });
});

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
