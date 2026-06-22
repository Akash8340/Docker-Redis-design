import express from "express";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.get("/", (req, res) => {
  res.status(200).json("Hello from phase-2 backend");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


