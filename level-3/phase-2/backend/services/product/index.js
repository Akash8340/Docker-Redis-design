import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.get("/", (req, res) => {
  res.send("Hello from Product Service");
});

const PORT = process.env.PORT || 8001;  

app.listen(PORT, () => {
  console.log(`Auth service is running on port ${PORT}`);
});  