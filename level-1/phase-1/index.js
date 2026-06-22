import express from "express";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 3000;

const app = express();

app.get("/", (req, res) => {
  return res.status(200).json({ message: "Working fine Docker learning" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})