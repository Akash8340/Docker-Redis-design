import express from "express";
import dotenv from "dotenv";
import proxy from "express-http-proxy";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8001;  

app.get("/", (req, res) => {
  res.send("Hello from Backend or Gateway");
});


app.use("/auth", proxy("http://localhost:8001/"));
app.use("/order", proxy("http://localhost:8002/"));
app.use("/product", proxy("http://localhost:8003/"));


app.listen(PORT, () => {
  console.log(`Auth service is running on port ${PORT}`);
});  