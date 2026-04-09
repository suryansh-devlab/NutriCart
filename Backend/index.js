import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import connectDb from "./src/config/db/db.js";

dotenv.config({
  path: "./.env",
});

const app = express();

app.use(cors());
app.use(express.json());

connectDb();

app.get("/api/test", (req, res) => {
  res.json({
    message: "Backend is working 🚀",
  });
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
